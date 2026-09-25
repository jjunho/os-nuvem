import { readFile } from "node:fs/promises";
import { pool } from "~/db/client.server";
import { publicar } from "./comunicador.server";
export const fakeTranscricao = {
  falhar: false,
  texto: "Transcrição de teste",
  chamadas: 0,
};
async function transcrever(caminho: string, mime: string) {
  if (process.env.TEST_MODE === "1") {
    fakeTranscricao.chamadas++;
    if (fakeTranscricao.falhar) throw Error("Serviço indisponível");
    return fakeTranscricao.texto;
  }
  const chave = process.env.GEMINI_API_KEY,
    modelo = process.env.GEMINI_TRANSCRIPTION_MODEL;
  if (!chave || !modelo) throw Error("Transcrição não configurada");
  const data = (await readFile(caminho)).toString("base64");
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Transcribe the audio exactly, retaining its original languages. Return only the transcript, no commentary.",
              },
              { inline_data: { mime_type: mime, data } },
            ],
          },
        ],
      }),
    },
  );
  if (!r.ok) throw Error(`Transcrição HTTP ${r.status}`);
  const resposta = await r.json();
  const texto = resposta.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();
  if (!texto) throw Error("Transcrição vazia");
  return String(texto).slice(0, 40000);
}
let executando = false;
export async function processarTranscricoes(agora: Date) {
  if (executando) return;
  executando = true;
  try {
    const { rows } = await pool.query<{
      id: string;
      caminho: string;
      mime: string;
      mensagem_id: number;
      tentativas: number;
      conversa_id: number;
    }>(
      `select a.*,m.conversa_id from midias_comunicador a join mensagens m on m.id=a.mensagem_id where not a.removida and not a.transcrita and a.proxima_transcricao<=$1 order by a.proxima_transcricao limit 5`,
      [agora],
    );
    for (const m of rows) {
      try {
        const texto = await transcrever(m.caminho, m.mime);
        // The media may have been purged while the external service was running.
        const tx = await pool.connect();
        try {
          await tx.query("begin");
          const existe = await tx.query(
            "select id from midias_comunicador where id=$1 and not removida for update",
            [m.id],
          );
          if (existe.rowCount) {
            await tx.query("update mensagens set transcricao=$2 where id=$1", [
              m.mensagem_id,
              texto,
            ]);
            await tx.query(
              "update midias_comunicador set transcrita=true,proxima_transcricao=null where id=$1",
              [m.id],
            );
          }
          await tx.query("commit");
        } catch (e) {
          await tx.query("rollback");
          throw e;
        } finally {
          tx.release();
        }
        publicar(m.conversa_id);
      } catch {
        await pool.query(
          "update midias_comunicador set tentativas=tentativas+1,proxima_transcricao=$2 where id=$1 and not removida",
          [
            m.id,
            new Date(
              agora.getTime() +
                Math.min(3600000, 30000 * 2 ** Math.min(m.tentativas, 7)),
            ),
          ],
        );
      }
    }
  } finally {
    executando = false;
  }
}
let iniciado = false;
export function iniciarTranscricoes() {
  if (iniciado || process.env.TEST_MODE === "1") return;
  iniciado = true;
  const timer = setInterval(
    () => void processarTranscricoes(new Date()).catch(console.error),
    15000,
  );
  timer.unref();
}
