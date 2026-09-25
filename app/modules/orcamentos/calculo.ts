import { precoItem, gorjetaSugerida } from "./itens";
import { calcularOnibus, sugerirVeiculo, avaliarVeiculo } from "./transportes";
import {
  adicionalEvento,
  calcularDiaria,
  sugerirEquipe,
  temporada,
  valorReferencia,
  type Referencias,
} from "./sugestoes";
export type Moeda = string;
export type LinhaCusto = {
  id: string;
  nome: string;
  quantidade: number;
  valor: number | null;
  moeda: Moeda;
  grupo: "servicos" | "hotel" | "terceiros";
  provisorio?: boolean;
  regra?: "guia" | "assistente" | "carro";
  quantidadeManual?: boolean;
  motivoAjuste?: string;
  autorAjuste?: number;
  ajustadoEm?: string;
  taxa?: number;
  dataTaxa?: string;
  fonteTaxa?: string;
  item?: string;
  custoFornecedor?: number;
  automatica?: boolean;
  porViajante?: boolean;
  viajanteIds?: number[];
  tarifaCrianca?: number;
  idadeCriancaMax?: number;
  tarifaSenior?: number;
  idadeSeniorMin?: number;
  seniorElegivel?: boolean;
  terceiro?: boolean;
  custoRealUSD?: number;
  hotel?: {
    nome: string;
    endereco: string;
    quartos: number;
    noites: number;
    taxas: number;
    cafe: number;
    ocupacao: "duplo" | "single";
    fonte: string;
    dataFonte: string;
  };
};
export type DiaOrcamento = {
  distanciaOnibus?: number;
  duracaoOnibus?: number;
  guiaId?: number;
  assistenteId?: number;
  profissionalNecessarioId?: number;
  id: string;
  data: string;
  cidade: string;
  periodo: string;
  manha: string;
  almoco: string;
  tarde: string;
  linhas: LinhaCusto[];
  horaInicio?: string;
  horaFim?: string;
  veiculo?: string;
  porteOnibus?: string;
  autorizacaoTransporte?: string;
  viajanteIds?: number[];
};
export type OpcaoOrcamento = {
  id: string;
  nome: string;
  categoria?: string;
  pagantes: number;
  gratuidades: number;
  margem: number;
  precoEnviado?: number;
  mostrarGorjeta?: boolean;
  motivoMargem?: string;
  dias: DiaOrcamento[];
};
export type RascunhoOrcamento = {
  canal: string;
  categoria: string;
  diaInicial: number;
  taxaElaboracao?: { ativa: boolean; valor: number };
  condicoes?: import("./versoes").CondicoesProposta;
  opcoes: OpcaoOrcamento[];
};
export type ContextoCalculo = {
  canal: string;
  categoria: string;
  referencias: Referencias;
  malasPorPessoa?: number;
  viajantes?: {
    id: number;
    idade: number | null;
    pagante: boolean;
    nome: string | null;
  }[];
};
export type LinhaCalculada = LinhaCusto & {
  grupo: LinhaCusto["grupo"];
  quantidade: number;
  sugerido: number | null;
  aplicado: number | null;
  convertido: number | null;
  provisorio: boolean;
  total: number | null;
};
export type CalculoOpcao = {
  pisoMargem: number;
  margemReal: number | null;
  custoReal: number | null;
  comissaoInfluencer: number;
  gorjeta: number | null;
  linhas: LinhaCalculada[];
  servicos: number;
  margem: number;
  hoteis: number;
  terceiros: number;
  calculado: number;
  sugerido: number;
  enviado: number;
  diferenca: number;
  porPessoa: number | null;
  avisos: string[];
};
export function calcularOpcao(
  opcao: OpcaoOrcamento,
  contexto?: ContextoCalculo,
): CalculoOpcao {
  let servicos = 0,
    hoteis = 0,
    terceiros = 0;
  const avisos: string[] = [];
  if (contexto?.canal === "agencia" && opcao.dias.length < 3)
    avisos.push("Agência: viagem abaixo de 3 dias");
  const diasJeju = opcao.dias.filter((d) => /jeju/i.test(d.cidade));
  if (
    diasJeju.length &&
    diasJeju.filter((d) => ["completo", "meio"].includes(d.periodo)).length < 2
  )
    avisos.push("Jeju: menos de 2 dias de guia");
  const linhas = opcao.dias.flatMap((d) =>
    d.linhas.map((l) => {
      let sugerido = l.valor,
        quantidade = l.quantidade,
        provisorio = !!l.provisorio;
      let grupo = l.grupo;
      const pessoasDia =
        contexto?.viajantes?.filter(
          (p) => !d.viajanteIds || d.viajanteIds.includes(p.id),
        ) ?? [];
      const pessoasLinha = pessoasDia.filter(
        (p) => !l.viajanteIds || l.viajanteIds.includes(p.id),
      );
      const paxDia = d.viajanteIds
        ? pessoasDia.length
        : opcao.pagantes + opcao.gratuidades;
      if (l.regra && contexto) {
        const refs = contexto.referencias;
        const equipe = sugerirEquipe(contexto.categoria, paxDia);
        const pax = paxDia;
        const sugestao = sugerirVeiculo(
          pax,
          equipe.guias + equipe.assistentes,
          pax * (contexto.malasPorPessoa ?? 2),
          contexto.categoria,
          refs,
        );
        const modelo = d.veiculo || sugestao.modelo;
        if (l.regra === "carro") {
          const veiculo = refs.frota?.linhas.find((v) => v.id === modelo);
          if (contexto.categoria === "vip" && veiculo?.motorista === "guia")
            avisos.push("Carro próprio não recomendado para VIP");
          const capacidade = avaliarVeiculo(
            modelo,
            pax,
            equipe.guias + equipe.assistentes,
            pax * (contexto.malasPorPessoa ?? 2),
            refs,
          );
          if (capacidade.assentosInsuficientes)
            avisos.push(
              `${d.data}: assentos insuficientes; veículo maior ou segundo veículo`,
            );
        }
        if (!l.quantidadeManual)
          quantidade =
            l.regra === "guia"
              ? equipe.guias
              : l.regra === "assistente"
                ? equipe.assistentes
                : modelo === "onibus"
                  ? Math.ceil(
                      pax /
                        Math.max(
                          1,
                          Number(d.porteOnibus ?? 45) -
                            1 -
                            equipe.guias -
                            equipe.assistentes,
                        ),
                    )
                  : 1;
        if (d.periodo === "livre" || d.periodo === "deslocamento")
          quantidade = 0;
        const minutosHora = (h: string) =>
          Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
        const minutos =
          d.horaInicio && d.horaFim
            ? (minutosHora(d.horaFim) - minutosHora(d.horaInicio) + 1440) % 1440
            : d.periodo === "completo"
              ? 540
              : null;
        const base =
          l.regra === "carro"
            ? valorReferencia(
                refs,
                "frota",
                modelo,
                contexto.canal === "influencer"
                  ? "cliente_final"
                  : contexto.canal,
              )
            : valorReferencia(refs, "equipe", contexto.canal, l.regra);
        const temTransfer = d.linhas.some(
          (l) =>
            l.item?.startsWith("transfer:") &&
            !l.terceiro &&
            !(l.quantidadeManual && l.quantidade === 0),
        );
        const transfer =
          l.regra === "carro" && temTransfer
            ? (valorReferencia(refs, "fatores", "carro_transfer") ?? 0.15)
            : 0;
        const noturno =
          !!d.horaFim &&
          (d.horaFim > "21:00" || (!!d.horaInicio && d.horaFim < d.horaInicio));
        const regional =
          l.regra === "carro" && d.cidade && d.cidade.toLowerCase() !== "seul"
            ? (valorReferencia(refs, "fatores", "regional") ?? 0.2)
            : 0;
        const vip =
          l.regra === "carro" && contexto.categoria === "vip"
            ? (valorReferencia(refs, "fatores", "vip_carro") ?? 0.1)
            : 0;
        const diaria = calcularDiaria(
          {
            base: base === null ? null : base * 100,
            tipo: l.regra,
            minutos,
            adicionais: [
              temporada(d.data, refs).adicional,
              adicionalEvento(d.data, refs),
              regional,
              vip,
              transfer,
            ],
            noturno,
          },
          refs,
        );
        sugerido =
          ["completo", "meio", "livre", "deslocamento"].includes(d.periodo) &&
          ["economico", "padrao", "premium", "vip"].includes(contexto.categoria)
            ? diaria.valor
            : null;
        provisorio =
          provisorio ||
          diaria.provisorio ||
          !!refs[l.regra === "carro" ? "frota" : "equipe"]?.linhas.find(
            (r) => r.id === (l.regra === "carro" ? modelo : contexto.canal),
          )?.provisorio;
        if (
          ["cliente_final", "influencer"].includes(contexto.canal) &&
          l.valor !== null
        ) {
          const agencia =
            l.regra === "carro"
              ? valorReferencia(refs, "frota", modelo, "agencia")
              : valorReferencia(refs, "equipe", "agencia", l.regra);
          const comparavel = calcularDiaria(
            {
              base: agencia === null ? null : agencia * 100,
              tipo: l.regra,
              minutos,
              adicionais: [
                temporada(d.data, refs).adicional,
                adicionalEvento(d.data, refs),
                regional,
                vip,
                transfer,
              ],
              noturno,
            },
            refs,
          ).valor;
          if (comparavel !== null && l.valor < comparavel)
            avisos.push(
              `${l.nome}: preço direto abaixo da tarifa Agência para o mesmo serviço`,
            );
        }
        if (l.regra === "carro" && modelo === "onibus") {
          grupo = "terceiros";
          const faixa = refs.onibus_distancia?.linhas
            .filter((r) => Number(r.km) >= (d.distanciaOnibus ?? 200))
            .sort((a, b) => Number(a.km) - Number(b.km))[0];
          const baseOnibus = faixa
            ? valorReferencia(
                refs,
                "onibus_distancia",
                faixa.id,
                `dia${d.duracaoOnibus ?? 1}`,
              )
            : null;
          provisorio = provisorio || !!faixa?.provisorio;
          const diaSemana = new Date(`${d.data}T00:00:00Z`).getUTCDay();
          const feriado = refs.feriados?.linhas.some(
            (f) => d.data >= String(f.inicio) && d.data <= String(f.fim),
          );
          sugerido =
            baseOnibus === null
              ? null
              : calcularOnibus(
                  Math.round(baseOnibus * 100),
                  valorReferencia(
                    refs,
                    "porte_onibus",
                    d.porteOnibus ?? "45",
                  ) ?? 1,
                  1 + temporada(d.data, refs, "temporada_onibus").adicional,
                  diaSemana === 0 || diaSemana === 6 || feriado
                    ? (valorReferencia(refs, "fatores", "onibus_fds") ?? 1.2)
                    : 0,
                  refs,
                );
        }
        if (
          !["completo", "meio", "livre", "deslocamento"].includes(d.periodo) ||
          !["economico", "padrao", "premium", "vip"].includes(
            contexto.categoria,
          )
        )
          sugerido = null;
        if (
          minutos === null &&
          quantidade > 0 &&
          !avisos.includes("Informe os horários do período")
        )
          avisos.push("Informe os horários do período");
      }
      if (l.item && contexto) {
        const pax = l.viajanteIds ? pessoasLinha.length : paxDia;
        const item = precoItem(
          l.item,
          pax,
          d.data,
          contexto.referencias,
          l.custoFornecedor,
        );
        if (["agua", "cortesia", "kit"].includes(l.item)) {
          const valor = valorReferencia(
            contexto.referencias,
            "kit",
            contexto.categoria,
            l.item === "kit" ? "ticket" : l.item,
          );
          item.unitario = valor === null ? null : valor * 100;
        }
        if (
          l.item.startsWith("ktx_") &&
          temporada(d.data, contexto.referencias).feriado
        )
          provisorio =
            !!contexto.referencias.fatores?.linhas.find(
              (r) => r.id === "ktx_feriado",
            )?.provisorio || provisorio;
        if (l.item.startsWith("transfer:")) {
          const [, trecho, nivel] = l.item.split(":");
          const base = valorReferencia(
            contexto.referencias,
            "transfers",
            trecho,
            nivel,
          );
          item.unitario =
            base === null
              ? null
              : Math.round(
                  base *
                    100 *
                    (1 +
                      temporada(d.data, contexto.referencias).adicional +
                      (contexto.categoria === "vip"
                        ? (valorReferencia(
                            contexto.referencias,
                            "fatores",
                            "vip_transfer",
                          ) ?? 0.2)
                        : 0)),
                );
          item.quantidade = 1;
          if (
            ["completo", "meio"].includes(d.periodo) &&
            d.linhas.some(
              (l) =>
                l.regra === "carro" &&
                (l.quantidade > 0 || !l.quantidadeManual),
            )
          ) {
            item.quantidade = 0;
            quantidade = 0;
          }
        }
        provisorio =
          provisorio ||
          !!contexto.referencias.tickets?.linhas.find(
            (r) => r.id === (l.item === "ktx_guia" ? "ktx_economica" : l.item),
          )?.provisorio;
        sugerido = item.unitario;
        grupo = item.grupo;
        if (!l.quantidadeManual) quantidade = item.quantidade;
        if (l.automatica && ["livre", "deslocamento"].includes(d.periodo))
          quantidade = 0;
      }
      const aplicado = l.regra || l.item ? (l.valor ?? sugerido) : l.valor;
      const centavosOriginais = ["KRW", "JPY"].includes(l.moeda) ? 1 : 100;
      const convertido =
        l.moeda === "USD"
          ? aplicado
          : ["KRW", "JPY", "BRL", "EUR"].includes(l.moeda) &&
              aplicado !== null &&
              l.taxa &&
              l.dataTaxa
            ? (aplicado / centavosOriginais / l.taxa) *
              (contexto
                ? (valorReferencia(
                    contexto.referencias,
                    "pagamentos",
                    "cambio",
                  ) ?? 1.1)
                : 1.1) *
              100
            : null;
      let total =
        quantidade === 0
          ? 0
          : convertido === null
            ? null
            : convertido * quantidade;
      if (
        l.porViajante &&
        contexto?.viajantes &&
        !(l.automatica && ["livre", "deslocamento"].includes(d.periodo))
      ) {
        quantidade = pessoasLinha.length;
        const fator =
          l.moeda === "USD"
            ? 1
            : l.taxa
              ? (100 / centavosOriginais / l.taxa) *
                (valorReferencia(
                  contexto.referencias,
                  "pagamentos",
                  "cambio",
                ) ?? 1.1)
              : null;
        total =
          fator === null || aplicado === null
            ? null
            : pessoasLinha.reduce((s, p) => {
                const tarifa =
                  p.idade !== null &&
                  l.tarifaCrianca !== undefined &&
                  p.idade <= (l.idadeCriancaMax ?? 12)
                    ? l.tarifaCrianca
                    : p.idade !== null &&
                        l.seniorElegivel &&
                        l.tarifaSenior !== undefined &&
                        p.idade >= (l.idadeSeniorMin ?? 65)
                      ? l.tarifaSenior
                      : aplicado;
                return s + tarifa * fator;
              }, 0);
      }
      if (l.hotel && convertido !== null) {
        const fatorCambio =
          l.moeda === "USD"
            ? 1
            : l.taxa
              ? (100 / centavosOriginais / l.taxa) *
                (contexto
                  ? (valorReferencia(
                      contexto.referencias,
                      "pagamentos",
                      "cambio",
                    ) ?? 1.1)
                  : 1.1)
              : 0;
        total =
          (convertido * (1 + l.hotel.taxas) + l.hotel.cafe * fatorCambio) *
          l.hotel.quartos *
          l.hotel.noites *
          (1 +
            (contexto
              ? (valorReferencia(contexto.referencias, "fatores", "hotel") ??
                0.05)
              : 0.05));
      }
      if (l.terceiro) total = 0;
      if (total === null) avisos.push(`${l.nome}: a informar`);
      else if (l.grupo === "hotel") hoteis += total;
      else if (grupo === "terceiros") terceiros += total;
      else servicos += total;
      return {
        ...l,
        grupo,
        quantidade,
        sugerido,
        aplicado,
        convertido,
        provisorio,
        total,
      };
    }),
  );
  const margem = servicos * opcao.margem;
  const calculado = Math.round(servicos + margem + hoteis + terceiros);
  const sugerido = Math.ceil(calculado / 1000) * 1000;
  const enviado = opcao.precoEnviado ?? sugerido;
  if (opcao.pagantes <= 0) avisos.push("Informe os pagantes");
  const equipe = contexto
    ? sugerirEquipe(contexto.categoria, opcao.pagantes + opcao.gratuidades)
    : { guias: 1, assistentes: 0 };
  const gorjeta =
    opcao.mostrarGorjeta && contexto
      ? gorjetaSugerida(
          opcao.pagantes + opcao.gratuidades,
          contexto.categoria,
          equipe.guias,
          equipe.assistentes,
          1,
          contexto.referencias,
        ) * opcao.dias.length
      : null;
  const cobradas = linhas.filter((l) => (l.total ?? 0) > 0);
  const custoReal = cobradas.every((l) => l.custoRealUSD !== undefined)
    ? cobradas.reduce((s, l) => s + l.custoRealUSD!, 0)
    : null;
  const margemReal =
    custoReal !== null && enviado > 0 ? (enviado - custoReal) / enviado : null;
  const piso = contexto
    ? (valorReferencia(contexto.referencias, "pagamentos", "margem_minima") ??
      0.1)
    : 0.1;
  if (margemReal !== null && margemReal < piso)
    avisos.push(`Margem abaixo de ${piso * 100}%; registre o motivo`);
  const comissaoInfluencer =
    contexto?.canal === "influencer"
      ? Math.round(
          enviado *
            (valorReferencia(contexto.referencias, "fatores", "influencer") ??
              0.05),
        )
      : 0;
  return {
    pisoMargem: piso,
    margemReal,
    custoReal,
    comissaoInfluencer,
    gorjeta,
    linhas: linhas.map((l) => ({
      ...l,
      sugerido: l.sugerido === null ? null : Math.round(l.sugerido),
      convertido: l.convertido === null ? null : Math.round(l.convertido),
      total: l.total === null ? null : Math.round(l.total),
    })),
    servicos: Math.round(servicos),
    margem: Math.round(margem),
    hoteis: Math.round(hoteis),
    terceiros: Math.round(terceiros),
    calculado,
    sugerido,
    enviado,
    diferenca: enviado - calculado,
    porPessoa: opcao.pagantes > 0 ? Math.round(enviado / opcao.pagantes) : null,
    avisos,
  };
}

