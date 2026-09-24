import { impactosRemocao } from "~/modules/orcamentos/impactos.server";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "~/db/client.server";
import { contatos, viagemContatos, viagens, viajantes } from "~/db/schema";
type Transacao = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Quantidades = {
  pagantes?: number | null;
  gratuidades?: number;
  adultos?: number | null;
  idadesCriancas?: number[];
  bebes?: number;
};
export async function criarViajantes(
  tx: Transacao,
  viagemId: number,
  q: Quantidades,
  contatoIds: number[],
) {
  const criancas = q.idadesCriancas ?? [];
  const bebes = q.bebes ?? 0;
  const gratis = q.gratuidades ?? 0;
  const valores = [q.pagantes ?? 0, gratis, q.adultos ?? 0, bebes, ...criancas];
  if (
    valores.some((n) => !Number.isInteger(n) || n < 0) ||
    valores.some((n) => n > 1000)
  )
    throw new Response("Quantidade inválida", { status: 400 });
  const nomeados = [...new Set(contatoIds)];
  const total = Math.max(
    (q.pagantes ?? 0) + gratis,
    (q.adultos ?? 0) + criancas.length + bebes,
    nomeados.length,
  );
  const adultos = total - criancas.length - bebes;
  if (!total) return;
  await tx.insert(viajantes).values(
    Array.from({ length: total }, (_, i) => ({
      viagemId,
      contatoId: nomeados[i] ?? null,
      pagante: i < total - gratis,
      faixa:
        i < adultos
          ? "adulto"
          : i < adultos + criancas.length
            ? "crianca"
            : "bebe",
      idade:
        i >= adultos && i < adultos + criancas.length
          ? criancas[i - adultos]
          : null,
    })),
  );
}
export async function listarViajantes(viagemId: number) {
  return db
    .select({
      id: viajantes.id,
      malas: viajantes.malas,
      bagagemMao: viajantes.bagagemMao,
      contatoId: viajantes.contatoId,
      nome: sql<string | null>`nullif(${contatos.nome}, '')`,
      mobilidade: contatos.mobilidade,
      alimentacao: contatos.alimentacao,
      pagante: viajantes.pagante,
      faixa: viajantes.faixa,
      idade: sql<
        number | null
      >`case when ${contatos.nascimento} is not null and ${viagens.dataInicio} is not null then extract(year from age(${viagens.dataInicio}::timestamp, ${contatos.nascimento}::timestamp))::int else ${viajantes.idade} end`,
      nascimento: contatos.nascimento,
    })
    .from(viajantes)
    .leftJoin(contatos, eq(contatos.id, viajantes.contatoId))
    .innerJoin(viagens, eq(viagens.id, viajantes.viagemId))
    .where(eq(viajantes.viagemId, viagemId))
    .orderBy(asc(viajantes.id));
}
export function resumirViajantes(
  lista: Awaited<ReturnType<typeof listarViajantes>>,
) {
  return {
    pagantes: lista.filter((v) => v.pagante).length,
    gratuidades: lista.filter((v) => !v.pagante).length,
    adultos: lista.filter((v) => v.faixa === "adulto").length,
    idadesCriancas: lista
      .filter((v) => v.faixa === "crianca" && v.idade !== null)
      .map((v) => v.idade!),
    bebes: lista.filter((v) => v.faixa === "bebe").length,
  };
}
export async function alterarViajante(viagemId: number, form: FormData) {
  const intent = form.get("intent");
  if (intent === "viajante-adicionar") {
    await db
      .insert(viajantes)
      .values({ viagemId, faixa: "adulto", pagante: true });
    return;
  }
  await db.transaction(async (tx) => {
    const id = Number(form.get("viajanteId"));
    const condicao = and(
      eq(viajantes.id, id),
      eq(viajantes.viagemId, viagemId),
    );
    const [atual] = await tx
      .select()
      .from(viajantes)
      .where(condicao)
      .for("update");
    if (!atual) throw new Response("Viajante não encontrado", { status: 404 });
    if (intent === "viajante-remover") {
      const impactos = await impactosRemocao(viagemId, [id]);
      if (impactos[id].length && form.get("confirmarRemocao") !== "1")
        throw new Response(
          "Confirme os dias e linhas afetados antes de remover",
          { status: 409 },
        );
      await tx.delete(viajantes).where(condicao);
      if (atual.contatoId)
        await tx
          .delete(viagemContatos)
          .where(
            and(
              eq(viagemContatos.viagemId, viagemId),
              eq(viagemContatos.contatoId, atual.contatoId),
              eq(viagemContatos.papel, "viajante"),
            ),
          );
      return;
    }
    const malas = Number(form.get("malas") ?? atual.malas),
      bagagemMao = Number(form.get("bagagemMao") ?? atual.bagagemMao);
    if (
      [malas, bagagemMao].some((n) => !Number.isInteger(n) || n < 0 || n > 20)
    )
      throw new Response("Bagagem inválida", { status: 400 });
    const faixa = String(form.get("faixa"));
    const idade = form.get("idade") ? Number(form.get("idade")) : null;
    if (
      !["adulto", "crianca", "bebe"].includes(faixa) ||
      (idade !== null && (!Number.isInteger(idade) || idade < 0 || idade > 120))
    )
      throw new Response("Idade inválida", { status: 400 });
    const escolha = String(form.get("contato") ?? "").trim();
    const [pessoaAtual] = atual.contatoId
      ? await tx.select().from(contatos).where(eq(contatos.id, atual.contatoId))
      : [];
    const mobilidade = String(form.get("mobilidade") ?? "").trim() || null;
    const alimentacao = String(form.get("alimentacao") ?? "").trim() || null;
    let contatoId: number | null = null;
    if (escolha.startsWith("contato:")) {
      const [contato] = await tx
        .select()
        .from(contatos)
        .where(eq(contatos.id, Number(escolha.slice(8))));
      if (!contato)
        throw new Response("Contato não encontrado", { status: 404 });
      contatoId = contato.id;
    } else if (escolha) {
      const conhecidos = await tx
        .select()
        .from(contatos)
        .where(eq(contatos.nome, escolha));
      if (conhecidos.length > 1)
        throw new Response("Selecione o contato na lista", { status: 400 });
      if (conhecidos[0]) contatoId = conhecidos[0].id;
      else if (pessoaAtual && !pessoaAtual.nome) {
        await tx
          .update(contatos)
          .set({ nome: escolha })
          .where(eq(contatos.id, pessoaAtual.id));
        contatoId = pessoaAtual.id;
      } else {
        const [novo] = await tx
          .insert(contatos)
          .values({ nome: escolha })
          .returning();
        contatoId = novo.id;
      }
    }
    if (!escolha && pessoaAtual) contatoId = pessoaAtual.id;
    if (!contatoId && (mobilidade || alimentacao)) {
      const [pessoa] = await tx
        .insert(contatos)
        .values({ nome: "" })
        .returning();
      contatoId = pessoa.id;
    }
    if (contatoId) {
      if (contatoId === atual.contatoId || mobilidade || alimentacao)
        await tx
          .update(contatos)
          .set(
            contatoId === atual.contatoId
              ? { mobilidade, alimentacao }
              : {
                  ...(mobilidade ? { mobilidade } : {}),
                  ...(alimentacao ? { alimentacao } : {}),
                },
          )
          .where(eq(contatos.id, contatoId));
      const [duplicado] = await tx
        .select()
        .from(viajantes)
        .where(
          and(
            eq(viajantes.viagemId, viagemId),
            eq(viajantes.contatoId, contatoId),
          ),
        );
      if (duplicado && duplicado.id !== id)
        throw new Response("Viajante já incluído", { status: 409 });
      await tx
        .insert(viagemContatos)
        .values({ viagemId, contatoId, papel: "viajante" })
        .onConflictDoNothing();
    }
    if (atual.contatoId && atual.contatoId !== contatoId)
      await tx
        .delete(viagemContatos)
        .where(
          and(
            eq(viagemContatos.viagemId, viagemId),
            eq(viagemContatos.contatoId, atual.contatoId),
            eq(viagemContatos.papel, "viajante"),
          ),
        );
    await tx
      .update(viajantes)
      .set({
        contatoId,
        faixa,
        idade,
        malas,
        bagagemMao,
        pagante: form.get("pagamento") === "pagante",
      })
      .where(condicao);
  });
}
