import { eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { modelosResposta } from "~/db/schema";
import { modelosIniciais } from "./modelos-resposta";
export async function semearModelosResposta() {
  await db
    .insert(modelosResposta)
    .values(
      Object.entries(modelosIniciais).map(([idioma, texto]) => ({
        idioma,
        texto,
      })),
    )
    .onConflictDoNothing();
}
export async function obterModeloResposta(idioma: string) {
  const [modelo] = await db
    .select()
    .from(modelosResposta)
    .where(eq(modelosResposta.idioma, idioma));
  return modelo?.texto ?? null;
}
export async function listarModelosResposta() {
  return db.select().from(modelosResposta);
}
export async function salvarModeloResposta(
  usuario: { papel: string },
  idioma: string,
  texto: string,
) {
  if (usuario.papel !== "admin")
    throw new Response("Acesso restrito", { status: 403 });
  if (!texto.trim()) throw new Response("Informe o modelo", { status: 400 });
  await db
    .update(modelosResposta)
    .set({ texto: texto.trim() })
    .where(eq(modelosResposta.idioma, idioma));
}