export function alternativasTransporte(
  opcao: OpcaoOrcamento,
  dia: DiaOrcamento,
  contexto: ContextoCalculo,
) {
  const pax = opcao.pagantes + opcao.gratuidades;
  const equipe = sugerirEquipe(contexto.categoria, pax);
  const staff = equipe.guias + equipe.assistentes;
  return ["solati", "onibus"].map((modelo) => {
    const capacidade =
      modelo === "onibus"
        ? Number(dia.porteOnibus ?? 45) - 1 - staff
        : Math.min(
            avaliarVeiculo(modelo, 0, staff, 0, contexto.referencias)
              .capacidade ?? 1,
            Number(
              contexto.referencias.frota?.linhas.find((l) => l.id === modelo)
                ?.conforto ?? 1,
            ),
          );
    const quantidade = Math.ceil(pax / Math.max(1, capacidade));
    const c = calcularOpcao(
      {
        ...opcao,
        dias: [
          {
            ...dia,
            veiculo: modelo,
            linhas: [
              {
                id: "comparacao",
                nome: modelo,
                regra: "carro",
                valor: null,
                quantidade,
                quantidadeManual: true,
                moeda: "USD",
                grupo: "servicos",
              },
            ],
          },
        ],
      },
      contexto,
    );
    return { modelo, quantidade, total: c.linhas[0].total };
  });
}
