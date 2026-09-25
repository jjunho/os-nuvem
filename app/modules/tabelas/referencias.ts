import { condicoesPadrao } from "~/modules/orcamentos/versoes";
import type { ColunaReferencia, DadosReferencia } from "./linha";
export type TabelaInicial = DadosReferencia & {
  codigo: string;
  titulo: string;
};
const numero = (chave: string, nome: string): ColunaReferencia => ({
  chave,
  nome,
  tipo: "numero",
});
const texto = (chave: string, nome: string): ColunaReferencia => ({
  chave,
  nome,
  tipo: "texto",
});
const data = (chave: string, nome: string): ColunaReferencia => ({
  chave,
  nome,
  tipo: "data",
});
const calendario = (
  codigo: string,
  titulo: string,
  faixas: [string, string, string, number][],
): TabelaInicial => ({
  codigo,
  titulo,
  colunas: [
    texto("inicio", "Início (MM-DD)"),
    texto("fim", "Fim (MM-DD)"),
    numero("fator", "Fator"),
  ],
  linhas: faixas.map(([nome, inicio, fim, fator], i) => ({
    id: `faixa${i}`,
    nome,
    inicio,
    fim,
    fator,
  })),
});
const valores = (
  codigo: string,
  titulo: string,
  linhas: [string, string, number | null, string?][],
): TabelaInicial => ({
  codigo,
  titulo,
  colunas: [numero("valor", "Valor"), texto("unidade", "Unidade")],
  linhas: linhas.map(([id, nome, valor, unidade]) => ({
    id,
    nome,
    valor,
    unidade: unidade ?? "USD",
  })),
});
export const tabelasIniciais: TabelaInicial[] = [
  {
    codigo: "condicoes_proposta",
    titulo: "Condições padrão da proposta",
    colunas: [texto("valor", "Valor")],
    linhas: Object.entries(condicoesPadrao)
      .filter(([id]) => !["generica", "detalhe", "notasB2B"].includes(id))
      .map(([id, valor]) => ({
        id,
        nome: (
          {
            sinal: "Sinal (%)",
            saldoDias: "Saldo: dias antes",
            validadeDias: "Validade em dias",
            cancelamento: "Cancelamento",
            formasPagamento: "Formas de pagamento",
            dadosBancarios: "Dados bancários",
            incluso: "Incluso",
            naoIncluso: "Não incluso",
            iva: "IVA",
          } as Record<string, string>
        )[id],
        valor: String(valor),
      })),
  },
  valores("jornada", "Jornada e horas extras", [
    ["extra_carro", "Hora extra carro", 0.08, "adicional"],
    ["extra_equipe", "Hora extra guia/assistente", 0.07, "adicional"],
    ["noturno", "Noturno após 21h", 0.15, "adicional"],
  ]),
  {
    codigo: "equipe",
    titulo: "Guia e Assistente",
    colunas: [
      numero("guia", "Guia USD"),
      numero("assistente", "Assistente USD"),
    ],
    linhas: [
      {
        id: "operadora",
        nome: "Interep/Operadora",
        guia: 260,
        assistente: 180,
      },
      { id: "agencia", nome: "Agência", guia: 290, assistente: 200 },
      {
        id: "cliente_final",
        nome: "Cliente final",
        guia: 320,
        assistente: 220,
      },
      { id: "influencer", nome: "Influencer", guia: 320, assistente: 220 },
    ],
  },
  calendario("temporada_corealux", "Temporada CoreaLux", [
    ["Alta", "03-25", "05-31", 1.2],
    ["Alta", "07-15", "08-17", 1.2],
    ["Alta", "09-26", "10-31", 1.2],
    ["Alta", "12-20", "01-14", 1.2],
    ["Média", "03-15", "03-24", 1.1],
    ["Média", "06-01", "06-15", 1.1],
    ["Média", "09-05", "09-25", 1.1],
    ["Baixa", "01-15", "03-14", 0.9],
    ["Baixa", "06-20", "07-14", 0.9],
    ["Baixa", "08-18", "09-04", 0.9],
    ["Baixa", "11-20", "12-10", 0.9],
    ["Base", "06-16", "06-19", 1],
    ["Base", "11-01", "11-19", 1],
    ["Base", "12-11", "12-19", 1],
  ]),
  calendario("temporada_jeju", "Temporada de voos Jeju", [
    ["Alta", "07-01", "08-31", 1],
    ["Alta", "03-15", "05-15", 1],
  ]),
  calendario("temporada_onibus", "Temporada do fornecedor de ônibus", [
    ["Baixa", "07-01", "08-31", 0.9],
    ["Baixa", "12-01", "02-ultimo", 0.9],
    ["Alta", "03-01", "06-30", 1.2],
    ["Alta", "09-01", "11-30", 1.2],
  ]),
  {
    codigo: "feriados",
    titulo: "Feriados nacionais coreanos",
    colunas: [
      data("inicio", "Início"),
      data("fim", "Fim"),
      texto("fonte", "Fonte"),
    ],
    linhas: [],
  },
  {
    codigo: "eventos",
    titulo: "Eventos especiais",
    colunas: [
      data("inicio", "Início"),
      data("fim", "Fim"),
      numero("adicional", "Adicional sobre guia e carro"),
    ],
    linhas: [],
  },
  {
    codigo: "frota",
    titulo: "Frota e tarifas",
    colunas: [
      numero("operadora", "Operadora USD"),
      numero("agencia", "Agência USD"),
      numero("cliente_final", "Cliente final USD"),
      numero("assentos", "Assentos físicos"),
      numero("conforto", "Clientes com conforto"),
      texto("motorista", "Motorista"),
    ],
    linhas: [
      {
        id: "spark",
        nome: "Spark próprio",
        operadora: 120,
        agencia: 130,
        cliente_final: 150,
        assentos: 5,
        conforto: 3,
        motorista: "guia",
        provisorio: "Confirmar configuração do veículo",
      },
      {
        id: "tucson",
        nome: "Tucson próprio",
        operadora: 120,
        agencia: 130,
        cliente_final: 150,
        assentos: 5,
        conforto: 3,
        motorista: "guia",
        provisorio: "Confirmar configuração do veículo",
      },
      {
        id: "carnival_propria",
        nome: "Carnival própria",
        operadora: null,
        agencia: null,
        cliente_final: null,
        assentos: null,
        conforto: 4,
        motorista: "guia",
      },
      ...(
        [
          ["sedan", "Sedan externo", 180, 190, 200, 5, 2],
          ["carnival", "Kia Carnival externa", 210, 220, 230, 9, 4],
          ["staria", "Hyundai Staria", 210, 220, 230, 11, 6],
          ["solati", "Hyundai Solati", 290, 310, 340, 15, 8],
          ["sprinter", "Mercedes Sprinter", 370, 400, 450, 13, 11],
        ] as const
      ).map(
        ([
          id,
          nome,
          operadora,
          agencia,
          cliente_final,
          assentos,
          conforto,
        ]) => ({
          id,
          nome,
          operadora,
          agencia,
          cliente_final,
          assentos,
          conforto,
          motorista: "incluído",
          provisorio: "Assentos a confirmar no veículo efetivo",
        }),
      ),
    ],
  },
  {
    codigo: "transfers",
    titulo: "Transfers",
    colunas: [
      numero("simples", "Só deixar/pegar USD"),
      numero("recepcao", "Funcionário USD"),
      numero("placa", "Motorista com placa USD"),
      numero("checkin", "Check-in USD"),
      numero("onibus", "Ônibus USD"),
    ],
    linhas: [
      ["gimpo", "Gimpo ↔ hotel Seul", 50, 80, 80, 90, 300],
      ["incheon", "Incheon ↔ hotel Seul", 100, 150, 120, 150, 350],
      ["gimhae", "Gimhae ↔ hotel Busan", 100, 150, 120, 150, 350],
      ["jeju_city", "Jeju ↔ Jeju City", 40, null, 60, 80, 200],
      ["seogwipo", "Jeju ↔ Seogwipo", 100, null, 120, 140, 300],
      ["estacao_seul", "Hotel ↔ estação Seul", 40, 40, 60, null, 150],
      [
        "estacao_busan",
        "Hotel ↔ estação Busan/Gyeongju",
        60,
        60,
        60,
        null,
        150,
      ],
      ["gyeongju_busan", "Gyeongju ↔ Busan", 100, 100, 100, 100, 300],
    ].map(([id, nome, simples, recepcao, placa, checkin, onibus]) => ({
      id: String(id),
      nome: String(nome),
      simples,
      recepcao,
      placa,
      checkin,
      onibus,
    })),
  },
  valores("tickets", "Ingressos e transportes", [
    ["kit_busan", "Kit Busan", 30],
    ["dmz", "DMZ", 20],
    ["san", "Museu SAN", 60],
    ["sayuwon", "Sayuwon", 60],
    ["jeju_premium", "Jeju atração premium", 40],
    ["haenyeo", "Haenyeo Kitchen (inclui guia)", 70],
    ["sky_capsule", "Sky Capsule / até 4 pessoas", 60],
    ["especial", "Atração especial", 30],
    ["duas_especiais", "Duas atrações especiais", 60],
    ["ktx_economica", "KTX econômica", 70],
    ["ktx_executiva", "KTX executiva", 100],
    ["bagagem_trecho", "Transporte separado de bagagem / pessoa", 30],
    ["caminhao_icn", "Caminhão ICN ↔ Seul", 150],
    ["voo_bagagem", "Voo: 5 kg adicionais", 10],
    ["jeju_alta", "Jeju alta / sex–dom", 100],
    ["jeju_quinta", "Jeju quinta", 80],
    ["jeju_baixa", "Jeju seg–qua", 60],
    ["pernoite_equipe", "Pernoite da equipe", 70],
  ]),
  {
    codigo: "kit",
    titulo: "Kit, água e cortesia",
    colunas: [
      numero("agua", "Água USD"),
      numero("cortesia", "Cortesia USD"),
      numero("ticket", "Kit básico USD"),
    ],
    linhas: [
      { id: "economico", nome: "Econômico", agua: 1, cortesia: 3, ticket: 15 },
      { id: "padrao", nome: "Padrão", agua: 1, cortesia: 5, ticket: 15 },
      { id: "premium", nome: "Premium", agua: 2, cortesia: 7.5, ticket: 15 },
      { id: "vip", nome: "VIP", agua: 2, cortesia: 10, ticket: 15 },
    ],
  },
  valores("gorjetas", "Gorjetas sugeridas", [
    ["motorista", "Motorista / cliente / dia", 2],
    ["guia", "Guia / cliente / dia", 4],
    ["assistente", "Assistente / cliente / dia", 2],
    ["backoffice", "Back office / cliente / dia", 5],
    ["premium_vip", "Adicional Premium/VIP por categoria", 3],
  ]),
  valores("fatores", "Fatores de cálculo", [
    ["regional", "Carro fora de Seul", 0.2, "adicional"],
    ["vip_carro", "Carro VIP", 0.1, "adicional"],
    ["vip_transfer", "Transfer VIP", 0.2, "adicional"],
    ["carro_transfer", "Transfer no dia com carro", 0.15, "adicional"],
    ["sem_guia", "Motorista em inglês sem guia", 0.2, "adicional"],
    ["evento", "Evento especial", 0.1, "adicional"],
    ["jinhae", "Jinhae carro", 100],
    ["meia", "Até 4h", 0.6, "fator"],
    ["intermediaria", "Mais de 4h até 6h", 0.8, "fator"],
    ["hora_extra", "Hora extra carro", 0.08, "adicional"],
    ["ktx_feriado", "KTX em feriado", 0.2, "adicional"],
    ["hotel", "Segurança hotel", 0.05, "adicional"],
    ["voo_equipe", "Segurança voo equipe", 0.15, "adicional"],
    ["onibus", "Intermediação ônibus", 0.15, "adicional"],
    ["influencer", "Comissão Influencer", 0.05, "percentual"],
    ["processamento", "Processamento cancelamento", 0.1, "percentual"],
    ["espera", "Espera após 90 minutos", 0.1, "adicional"],
    ["feriado_janela", "Janela de feriado antes/depois", 2, "dias"],
    ["temporada_feriado", "Temporada de feriado", 1.2, "fator"],
    ["onibus_fds", "Ônibus fim de semana/feriado", 1.2, "fator"],
    ["pernoite_especial", "Pernoite sex/dom/véspera", 0.2, "adicional"],
  ]),
  valores("pagamentos", "Pagamento e câmbio", [
    ["cartao", "Cartão", 1.05, "fator"],
    ["pix", "PIX", 1.035, "fator"],
    ["cambio", "Segurança câmbio KRW/USD", 1.1, "fator"],
    ["sinal", "Sinal inicial", 0.2, "percentual"],
    ["iva", "IVA (desligado por padrão)", 0.1, "percentual"],
    ["taxa_roteiro", "Taxa de roteiro (suspensa)", 0],
    ["margem_minima", "Margem mínima", 0.1, "percentual"],
  ]),
  valores("porte_onibus", "Porte do ônibus", [
    ["16", "16 lugares", 0.8, "fator"],
    ["25", "25 lugares", 0.7, "fator"],
    ["45", "45 lugares", 1, "fator"],
    ["28", "Limousine 28 lugares", 1.3, "fator"],
  ]),
  {
    codigo: "onibus_distancia",
    titulo: "Ônibus por distância e duração",
    colunas: [
      numero("km", "Menos de km"),
      numero("dia1", "Um dia USD"),
      numero("dia2", "Dois dias USD"),
      numero("dia3", "Três dias USD"),
      numero("dia4", "Quatro dias USD"),
    ],
    linhas: [
      [200, 468.148, 862.222, 1256.3, 1626.67],
      [300, 629.63, 1029.63, 1423.7, 1794.07],
      [400, 802.963, 1197.04, 1591.11, 1961.48],
      [500, 936.296, 1330.37, 1724.44, 2094.81],
      [600, 1084.44, 1478.52, 1872.59, 2242.96],
      [700, 1232.59, 1626.67, 2020.74, 2391.11],
      [800, 1380.74, 1774.81, 2168.89, 2539.26],
      [900, 1528.89, 1922.96, 2317.04, 2687.41],
    ].map(([km, dia1, dia2, dia3, dia4]) => ({
      provisorio: "Fórmula provisória — docs/padroes-provisorios.md",
      id: String(km),
      nome: `Até ${km} km`,
      km,
      dia1,
      dia2,
      dia3,
      dia4,
    })),
  },
];
for (const tabela of tabelasIniciais)
  for (const linha of tabela.linhas) {
    if (
      [
        "meia",
        "intermediaria",
        "espera",
        "feriado_janela",
        "ktx_feriado",
        "margem_minima",
        "cartao",
        "iva",
      ].includes(linha.id)
    )
      linha.provisorio = "Padrão provisório — docs/padroes-provisorios.md";
  }

