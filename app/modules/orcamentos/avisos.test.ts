import { expect, it } from "vitest";
import { calcularOpcao, type OpcaoOrcamento } from "./calculo";
import { tabelasIniciais } from "~/modules/tabelas/referencias";
const referencias = Object.fromEntries(
  tabelasIniciais.map((t) => [t.codigo, t]),
);
const opcao: OpcaoOrcamento = {
  id: "a",
  nome: "Curta",
  pagantes: 2,
  gratuidades: 0,
  margem: 0.2,
  dias: [
    {
      id: "d",
      data: "2026-11-10",
      cidade: "Jeju",
      periodo: "completo",
      manha: "",
      almoco: "",
      tarde: "",
      veiculo: "spark",
      linhas: [
        {
          id: "g",
          nome: "Guia",
          regra: "guia",
          valor: 10000,
          motivoAjuste: "Negociado",
          moeda: "USD",
          quantidade: 1,
          grupo: "servicos",
        },
        {
          id: "c",
          nome: "Carro",
          regra: "carro",
          valor: null,
          moeda: "USD",
          quantidade: 1,
          grupo: "servicos",
        },
      ],
    },
  ],
};
it("agência com menos de três dias e Jeju com menos de dois dias de guia recebem avisos", () => {
  const c = calcularOpcao(opcao, {
    canal: "agencia",
    categoria: "vip",
    referencias,
  });
  expect(c.avisos).toContain("Agência: viagem abaixo de 3 dias");
  expect(c.avisos).toContain("Jeju: menos de 2 dias de guia");
  expect(c.avisos).toContain("Carro próprio não recomendado para VIP");
  expect(c.enviado).toBeGreaterThan(0);
});
it("preço direto abaixo da agência é aviso comparando o mesmo serviço", () =>
  expect(
    calcularOpcao(opcao, {
      canal: "cliente_final",
      categoria: "padrao",
      referencias,
    }).avisos,
  ).toContain(
    "Guia: preço direto abaixo da tarifa Agência para o mesmo serviço",
  ));
