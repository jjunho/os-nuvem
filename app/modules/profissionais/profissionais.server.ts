import { inteiroEntrada, dataISOValida } from "~/modules/validacao/entrada";
import { and, eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { profissionais, alocacoes, viagens } from "~/db/schema";
export async function listarDisponibilidade() {
  return {
    profissionais: await db
      .select()
      .from(profissionais)
      .orderBy(profissionais.nome),
    alocacoes: await db.select().from(alocacoes),
  };
}
export async function salvarProfissional(f: FormData) {
  const nome = String(f.get("nome") ?? "").trim(),
    papel = String(f.get("papel"));
  const lista = (k: string) =>
    String(f.get(k) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  if (!nome || !["guia", "assistente"].includes(papel))
    throw new Response("Profissional inválido", { status: 400 });
  const dados = {
    nome,
    papel: papel as "guia" | "assistente",
    idiomas: lista("idiomas"),
    especialidades: lista("especialidades"),
  };
  await db
    .insert(profissionais)
    .values(dados)
    .onConflictDoUpdate({ target: profissionais.nome, set: dados });
}
export async function alocarProfissional(f: FormData, autorId: number) {
  const profissionalId = inteiroEntrada(f.get("profissionalId")),
    viagemId = inteiroEntrada(f.get("viagemId")),
    inicio = String(f.get("inicio")),
    fim = String(f.get("fim")),
    periodo = String(f.get("periodo"));
  if (
    !Number.isInteger(profissionalId) ||
    !Number.isInteger(viagemId) ||
    !dataISOValida(inicio) ||
    !dataISOValida(fim) ||
    fim < inicio ||
    !["inteiro", "manha", "tarde"].includes(periodo)
  )
    throw new Response("Alocação inválida", { status: 400 });
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
