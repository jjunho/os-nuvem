import { expect, it } from "vitest";
import {
  calcularOnibus,
  sugerirVeiculo,
  avaliarVeiculo,
  multaOnibus,
} from "./transportes";
import { tabelasIniciais } from "~/modules/tabelas/referencias";
const refs = Object.fromEntries(tabelasIniciais.map((t) => [t.codigo, t]));
it("ônibus tem intermediação própria e multa sem intermediação", () => {
  expect(calcularOnibus(46800, 1, 1, 1, refs)).toBe(53820);
  expect(multaOnibus(10000, refs)).toBe(11000);
});
it("14 Premium em Solati alerta assentos sem recomendar caminhão como solução", () => {
  const r = avaliarVeiculo("solati", 14, 2, 28, refs);
  expect(r.assentosInsuficientes).toBe(true);
  expect(r.capacidade).toBe(12);
  expect(r.solucoes).not.toContain("Caminhão de bagagem");
});
it("13 VIP em Sprinter excede os 11 assentos líquidos mesmo com pouca bagagem", () =>
  expect(avaliarVeiculo("sprinter", 13, 1, 0, refs).capacidade).toBe(11));
it("bagagem reduzida muda a sugestão sem alterar assentos físicos", () => {
  expect(sugerirVeiculo(4, 1, 8, "padrao", refs).modelo).toBe("carnival");
  expect(sugerirVeiculo(4, 1, 16, "padrao", refs).modelo).toBe("solati");
});
it("grupo acima da capacidade de um ônibus recebe dois veículos", () =>
  expect(sugerirVeiculo(60, 2, 120, "premium", refs)).toMatchObject({
    modelo: "onibus",
    quantidade: 2,
  }));
