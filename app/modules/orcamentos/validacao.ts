import { inteiroEntrada } from "~/modules/validacao/entrada";
import type { RascunhoOrcamento } from "./calculo";
const intents = [
  "salvar",
  "atualizar-referencias",
  "preparar-pedido",
  "confirmar-pedido",
  "importar-excel",
  "enviar",
  "pagar-taxa",
  "nova-versao",
] as const;
export function lerIntent(valor: unknown): (typeof intents)[number] {
  if (typeof valor !== "string" || !intents.some((i) => i === valor))
    throw new Response("Ação inválida", { status: 400 });
  return valor as (typeof intents)[number];
}
export function lerInteiroPositivo(valor: unknown): number {
  if (
    typeof valor !== "string" ||
    !/^[1-9][0-9]*$/.test(valor) ||
    !Number.isSafeInteger(Number(valor))
  )
    throw new Response("Identificador ou revisão inválida", { status: 400 });
  return inteiroEntrada(valor, {
    mensagem: "Identificador ou revisão inválida",
  });
}
function invalido(): never {
  throw new Response("Orçamento inválido", { status: 400 });
}
function objeto(v: unknown): asserts v is Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v)) invalido();
}
function campos(
  v: Record<string, unknown>,
  strings: string[],
  numeros: string[],
  booleanos: string[],
  opcional = false,
) {
  for (const [nomes, tipo] of [
    [strings, "string"],
    [numeros, "number"],
    [booleanos, "boolean"],
  ] as const)
    for (const nome of nomes) {
      const valor = v[nome];
      if (opcional && valor === undefined) continue;
      if (
        typeof valor !== tipo ||
        (tipo === "number" && !Number.isFinite(valor))
      )
        invalido();
    }
}
function ids(v: unknown) {
  if (
    v !== undefined &&
    (!Array.isArray(v) || v.some((n) => !Number.isSafeInteger(n) || n < 1))
  )
    invalido();
}
export function validarRascunho(entrada: unknown): RascunhoOrcamento {
  objeto(entrada);
  campos(entrada, ["canal", "categoria"], ["diaInicial"], []);
  if (entrada.taxaElaboracao !== undefined) {
    objeto(entrada.taxaElaboracao);
    campos(entrada.taxaElaboracao, [], ["valor"], ["ativa"]);
  }
  if (entrada.condicoes !== undefined) {
    objeto(entrada.condicoes);
    campos(
      entrada.condicoes,
      [
        "cancelamento",
        "formasPagamento",
        "dadosBancarios",
        "incluso",
        "naoIncluso",
        "notasB2B",
        "detalhe",
      ],
      ["sinal", "saldoDias", "validadeDias", "iva"],
      ["generica"],
    );
    if (
      !["nenhum", "dia", "servico"].includes(String(entrada.condicoes.detalhe))
    )
      invalido();
  }
  if (!Array.isArray(entrada.opcoes)) invalido();
  for (const o of entrada.opcoes) {
    objeto(o);
    campos(o, ["id", "nome"], ["pagantes", "gratuidades", "margem"], []);
    campos(
      o,
      ["categoria", "motivoMargem"],
      ["precoEnviado"],
      ["mostrarGorjeta"],
      true,
    );
    if (!Array.isArray(o.dias)) invalido();
    for (const d of o.dias) {
      objeto(d);
      campos(
        d,
        ["id", "data", "cidade", "periodo", "manha", "almoco", "tarde"],
        [],
        [],
      );
      campos(
        d,
        [
          "horaInicio",
          "horaFim",
          "veiculo",
          "porteOnibus",
          "autorizacaoTransporte",
        ],
        [
          "distanciaOnibus",
          "duracaoOnibus",
          "guiaId",
          "assistenteId",
          "profissionalNecessarioId",
        ],
        [],
        true,
      );
      ids(d.viajanteIds);
      if (!Array.isArray(d.linhas)) invalido();
      for (const l of d.linhas) {
        objeto(l);
        campos(l, ["id", "nome", "moeda", "grupo"], ["quantidade"], []);
        if (
          l.valor !== null &&
          (typeof l.valor !== "number" || !Number.isFinite(l.valor))
        )
          invalido();
        campos(
          l,
          [
            "regra",
            "motivoAjuste",
            "ajustadoEm",
            "dataTaxa",
            "fonteTaxa",
            "item",
          ],
          [
            "autorAjuste",
            "taxa",
            "custoFornecedor",
            "tarifaCrianca",
            "idadeCriancaMax",
            "tarifaSenior",
            "idadeSeniorMin",
            "custoRealUSD",
          ],
          [
            "provisorio",
            "quantidadeManual",
            "automatica",
            "porViajante",
            "seniorElegivel",
            "terceiro",
          ],
          true,
        );
        ids(l.viajanteIds);
        if (l.hotel !== undefined) {
          objeto(l.hotel);
          campos(
            l.hotel,
            ["nome", "endereco", "ocupacao", "fonte", "dataFonte"],
            ["quartos", "noites", "taxas", "cafe"],
            [],
          );
          if (!["duplo", "single"].includes(String(l.hotel.ocupacao)))
            invalido();
        }
      }
    }
  }
  // All accessed fields are checked above; business ranges remain centralized below.
  const dados = entrada as RascunhoOrcamento;
  validar(dados);
  return structuredClone(dados);
}
function validar(d: RascunhoOrcamento) {
  if (
    !d ||
    !d.categoria.trim() ||
    !d.canal.trim() ||
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
        new Date(dia.data).toISOString().slice(0, 10) !== dia.data ||
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
