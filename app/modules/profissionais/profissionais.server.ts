import { eq } from "drizzle-orm";
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
  const profissionalId = Number(f.get("profissionalId")),
    viagemId = Number(f.get("viagemId")),
    inicio = String(f.get("inicio")),
    fim = String(f.get("fim")),
    periodo = String(f.get("periodo"));
  if (
    !Number.isInteger(profissionalId) ||
    !Number.isInteger(viagemId) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(inicio) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fim) ||
    !Number.isFinite(Date.parse(inicio)) ||
    !Number.isFinite(Date.parse(fim)) ||
    fim < inicio ||
    !["inteiro", "manha", "tarde"].includes(periodo)
  )
    throw new Response("Alocação inválida", { status: 400 });
  const [p] = await db
    .select()
    .from(profissionais)
    .where(eq(profissionais.id, profissionalId));
  const [v] = await db.select().from(viagens).where(eq(viagens.id, viagemId));
  if (!p || !v)
    throw new Response("Profissional ou viagem não encontrado", {
      status: 400,
    });
  await db
    .insert(alocacoes)
    .values({ profissionalId, viagemId, inicio, fim, periodo, autorId });
}
