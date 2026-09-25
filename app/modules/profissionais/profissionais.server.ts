import { and, eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { profissionais, alocacoes, viagens } from "~/db/schema";
import { dadosDeAlocacao, dadosDeProfissional } from "./alocacao";
export type Disponibilidade = {
  profissionais: (typeof profissionais.$inferSelect)[];
  alocacoes: (typeof alocacoes.$inferSelect)[];
};
export async function listarDisponibilidade(): Promise<Disponibilidade> {
  return {
    profissionais: await db
      .select()
      .from(profissionais)
      .orderBy(profissionais.nome),
    alocacoes: await db.select().from(alocacoes),
  };
}
export async function salvarProfissional(f: FormData) {
  const dados = dadosDeProfissional(f);
  await db
    .insert(profissionais)
    .values(dados)
    .onConflictDoUpdate({ target: profissionais.nome, set: dados });
}
export async function alocarProfissional(f: FormData, autorId: number) {
  const { profissionalId, viagemId, inicio, fim, periodo } = dadosDeAlocacao(f);
  await db.transaction(async (tx) => {
    // Serialize allocation for this professional: a repeated confirmed booking
    // describes the same domain fact, even after the HTTP response is lost.
    const [p] = await tx
      .select()
      .from(profissionais)
      .where(eq(profissionais.id, profissionalId))
      .for("update");
    const [v] = await tx.select().from(viagens).where(eq(viagens.id, viagemId));
    if (!p || !v)
      throw new Response("Profissional ou viagem não encontrado", {
        status: 400,
      });
    const [existente] = await tx
      .select({ id: alocacoes.id })
      .from(alocacoes)
      .where(
        and(
          eq(alocacoes.profissionalId, profissionalId),
          eq(alocacoes.viagemId, viagemId),
          eq(alocacoes.inicio, inicio),
          eq(alocacoes.fim, fim),
          eq(alocacoes.periodo, periodo),
          eq(alocacoes.confirmada, true),
        ),
      );
    if (existente) return;
    await tx
      .insert(alocacoes)
      .values({ profissionalId, viagemId, inicio, fim, periodo, autorId });
  });
}
