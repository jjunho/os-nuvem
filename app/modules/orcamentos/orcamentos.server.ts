import { validarRascunho } from "./validacao";
import { condicoesDasReferencias } from "./versoes";
import { listarOpcoes, registrarOpcao } from "~/modules/opcoes/opcoes.server";
import { listarViajantes } from "~/modules/viagens/viajantes.server";
import { and, asc, desc, eq, inArray, sql, isNull } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  orcamentos,
  versoesReferencia,
  viagens,
  viajantes,
  usuarios,
  taxasElaboracao,
  aceites,
} from "~/db/schema";
import { registrarFato } from "~/modules/viagens/etapas.server";
import type { DiaOrcamento, RascunhoOrcamento } from "./calculo";
import type { DadosReferencia } from "~/modules/tabelas/linha";
import type { ViajanteOrcamento } from "~/modules/viagens/viajantes.server";
import type { OpcaoConhecida } from "~/modules/opcoes/opcoes.server";
export type OrcamentoLido = {
  orcamento: typeof orcamentos.$inferSelect;
  viagem: typeof viagens.$inferSelect;
  opcoesConhecidas: Record<string, OpcaoConhecida[]>;
  autores: { id: number; nome: string }[];
  pessoas: ViajanteOrcamento[];
  hoteis: OpcaoConhecida[];
  taxaPaga: (typeof taxasElaboracao.$inferSelect) | null;
  referencias: Record<string, DadosReferencia>;
};
export async function criarOrcamento(
  viagemId: number,
  autorId: number,
  agora: Date,
) {
  return db.transaction(async (tx) => {
    const [viagem] = await tx
      .select()
      .from(viagens)
      .where(eq(viagens.id, viagemId))
      .for("update");
    if (!viagem) throw new Response("Viagem não encontrada", { status: 404 });
    const [existente] = await tx
      .select()
      .from(orcamentos)
      .where(eq(orcamentos.viagemId, viagemId))
      .orderBy(desc(orcamentos.versao))
      .limit(1);
    if (existente) return existente;
    const pessoas = await tx
      .select()
      .from(viajantes)
      .where(eq(viajantes.viagemId, viagemId));
    const referencias = await tx
      .selectDistinctOn([versoesReferencia.tabela], {
        tabela: versoesReferencia.tabela,
        id: versoesReferencia.id,
        dados: versoesReferencia.dados,
      })
      .from(versoesReferencia)
      .orderBy(asc(versoesReferencia.tabela), desc(versoesReferencia.versao));
    const inicio = viagem.dataInicio ?? agora.toISOString().slice(0, 10);
    const fim = viagem.dataFim ?? inicio;
    const n = Math.floor((Date.parse(fim) - Date.parse(inicio)) / 86400000) + 1;
    if (!Number.isFinite(n) || n < 1 || n > 730)
      throw new Response("Período inválido", { status: 400 });
    const dias: DiaOrcamento[] = Array.from({ length: n }, (_, i) => ({
      id: crypto.randomUUID(),
      data: new Date(Date.parse(inicio) + i * 86400000)
        .toISOString()
        .slice(0, 10),
      cidade: viagem.cidades.join(" / "),
      periodo: "completo",
      manha: "",
      almoco: "",
      tarde: "",
      linhas: [
        {
          id: crypto.randomUUID(),
          nome: "Guia",
          regra: "guia",
          quantidade: 1,
          valor: null,
          moeda: "USD",
          grupo: "servicos",
        },
        {
          id: crypto.randomUUID(),
          nome: "Assistente",
          regra: "assistente",
          quantidade: 0,
          valor: null,
          moeda: "USD",
          grupo: "servicos",
        },
        {
          id: crypto.randomUUID(),
          nome: "Veículo",
          regra: "carro",
          quantidade: 1,
          valor: null,
          moeda: "USD",
          grupo: "servicos",
        },
        ...(["kit", "agua", "cortesia"] as const).map((item) => ({
          id: crypto.randomUUID(),
          nome: { kit: "Kit de ingressos", agua: "Água", cortesia: "Cortesia" }[
            item
          ],
          item,
          automatica: true,
          quantidade: 1,
          valor: null,
          moeda: "USD" as const,
          grupo: "servicos" as const,
        })),
      ],
    }));
    if (viagem.hotelNome)
      dias[0].linhas.push({
        id: crypto.randomUUID(),
        nome: viagem.hotelNome,
        quantidade: 1,
        valor: null,
        moeda: "USD",
        grupo: "hotel",
        hotel: {
          nome: viagem.hotelNome,
          endereco: viagem.hotelEndereco ?? "",
          quartos: 1,
          noites: Math.max(1, n - 1),
          taxas: 0,
          cafe: 0,
          ocupacao: "duplo",
          fonte: "Booking",
          dataFonte: "",
        },
      });
    const taxa = referencias
      .find((r) => r.tabela === "pagamentos")
      ?.dados.linhas.find((l) => l.id === "taxa_roteiro")?.valor;
    const valorTaxa = typeof taxa === "number" ? Math.round(taxa * 100) : 0;
    const dados: RascunhoOrcamento = {
      canal: viagem.canalComercial,
      categoria: viagem.categoria,
      diaInicial: 1,
      taxaElaboracao: {
        ativa: viagem.canalComercial === "cliente_final" && valorTaxa > 0,
        valor: valorTaxa,
      },
      condicoes: condicoesDasReferencias(
        Object.fromEntries(referencias.map((r) => [r.tabela, r.dados])),
      ),
      opcoes: [
        {
          id: crypto.randomUUID(),
          nome: "Opção A",
          pagantes: pessoas.filter((p) => p.pagante).length,
          gratuidades: pessoas.filter((p) => !p.pagante).length,
          margem: ["agencia", "operadora"].includes(viagem.canalComercial)
            ? 0.2
            : 0.3,
          dias,
        },
      ],
    };
    const [criado] = await tx
      .insert(orcamentos)
      .values({
        viagemId,
        dados,
        referencias: Object.fromEntries(
          referencias.map((r) => [r.tabela, r.id]),
        ),
        criadaPor: autorId,
        criadaEm: agora,
      })
      .returning();
    await registrarFato(tx, viagemId, "orcamento", autorId, agora);
    return criado;
  });
}
export async function listarOrcamentos(viagemId: number) {
  return db
    .select({
      id: orcamentos.id,
      versao: orcamentos.versao,
      estado: orcamentos.estado,
      generica: sql<boolean>`coalesce((${orcamentos.memoria}->'condicoes'->>'generica')::boolean,false)`,
    })
    .from(orcamentos)
    .where(eq(orcamentos.viagemId, viagemId))
    .orderBy(desc(orcamentos.versao));
}
export async function lerOrcamento(id: number): Promise<OrcamentoLido> {
  const [o] = await db
    .select({ orcamento: orcamentos, viagem: viagens })
    .from(orcamentos)
    .innerJoin(viagens, eq(viagens.id, orcamentos.viagemId))
    .where(eq(orcamentos.id, id));
  if (!o) throw new Response("Orçamento não encontrado", { status: 404 });
  const referencias = await db
    .select()
    .from(versoesReferencia)
    .where(
      inArray(versoesReferencia.id, Object.values(o.orcamento.referencias)),
    );
  const autores = await db
    .select({ id: usuarios.id, nome: usuarios.nome })
    .from(usuarios);
  const pessoas = await listarViajantes(o.viagem.id);
  const hoteis = await listarOpcoes("hotelNome", "pt");
  const opcoesConhecidas = Object.fromEntries(
    await Promise.all(
      ["periodo", "moeda", "veiculo", "categoria", "cidades"].map(
        async (campo) => [campo, await listarOpcoes(campo, "pt")] as const,
      ),
    ),
  );
  const [taxaPaga] = await db
    .select()
    .from(taxasElaboracao)
    .where(eq(taxasElaboracao.viagemId, o.viagem.id));
  return {
    ...o,
    opcoesConhecidas,
    autores,
    pessoas,
    hoteis,
    taxaPaga: taxaPaga ?? null,
    referencias: Object.fromEntries(
      referencias.map((r) => [r.tabela, r.dados]),
    ),
  };
}
export async function salvarOrcamento(
  id: number,
  revisao: number,
  entrada: unknown,
  autorId: number,
  agora: Date,
  atualizarReferencias = false,
) {
  const dados = validarRascunho(entrada);
  dados.categoria = await registrarOpcao("categoria", dados.categoria);
  for (const o of dados.opcoes) {
    if (o.categoria)
      o.categoria = await registrarOpcao("categoria", o.categoria);
    for (const dia of o.dias) {
      dia.periodo = await registrarOpcao("periodo", dia.periodo);
      if (dia.cidade) dia.cidade = await registrarOpcao("cidades", dia.cidade);
      if (dia.veiculo)
        dia.veiculo = await registrarOpcao("veiculo", dia.veiculo);
      for (const l of dia.linhas)
        l.moeda = await registrarOpcao("moeda", l.moeda);
    }
  }
  for (const o of dados.opcoes)
    for (const dia of o.dias)
      for (const linha of dia.linhas) {
        if (linha.hotel)
          linha.hotel.nome = await registrarOpcao(
            "hotelNome",
            linha.hotel.nome,
            { cidade: dia.cidade, endereco: linha.hotel.endereco },
          );
      }

  return db.transaction(async (tx) => {
    const [atual] = await tx
      .select()
      .from(orcamentos)
      .where(eq(orcamentos.id, id))
      .for("update");
    if (!atual || atual.revisao !== revisao || atual.estado !== "rascunho")
      throw new Response(
        "O orçamento mudou ou já foi enviado. Recarregue antes de editar.",
        { status: 409 },
      );
    const anteriores = new Map(
      atual.dados.opcoes
        .flatMap((o) => o.dias.flatMap((d) => d.linhas))
        .map((l) => [l.id, l]),
    );
    for (const linha of dados.opcoes.flatMap((o) =>
      o.dias.flatMap((d) => d.linhas),
    )) {
      const anterior = anteriores.get(linha.id);
      if ((linha.regra || linha.item) && linha.valor !== null) {
        const mudou =
          linha.valor !== anterior?.valor ||
          linha.motivoAjuste !== anterior?.motivoAjuste;
        linha.autorAjuste = mudou ? autorId : anterior?.autorAjuste;
        linha.ajustadoEm = mudou ? agora.toISOString() : anterior?.ajustadoEm;
      } else {
        delete linha.autorAjuste;
        delete linha.ajustadoEm;
      }
    }
    let referencias = atual.referencias;
    if (atualizarReferencias) {
      const novas = await tx
        .selectDistinctOn([versoesReferencia.tabela], {
          tabela: versoesReferencia.tabela,
          id: versoesReferencia.id,
          dados: versoesReferencia.dados,
        })
        .from(versoesReferencia)
        .orderBy(asc(versoesReferencia.tabela), desc(versoesReferencia.versao));
      referencias = Object.fromEntries(novas.map((r) => [r.tabela, r.id]));
    }
    const [salvo] = await tx
      .update(orcamentos)
      .set({ dados, referencias, revisao: atual.revisao + 1 })
      .where(eq(orcamentos.id, id))
      .returning();
    const cotada = dados.opcoes
      .flatMap((o) => o.dias.flatMap((d) => d.linhas))
      .find(
        (l) =>
          l.hotel?.fonte?.trim() &&
          l.hotel.dataFonte &&
          l.custoRealUSD !== undefined &&
          (JSON.stringify(l.hotel) !==
            JSON.stringify(anteriores.get(l.id)?.hotel) ||
            l.custoRealUSD !== anteriores.get(l.id)?.custoRealUSD),
      );
    if (cotada)
      await registrarFato(
        tx,
        atual.viagemId,
        "cotacao",
        autorId,
        agora,
        `${cotada.nome}: ${cotada.hotel!.fonte}`,
      );
    return salvo;
  });
}

export async function registrarPagamentoTaxa(
  id: number,
  autorId: number,
  agora: Date,
) {
  await db.transaction(async (tx) => {
    const [o] = await tx
      .select()
      .from(orcamentos)
      .where(eq(orcamentos.id, id))
      .for("update");
    if (o) {
      const [aceite] = await tx
        .select()
        .from(aceites)
        .where(
          and(eq(aceites.viagemId, o.viagemId), isNull(aceites.anuladoEm)),
        );
      if (aceite)
        throw new Response("O aceite já foi registrado", { status: 409 });
    }
    if (!o?.dados.taxaElaboracao?.ativa || o.dados.taxaElaboracao.valor <= 0)
      throw new Response(
        "Ative e informe a taxa antes de registrar o pagamento",
        { status: 400 },
      );
    if (!["cliente_final", "influencer"].includes(o.dados.canal))
      throw new Response("Taxa disponível para B2C", { status: 400 });
    await tx
      .insert(taxasElaboracao)
      .values({
        viagemId: o.viagemId,
        valor: o.dados.taxaElaboracao.valor,
        pagaEm: agora,
        autorId,
      })
      .onConflictDoNothing();
  });
}
