import { expect, it } from "vitest";
import { precoPagamento } from "./pagamento";
it.each([
  [210000, 220500],
  [42000, 44100],
])("cartão sobre parcela %i = %i", (valor, total) =>
  expect(precoPagamento(valor, "cartao")).toEqual({
    valor: total,
    moeda: "USD",
  }),
);
it("PIX converte somente a parcela paga e aplica IOF", () =>
  expect(precoPagamento(10000, "pix", 5)).toEqual({
    valor: 51750,
    moeda: "BRL",
  }));
