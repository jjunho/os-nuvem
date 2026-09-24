import { expect, it } from "vitest";
import {
  calcularOpcao,
  type DiaOrcamento,
  type LinhaCusto,
  type OpcaoOrcamento,
} from "./calculo";
import { tabelasIniciais } from "~/modules/tabelas/referencias";
const referencias = Object.fromEntries(
  tabelasIniciais.map((t) => [t.codigo, t]),
);
const linha = (
  id: string,
  valor: number,
  grupo: LinhaCusto["grupo"] = "servicos",
  quantidade = 1,
): LinhaCusto => ({
  id,
  nome: id,
  valor: Math.round(valor * 100),
  quantidade,
  moeda: "USD",
  grupo,
});
const regra = (id: "guia" | "assistente" | "carro"): LinhaCusto => ({
  ...linha(id, 0),
  regra: id,
  valor: null,
});
const dia = (
  data: string,
  cidade: string,
  linhas: LinhaCusto[],
  periodo = "completo",
): DiaOrcamento => ({
  id: data,
  data,
  cidade,
  periodo,
  manha: "",
  almoco: "",
  tarde: "",
  horaInicio: "09:00",
  horaFim: periodo === "meio" ? "13:00" : "18:00",
  linhas,
});
const item = (id: string, quantidade = 1): LinhaCusto => ({
  ...linha(id, 0, "servicos", quantidade),
  item: id,
  valor: null,
  quantidadeManual: true,
});
const hotel = (valor: number): LinhaCusto => ({
  ...linha("Hotel", valor, "hotel"),
  hotel: {
    nome: "Hotéis do orçamento original",
    endereco: "",
    quartos: 1,
    noites: 1,
    taxas: 0,
    cafe: 0,
    ocupacao: "single",
    fonte: "Cotação original",
    dataFonte: "2026-09-24",
  },
});
// Source: ../docs/01-extracoes-do-conhecimento-bruto/precificacao/orcamento-1-pax-out-2026-interep-leda-página1.md.
// Reprice the 13-day itinerary using current references, not the old computed daily totals:
// regional +20% (not10%), transfers on a car day +15% (not charged twice),
// KTX/flights outside margin, hotel×1.05, team flight×1.15, Jeju half-day separate.
function leda(): OpcaoOrcamento {
  const cidades = [
    "Seul",
    "Seul",
    "Seul",
    "Seul",
    "Gyeongju",
    "Busan",
    "Busan",
    "Jeju",
    "Jeju",
    "Jeju",
    "Seul",
    "Seul",
    "Seul",
  ];
  const periodos = [
    "meio",
    "completo",
    "completo",
    "completo",
    "meio",
    "completo",
    "completo",
    "meio",
    "completo",
    "completo",
    "meio",
    "livre",
    "livre",
  ];
  const entradas = [0, 15, 45, 45, 0, 60, 30, 0, 45, 35, 35, 0, 0];
  const dias = cidades.map((cidade, i) => {
    const d = dia(
      new Date(Date.UTC(2026, 8, 23 + i)).toISOString().slice(0, 10),
      cidade,
      [
        regra("guia"),
        ...(i > 0 && i < 11 ? [regra("carro")] : []),
        linha("Entradas", entradas[i]),
      ],
      periodos[i],
    );
    d.veiculo = "sedan";
    return d;
  });
  for (const i of [0, 4, 5, 7, 10, 12])
    dias[i].linhas.push(
      item(
        i === 0 || i === 12
          ? "transfer:incheon:simples"
          : "transfer:estacao_busan:simples",
      ),
    );
  dias[4].linhas.push(item("ktx_economica"), item("ktx_guia"));
  dias[7].linhas.push(
    linha("Meia diária Jeju", 187.2),
    linha("Pernoite equipe", 70),
    { ...item("voo_equipe"), custoFornecedor: 20000 },
    linha("Voo cliente ida/volta", 160, "terceiros"),
  );
  dias[8].linhas.push(linha("Pernoite equipe", 70));
  dias[9].linhas.push(linha("Pernoite equipe sexta", 84));
  dias[0].linhas.push(hotel(2601));
  return {
    id: "leda",
    nome: "Interep/Leda",
    pagantes: 1,
    gratuidades: 0,
    margem: 0.1,
    dias,
  };
}
// Independent current-rule ledger in USD: 307.2,543,573,573,354.6,651,594,611.8,679,683,368,0,120; services6057.60.
it.each([
  [0.1, 992441],
  [0.35, 1143881],
])(
  "Interep/Leda 13 dias: margem %s, hotéis e passagens separados",
  (margem, total) => {
    const o = leda();
    o.margem = margem;
    const c = calcularOpcao(o, {
      canal: "operadora",
      categoria: "padrao",
      referencias,
    });
    expect(c.hoteis).toBeCloseTo(273105);
    expect(c.terceiros).toBe(53000);
    expect(c.calculado).toBe(total);
  },
);
// Source: orcamento-marcelo-xtravel-abr-2026-orcamento-v5-6pax-a.md.
// Same 11-day programme for6–11; confirmed attraction quotes retained, current staffing,
// two Solatis above8 for comfort. Original hotel base14594.60/3 rooms stays a supplied USD quote;
// remove spreadsheet×1.02 and per-person×1.03, use×1.05. Rail70 and Jeju100 are outside margin.
function marcelo(pax: number): OpcaoOrcamento {
  const cidades = [
    "Seul",
    "Seul",
    "Seul",
    "Seul",
    "Gyeongju",
    "Busan",
    "Busan",
    "Jeju",
    "Jeju",
    "Seul",
    "Seul",
  ];
  const tickets = [0, 15, 50, 56, 35, 35, 30, 34, 25, 17, 0];
  const dias = cidades.map((cidade, i) => {
    const carro = regra("carro");
    carro.quantidadeManual = true;
    carro.quantidade = Math.ceil(pax / 8);
    const d = dia(
      `2026-04-${String(i + 1).padStart(2, "0")}`,
      cidade,
      [
        regra("guia"),
        regra("assistente"),
        ...(i > 0 && i < 10 ? [carro] : []),
        linha("Entradas cotadas", tickets[i], "servicos", pax + 1),
      ],
      i === 0 ? "meio" : "completo",
    );
    d.veiculo = "solati";
    return d;
  });
  for (const i of [0, 5, 6, 9, 10])
    dias[i].linhas.push(
      item(
        i === 0 || i === 10
          ? "transfer:incheon:recepcao"
          : "transfer:estacao_busan:simples",
      ),
    );
  dias[4].linhas.push(item("ktx_economica", pax), item("ktx_guia"));
  dias[8].linhas.push(item("voo_jeju", pax), {
    ...item("voo_equipe"),
    custoFornecedor: 10000,
  });
  dias[0].linhas.push(hotel((14594.6 / 3) * Math.ceil(pax / 2)));
  return {
    id: "marcelo",
    nome: "Marcelo Xtravel",
    pagantes: pax,
    gratuidades: 0,
    margem: 0.35,
    dias,
  };
}
// Service ledger: guide3688.80 + assistant2544 at8+ + Solati3797.50 per vehicle + entrances297×(pax+1) + transfers360.
it.each([
  [6, 2992849],
  [7, 3560755],
  [8, 3961290],
  [9, 5041858],
  [10, 5098953],
  [11, 5666859],
])("Marcelo Xtravel %i pagantes", (pax, esperado) => {
  const c = calcularOpcao(marcelo(pax), {
    canal: "agencia",
    categoria: "premium",
    referencias,
  });
  expect(c.calculado).toBe(esperado);
  expect(c.porPessoa).toBe(Math.round(c.enviado / pax));
});
it("Busan de Carlos: quatro clientes, kit30, uma cápsula e carro regional", () => {
  const d = dia("2026-11-10", "Busan", [
    regra("guia"),
    regra("carro"),
    item("kit_busan", 4),
    item("sky_capsule"),
  ]);
  d.veiculo = "carnival";
  const c = calcularOpcao(
    {
      id: "busan",
      nome: "Busan",
      pagantes: 4,
      gratuidades: 0,
      margem: 0.3,
      dias: [d],
    },
    { canal: "cliente_final", categoria: "padrao", referencias },
  );
  expect(c.servicos).toBe(77600);
  expect(c.enviado).toBe(101000);
});
