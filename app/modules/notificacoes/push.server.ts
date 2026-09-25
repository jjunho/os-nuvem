import webpush from "web-push";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "~/db/client.server";
import { inscricoesPush, notificacoes } from "~/db/schema";
import { analisarInscricao } from "./inscricao";
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
  const resultado = analisarInscricao(valor);
  if (!resultado.ok) {
    const mensagens = {
      payload: "Inscrição inválida",
      endpoint: "Endpoint inválido",
      servico: "Serviço de push não reconhecido",
      chaves: "Chaves inválidas",
    } as const;
    throw new Response(mensagens[resultado.motivo], { status: 400 });
  }
  const { endpoint, chaves } = resultado.inscricao;
  await db
    .insert(inscricoesPush)
    .values({
      usuarioId,
      endpoint,
      chaves,
    })
    .onConflictDoUpdate({
      target: inscricoesPush.endpoint,
      set: { usuarioId, chaves },
    });
}
