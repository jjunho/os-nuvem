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
export async function lerOrcamento(id: number) {
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
function validar(d: RascunhoOrcamento) {
  if (
    !d ||
    ![0, 1].includes(d.diaInicial) ||
    !Array.isArray(d.opcoes) ||
    !d.opcoes.length ||
    d.opcoes.length > 20
  )
    throw new Response("Orçamento inválido", { status: 400 });
  if (
    d.condicoes &&
    ([
      d.condicoes.sinal,
      d.condicoes.saldoDias,
      d.condicoes.validadeDias,
      d.condicoes.iva,
    ].some((v) => !Number.isFinite(v) || v < 0) ||
      d.condicoes.sinal > 100 ||
      d.condicoes.iva > 1 ||
      d.condicoes.validadeDias > 365)
  )
    throw new Response("Condições inválidas", { status: 400 });
  if (
    d.taxaElaboracao &&
    (!Number.isSafeInteger(d.taxaElaboracao.valor) ||
      d.taxaElaboracao.valor < 0)
  )
    throw new Response("Taxa inválida", { status: 400 });
  const ids = new Set<string>();
  const id = (valor: string) => {
    if (typeof valor !== "string" || !valor || ids.has(valor))
      throw new Response("Identificador inválido", { status: 400 });
    ids.add(valor);
  };
  for (const o of d.opcoes) {
    if (!o || typeof o !== "object")
      throw new Response("Opção inválida", { status: 400 });
    id(o.id);
    if (
      typeof o.nome !== "string" ||
      !o.nome ||
      !Number.isInteger(o.pagantes) ||
      o.pagantes < 0 ||
      !Number.isInteger(o.gratuidades) ||
      o.gratuidades < 0 ||
      !Number.isFinite(o.margem) ||
      o.margem < 0 ||
      o.margem > 10 ||
      !Array.isArray(o.dias) ||
      o.dias.length > 730
    )
      throw new Response("Opção inválida", { status: 400 });
    if (
      o.precoEnviado !== undefined &&
      (!Number.isSafeInteger(o.precoEnviado) || o.precoEnviado < 0)
    )
      throw new Response("Preço inválido", { status: 400 });
    for (const dia of o.dias) {
      if (!dia || typeof dia !== "object")
        throw new Response("Dia inválido", { status: 400 });
      id(dia.id);
      if (
        (dia.distanciaOnibus !== undefined &&
          (!Number.isFinite(dia.distanciaOnibus) ||
            dia.distanciaOnibus <= 0)) ||
        (dia.duracaoOnibus !== undefined &&
          (!Number.isInteger(dia.duracaoOnibus) ||
            dia.duracaoOnibus < 1 ||
            dia.duracaoOnibus > 4))
      )
        throw new Response("Distância ou duração inválida", { status: 400 });
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(dia.data) ||
        !Number.isFinite(Date.parse(dia.data)) ||
        typeof dia.periodo !== "string" ||
        !dia.periodo.trim() ||
        !Array.isArray(dia.linhas) ||
        dia.linhas.length > 200
      )
        throw new Response("Dia inválido", { status: 400 });
      for (const l of dia.linhas) {
        if (!l || typeof l !== "object")
          throw new Response("Linha inválida", { status: 400 });
        id(l.id);
        if (
          l.hotel &&
          (!l.hotel.nome ||
            !Number.isInteger(l.hotel.quartos) ||
            l.hotel.quartos < 1 ||
            !Number.isInteger(l.hotel.noites) ||
            l.hotel.noites < 1 ||
            !Number.isFinite(l.hotel.taxas) ||
            l.hotel.taxas < 0 ||
            !Number.isSafeInteger(l.hotel.cafe) ||
            l.hotel.cafe < 0)
        )
          throw new Response("Hotel inválido", { status: 400 });
        if (
          l.custoRealUSD !== undefined &&
          (!Number.isSafeInteger(l.custoRealUSD) || l.custoRealUSD < 0)
        )
          throw new Response("Custo inválido", { status: 400 });
        if (l.taxa !== undefined && (!Number.isFinite(l.taxa) || l.taxa <= 0))
          throw new Response("Taxa inválida", { status: 400 });
        if (l.regra && !["guia", "assistente", "carro"].includes(l.regra))
          throw new Response("Regra inválida", { status: 400 });
        if ((l.regra || l.item) && l.valor !== null && !l.motivoAjuste?.trim())
          throw new Response("Informe o motivo do ajuste", { status: 400 });
        if (
          typeof l.nome !== "string" ||
          !l.nome ||
          !Number.isFinite(l.quantidade) ||
          l.quantidade < 0 ||
          l.quantidade > 10000 ||
          typeof l.moeda !== "string" ||
          !l.moeda.trim() ||
          !["servicos", "hotel", "terceiros"].includes(l.grupo) ||
          (l.valor !== null && (!Number.isSafeInteger(l.valor) || l.valor < 0))
        )
          throw new Response("Linha inválida", { status: 400 });
      }
    }
  }
}
export async function salvarOrcamento(
  id: number,
  revisao: number,
  dados: RascunhoOrcamento,
  autorId: number,
  agora: Date,
  atualizarReferencias = false,
) {
  validar(dados);
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
