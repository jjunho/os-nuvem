import { eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { orcamentos } from "~/db/schema";
import type { MemoriaOrcamento } from "~/modules/orcamentos/versoes";

export async function lerMemoriaDaProposta(
  orcamentoId: number,
): Promise<{ id: number; memoria: MemoriaOrcamento }> {
  const [orcamento] = await db
    .select({ id: orcamentos.id, memoria: orcamentos.memoria })
    .from(orcamentos)
    .where(eq(orcamentos.id, orcamentoId));
  if (!orcamento?.memoria)
    throw new Response("Envie a versão antes de gerar a proposta", {
      status: 400,
    });
  return { id: orcamento.id, memoria: orcamento.memoria };
}
