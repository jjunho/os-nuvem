import webpush from "web-push";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "~/db/client.server";
import { inscricoesPush, notificacoes } from "~/db/schema";
type Transacao = Parameters<Parameters<typeof db.transaction>[0]>[0];
export async function avisar(
  tx: Transacao,
  usuarioIds: number[],
  dados: {
    titulo: string;
    texto: string;
    url: string;
    chave: string;
    criadaEm: Date;
  },
) {
  if (usuarioIds.length)
    await tx
      .insert(notificacoes)
      .values(
        [...new Set(usuarioIds)].map((usuarioId) => ({ ...dados, usuarioId })),
      )
      .onConflictDoNothing();
}
export async function entregarPush() {
  const pendentes = await db
    .select()
    .from(notificacoes)
    .where(isNull(notificacoes.enviadaEm))
    .limit(100);
  if (process.env.TEST_MODE === "1") {
    for (const n of pendentes)
      await db
        .update(notificacoes)
        .set({ enviadaEm: n.criadaEm })
        .where(eq(notificacoes.id, n.id));
    return;
  }
  if (
    !process.env.VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY ||
    !process.env.VAPID_SUBJECT
  )
    return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
  for (const n of pendentes) {
    const inscricoes = await db
      .select()
      .from(inscricoesPush)
      .where(eq(inscricoesPush.usuarioId, n.usuarioId));
    let falhou = false;
    for (const inscricao of inscricoes) {
      try {
        await webpush.sendNotification(
          { endpoint: inscricao.endpoint, keys: inscricao.chaves },
          JSON.stringify({ titulo: n.titulo, texto: n.texto, url: n.url }),
        );
      } catch (erro) {
        const status =
          typeof erro === "object" && erro !== null && "statusCode" in erro
            ? erro.statusCode
            : null;
        if (status === 404 || status === 410)
          await db
            .delete(inscricoesPush)
            .where(eq(inscricoesPush.id, inscricao.id));
        else falhou = true;
      }
    }
    if (!falhou)
      await db
        .update(notificacoes)
        .set({ enviadaEm: new Date() })
        .where(eq(notificacoes.id, n.id));
  }
}
export async function guardarInscricao(usuarioId: number, valor: unknown) {
  if (
    typeof valor !== "object" ||
    valor === null ||
    !("endpoint" in valor) ||
    !("keys" in valor)
  )
    throw new Response("Inscrição inválida", { status: 400 });
  const endpoint = String(valor.endpoint);
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Response("Endpoint inválido", { status: 400 });
  }
  const host = url.hostname;
  if (
    url.protocol !== "https:" ||
    !(
      [
        "fcm.googleapis.com",
        "updates.push.services.mozilla.com",
        "web.push.apple.com",
      ].includes(host) || host.endsWith(".notify.windows.com")
    )
  )
    throw new Response("Serviço de push não reconhecido", { status: 400 });
  const chaves = valor.keys as { p256dh?: string; auth?: string };
  if (typeof chaves?.p256dh !== "string" || typeof chaves?.auth !== "string")
    throw new Response("Chaves inválidas", { status: 400 });
  await db
    .insert(inscricoesPush)
    .values({
      usuarioId,
      endpoint,
      chaves: { p256dh: chaves.p256dh, auth: chaves.auth },
    })
    .onConflictDoUpdate({
      target: inscricoesPush.endpoint,
      set: { usuarioId, chaves: { p256dh: chaves.p256dh, auth: chaves.auth } },
    });
}
