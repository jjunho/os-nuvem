import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { pool } from "~/db/client.server";
import { enviar } from "./comunicador.server";
import { exigirConversa, invalido, restrito } from "./acesso.server";
import { publicar } from "~/modules/notificacoes/eventos.server";
import type { Usuario } from "./tipos";
const diretorio = path.resolve(
  ".data",
  process.env.TEST_MODE === "1" ? "comunicador-test" : "comunicador",
);
export type MidiaNova = {
  id: string;
  caminho: string;
  mime: string;
  tamanho: number;
};
const tipos = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
];
export async function receberMidia(
  u: Usuario,
  f: FormData,
  agora: Date,
  origem: string,
) {
  const conversaId = Number(f.get("conversaId")),
    clientId = String(f.get("clientId"));
  await exigirConversa(u, conversaId, true);
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(clientId)) invalido();
  const existente = (
    await pool.query<{ id: number; midia_id: string }>(
      "select m.id,a.id as midia_id from mensagens m join midias_comunicador a on a.mensagem_id=m.id where m.client_id=$1 and m.autor_id=$2 and m.conversa_id=$3",
      [clientId, u.id, conversaId],
    )
  ).rows[0];
  if (existente) return { id: existente.id, midiaId: existente.midia_id };
  const arquivo = f.get("arquivo");
  if (
    !(arquivo instanceof File) ||
    !arquivo.size ||
    arquivo.size > 12 * 1024 * 1024
  )
    invalido("Arquivo inválido ou maior que 12 MB");
  const mime = arquivo.type.split(";")[0];
  if (!tipos.includes(mime)) invalido("Formato não suportado");
  const bytes = Buffer.from(await arquivo.arrayBuffer());
  if (
    (mime === "image/png" &&
      bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") ||
    (mime === "image/jpeg" &&
      bytes.subarray(0, 3).toString("hex") !== "ffd8ff") ||
    (mime === "image/webp" &&
      (bytes.subarray(0, 4).toString() !== "RIFF" ||
        bytes.subarray(8, 12).toString() !== "WEBP"))
  )
    invalido("Imagem inválida");
  const id = randomUUID();
  await mkdir(diretorio, { recursive: true });
  const caminho = path.join(diretorio, id);
  await writeFile(caminho, bytes, { flag: "wx" });
  try {
    const m = await enviar(
      u,
      {
        conversaId,
        clientId,
        texto: String(
          f.get("texto") || (mime.startsWith("audio/") ? "🎙" : "📷"),
        ),
      },
      agora,
      origem,
      { id, caminho, mime, tamanho: bytes.length },
    );
    const salvo = (
      await pool.query<{ id: string }>(
        "select id from midias_comunicador where mensagem_id=$1",
        [m.id],
      )
    ).rows[0];
    if (salvo.id !== id) await unlink(caminho);
    return { id: m.id, midiaId: salvo.id };
  } catch (e) {
    // A failed response/lookup after COMMIT is an unknown result. Only
    // remove bytes once the database confirms they are not referenced.
    try {
      const salvo = await pool.query(
        "select id from midias_comunicador where id=$1",
        [id],
      );
      if (salvo.rowCount === 0) await unlink(caminho).catch(() => {});
    } catch {
      // Keep the file when the database cannot establish the commit outcome.
    }
    throw e;
  }
}
async function registro(id: string) {
  const {
    rows: [m],
  } = await pool.query<{
    id: string;
    caminho: string;
    mime: string;
    removida: boolean;
    viajante_id: number | null;
    conversa_id: number;
    apagada: boolean;
  }>(
    `select a.*,m.conversa_id,m.apagada from midias_comunicador a join mensagens m on m.id=a.mensagem_id where a.id=$1`,
    [id],
  );
  if (!m) throw new Response("Não encontrado", { status: 404 });
  return m;
}
export async function baixarMidia(u: Usuario, id: string) {
  const m = await registro(id);
  if (m.viajante_id) {
    if (u.papel === "guiamento") restrito();
  } else await exigirConversa(u, m.conversa_id);
  if (m.removida || (m.apagada && u.papel !== "admin"))
    throw new Response("Arquivo removido", { status: 410 });
  return new Response(new Uint8Array(await readFile(m.caminho)), {
    headers: {
      "Content-Type": m.mime,
      "Content-Disposition": "inline",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function gerirMidia(u: Usuario, d: Record<string, unknown>) {
  const m = await registro(String(d.midiaId));
  await exigirConversa(u, m.conversa_id);
  if (d.acao === "purgar") {
    if (u.papel !== "admin") restrito();
    // Mark inaccessible before unlink; a failed unlink is safely retryable by Admin.
    await pool.query(
      "update midias_comunicador set removida=true,proxima_transcricao=null where id=$1",
      [m.id],
    );
    await unlink(m.caminho).catch((e) => {
      if (e.code !== "ENOENT") throw e;
    });
    await pool.query(
      `update mensagens set transcricao='' where id=(select mensagem_id from midias_comunicador where id=$1)`,
      [m.id],
    );
  } else if (d.acao === "mover") {
    if (u.papel === "guiamento") restrito();
    if (m.removida || !m.mime.startsWith("image/")) invalido();
    const v = Number(d.viajanteId);
    if (
      !(await pool.query("select id from viajantes where id=$1", [v])).rowCount
    )
      invalido();
    await pool.query(
      "update midias_comunicador set viajante_id=$2 where id=$1",
      [m.id, v],
    );
  } else invalido();
  publicar(m.conversa_id);
  return { ok: true };
}
export async function viajantesParaMidia(
  u: Usuario,
  q: string,
  viagemId?: number,
) {
  if (u.papel === "guiamento") restrito();
  return (
    await pool.query(
      `select v.id,c.nome,vi.codigo from viajantes v left join contatos c on c.id=v.contato_id join viagens vi on vi.id=v.viagem_id where ($2::int is null or v.viagem_id=$2) and coalesce(c.nome,'') ilike $1 limit 30`,
      ["%" + q.replace(/[\\%_]/g, "\\$&") + "%", viagemId ?? null],
    )
  ).rows;
}
export async function documentosViajante(u: Usuario, id: number) {
  if (u.papel === "guiamento") restrito();
  return (
    await pool.query(
      "select id,mime from midias_comunicador where viajante_id=$1 and not removida",
      [id],
    )
  ).rows;
}
