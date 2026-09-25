import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { pool } from "~/db/client.server";
import { detalheTarefa } from "~/modules/tarefas/tarefas.server";
import type { Leitor } from "./quadros.server";
const diretorio = path.resolve(
  ".data",
  process.env.TEST_MODE === "1" ? "comunicador-test" : "comunicador",
  "tarefas",
);
export async function anexar(u: Leitor, id: number, f: FormData) {
  await detalheTarefa(u, id);
  const a = f.get("arquivo");
  if (!(a instanceof File) || !a.size || a.size > 12 * 1024 * 1024)
    throw new Response("Arquivo inválido ou maior que 12 MB", { status: 400 });
  const aid = randomUUID(),
    bytes = Buffer.from(await a.arrayBuffer());
  let mime = "application/octet-stream";
  if (bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a")
    mime = "image/png";
  else if (bytes.subarray(0, 3).toString("hex") === "ffd8ff")
    mime = "image/jpeg";
  else if (
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WEBP"
  )
    mime = "image/webp";
  else if (bytes.subarray(0, 5).toString() === "%PDF-")
    mime = "application/pdf";
  await mkdir(diretorio, { recursive: true });
  const destino = path.join(diretorio, aid);
  await writeFile(destino, bytes, { flag: "wx" });
  try {
    await pool.query(
      "insert into tarefas_anexos(id,tarefa_id,nome,mime,tamanho) values($1,$2,$3,$4,$5)",
      [aid, id, path.basename(a.name), mime, a.size],
    );
  } catch (e) {
    await unlink(destino);
    throw e;
  }
}
export async function baixar(u: Leitor, id: number, aid: string) {
  await detalheTarefa(u, id);
  if (!/^[0-9a-f-]{36}$/i.test(aid))
    throw new Response("Não encontrado", { status: 404 });
  const a = (
    await pool.query<{ nome: string; mime: string }>(
      "select nome,mime from tarefas_anexos where id=$1 and tarefa_id=$2",
      [aid, id],
    )
  ).rows[0];
  if (!a) throw new Response("Não encontrado", { status: 404 });
  return new Response(
    new Uint8Array(await readFile(path.join(diretorio, aid))),
    {
      headers: {
        "Content-Type": a.mime,
        "Content-Disposition": `${a.mime.startsWith("image/") ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(a.nome)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