// Korean Tourism Organization, 2026 national holidays; maintained by year in the versioned table.
const feriados2026 = [
  ["Ano Novo", "01-01", "01-01"],
  ["Seollal", "02-16", "02-18"],
  ["Movimento de Independência", "03-01", "03-02"],
  ["Dia das Crianças", "05-05", "05-05"],
  ["Aniversário de Buda", "05-24", "05-25"],
  ["Eleições locais", "06-03", "06-03"],
  ["Memorial", "06-06", "06-06"],
  ["Constituição", "07-17", "07-17"],
  ["Libertação", "08-15", "08-15"],
  ["Libertação (substituto)", "08-17", "08-17"],
  ["Chuseok", "09-24", "09-26"],
  ["Fundação Nacional", "10-03", "10-03"],
  ["Fundação Nacional (substituto)", "10-05", "10-05"],
  ["Hangul", "10-09", "10-09"],
  ["Natal", "12-25", "12-25"],
];
tabelasIniciais.find((t) => t.codigo === "feriados")!.linhas = feriados2026.map(
  ([nome, inicio, fim], i) => ({
    id: `2026-${i}`,
    nome: `${nome} 2026`,
    inicio: `2026-${inicio}`,
    fim: `2026-${fim}`,
    fonte:
      "https://english.visitkorea.or.kr/svc/contents/infoHtmlView.do?vcontsId=140045",
  }),
);
