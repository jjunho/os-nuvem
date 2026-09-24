import { expect, it } from "vitest";
import { calcularOpcao, type OpcaoOrcamento } from "./calculo";
const opcao = (valor: number, precoEnviado?: number): OpcaoOrcamento => ({
  id: "a",
  nome: "Opção A",
  pagantes: 10,
  gratuidades: 2,
  margem: 0,
  precoEnviado,
  dias: [
    {
      id: "d",
      data: "2026-10-28",
      cidade: "Seul",
      periodo: "completo",
      manha: "",
      almoco: "",
      tarde: "",
      linhas: [
        {
          id: "l",
          nome: "Serviço",
          quantidade: 1,
          valor,
          moeda: "USD",
          grupo: "servicos",
        },
      ],
    },
  ],
});
it("arredonda apenas o total, divide por pagantes e mantém diferença negociada", () => {
  expect(calcularOpcao(opcao(123300))).toMatchObject({
    calculado: 123300,
    sugerido: 124000,
    enviado: 124000,
    porPessoa: 12400,
    diferenca: 700,
  });
  expect(calcularOpcao(opcao(123300, 120000))).toMatchObject({
    calculado: 123300,
    enviado: 120000,
    porPessoa: 12000,
    diferenca: -3300,
  });
});
it("quantidades e margem incidem somente nos serviços; hotel fica separado", () => {
  const o = opcao(10000);
  o.margem = 0.2;
  o.dias[0].linhas[0].quantidade = 3;
  o.dias[0].linhas.push({
    id: "h",
    nome: "Hotel",
    valor: 315000,
    quantidade: 1,
    moeda: "USD",
    grupo: "hotel",
  });
  expect(calcularOpcao(o)).toMatchObject({
    servicos: 30000,
    margem: 6000,
    hoteis: 315000,
    calculado: 351000,
  });
});
it("sem pagantes ou com custo desconhecido informa o que falta", () => {
  const o = opcao(0);
  o.pagantes = 0;
  o.dias[0].linhas[0].valor = null;
  const c = calcularOpcao(o);
  expect(c.porPessoa).toBeNull();
  expect(c.avisos).toContain("Informe os pagantes");
  expect(c.avisos).toContain("Serviço: a informar");
});
it("converte KRW com taxa registrada e segurança sem reconverter USD", () => {
  const o = opcao(632000);
  o.dias[0].linhas[0] = {
    ...o.dias[0].linhas[0],
    moeda: "KRW",
    taxa: 1350,
    dataTaxa: "2026-09-24",
    fonteTaxa: "Naver",
  };
  expect(calcularOpcao(o).calculado).toBe(51496);
  o.dias[0].linhas[0].taxa = 1400;
  expect(calcularOpcao(o).calculado).toBe(49657);
  o.dias[0].linhas[0].moeda = "USD";
  o.dias[0].linhas[0].valor = 20000;
  expect(calcularOpcao(o).calculado).toBe(20000);
});
it("dia e linha usam somente os viajantes selecionados e a tarifa de idade elegível", () => {
  const o = opcao(0);
  o.pagantes = 8;
  o.dias[0].viajanteIds = [1, 2, 3, 4, 5, 6];
  o.dias[0].linhas = [
    {
      id: "entrada",
      nome: "Ingresso",
      valor: 1000,
      quantidade: 8,
      moeda: "USD",
      grupo: "servicos",
      porViajante: true,
      tarifaCrianca: 500,
      idadeCriancaMax: 12,
    },
  ];
  const viajantes = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    idade: i === 0 ? 8 : 30,
    pagante: true,
    nome: `Pessoa ${i + 1}`,
  }));
  expect(
    calcularOpcao(o, {
      canal: "cliente_final",
      categoria: "padrao",
      referencias: {},
      viajantes,
    }).calculado,
  ).toBe(5500);
  o.dias[0].linhas[0].viajanteIds = [1, 2];
  expect(
    calcularOpcao(o, {
      canal: "cliente_final",
      categoria: "padrao",
      referencias: {},
      viajantes,
    }).calculado,
  ).toBe(1500);
});
it("tarifa sênior não se presume elegível a estrangeiros", () => {
  const o = opcao(1000);
  o.dias[0].linhas[0] = {
    ...o.dias[0].linhas[0],
    porViajante: true,
    tarifaSenior: 0,
    idadeSeniorMin: 65,
  };
  const contexto = {
    canal: "operadora",
    categoria: "premium",
    referencias: {},
    viajantes: [{ id: 1, idade: 67, pagante: true, nome: "Cliente" }],
  };
  expect(calcularOpcao(o, contexto).calculado).toBe(1000);
  o.dias[0].linhas[0].seniorElegivel = true;
  expect(calcularOpcao(o, contexto).calculado).toBe(0);
});
it("hotel é calculado por quarto/noite com segurança fora da margem e terceiro sem cobrança", () => {
  const o = opcao(300000);
  o.margem = 0.2;
  o.dias[0].linhas[0] = {
    ...o.dias[0].linhas[0],
    grupo: "hotel",
    hotel: {
      nome: "Hotel",
      endereco: "Rua do Hotel",
      quartos: 1,
      noites: 1,
      taxas: 0,
      cafe: 0,
      ocupacao: "duplo",
      fonte: "Booking",
      dataFonte: "2026-09-24",
    },
  };
  expect(calcularOpcao(o)).toMatchObject({ hoteis: 315000, calculado: 315000 });
  o.dias[0].linhas[0].terceiro = true;
  expect(calcularOpcao(o).calculado).toBe(0);
  expect(o.dias[0].linhas[0].hotel?.endereco).toBe("Rua do Hotel");
});
it("margem real usa custos completos; sem eles é não verificável; comissão não muda preço", () => {
  const o = opcao(100000, 100000);
  o.dias[0].linhas[0].custoRealUSD = 91000;
  expect(calcularOpcao(o).margemReal).toBe(0.09);
  delete o.dias[0].linhas[0].custoRealUSD;
  expect(calcularOpcao(o).margemReal).toBeNull();
  expect(
    calcularOpcao(o, {
      canal: "influencer",
      categoria: "padrao",
      referencias: {},
    }),
  ).toMatchObject({ comissaoInfluencer: 5000, enviado: 100000 });
});
