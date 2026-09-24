import { expect, it } from "vitest";
import { calcularOpcao, type OpcaoOrcamento } from "./calculo";
import { avaliarVeiculo } from "./transportes";
import { tabelasIniciais } from "~/modules/tabelas/referencias";
const referencias = Object.fromEntries(
  tabelasIniciais.map((t) => [t.codigo, t]),
);
const contexto = { canal: "agencia", categoria: "padrao", referencias };
const opcao = (): OpcaoOrcamento => ({
  id: "o",
  nome: "Teste",
  pagantes: 2,
  gratuidades: 0,
  margem: 0,
  dias: [
    {
      id: "d",
      data: "2026-07-06",
      cidade: "Seul",
      periodo: "completo",
      manha: "",
      almoco: "",
      tarde: "",
      horaInicio: "18:00",
      horaFim: "01:00",
      linhas: [
        {
          id: "g",
          nome: "Guia",
          regra: "guia",
          valor: null,
          quantidade: 1,
          moeda: "USD",
          grupo: "servicos",
        },
      ],
    },
  ],
});
it("noturno continua após meia-noite", () => {
  expect(calcularOpcao(opcao(), contexto).linhas[0].total).toBe(30450);
});
it("conforto é avaliado mesmo sem malas", () =>
  expect(avaliarVeiculo("carnival", 5, 1, 0, referencias)).toMatchObject({
    confortoExcedido: true,
    assentosInsuficientes: false,
  }));
it("ônibus usa a faixa de distância e duração informadas", () => {
  const o = opcao();
  Object.assign(o.dias[0], {
    veiculo: "onibus",
    distanciaOnibus: 350,
    duracaoOnibus: 2,
  });
  o.dias[0].linhas[0].regra = "carro";
  expect(calcularOpcao(o, contexto).linhas[0].total).toBe(123894);
});
it("transfer aplica VIP e temporada sem margem duplicada", () => {
  const o = opcao();
  o.dias[0].linhas = [
    {
      id: "t",
      nome: "Transfer",
      item: "transfer:incheon:recepcao",
      valor: null,
      quantidade: 1,
      moeda: "USD",
      grupo: "servicos",
    },
  ];
  expect(
    calcularOpcao(o, { ...contexto, categoria: "vip" }).linhas[0].total,
  ).toBe(16500);
});
it("provisoriedade da referência acompanha a linha", () => {
  const o = opcao();
  o.dias[0].linhas[0].regra = "carro";
  o.dias[0].veiculo = "carnival";
  expect(calcularOpcao(o, contexto).linhas[0].provisorio).toBe(true);
});
it("transfer de terceiro ou quantidade zero não encarece o carro", () => {
  const o = opcao();
  o.dias[0].horaInicio = "09:00";
  o.dias[0].horaFim = "18:00";
  o.dias[0].veiculo = "carnival";
  o.dias[0].linhas = [
    {
      id: "c",
      nome: "Carro",
      regra: "carro",
      valor: null,
      quantidade: 1,
      moeda: "USD",
      grupo: "servicos",
    },
  ];
  const base = calcularOpcao(o, contexto).linhas[0].total;
  const transfer = {
    id: "t",
    nome: "Transfer",
    item: "transfer:incheon:simples",
    valor: null,
    quantidade: 1,
    moeda: "USD",
    grupo: "servicos" as const,
    terceiro: true,
  };
  o.dias[0].linhas.push(transfer);
  expect(calcularOpcao(o, contexto).linhas[0].total).toBe(base);
  Object.assign(transfer, {
    terceiro: false,
    quantidade: 0,
    quantidadeManual: true,
  });
  expect(calcularOpcao(o, contexto).linhas[0].total).toBe(base);
});
it("ônibus usa padrão provisório e respeita período desconhecido", () => {
  const o = opcao();
  o.dias[0].veiculo = "onibus";
  o.dias[0].linhas[0].regra = "carro";
  o.dias[0].horaInicio = "09:00";
  o.dias[0].horaFim = "18:00";
  expect(calcularOpcao(o, contexto).linhas[0].provisorio).toBe(true);
  o.dias[0].periodo = "Excepcional";
  expect(calcularOpcao(o, contexto).linhas[0].sugerido).toBeNull();
});
