import { expect, it } from "vitest";
import { sugerirEquipe, calcularDiaria, temporada } from "./sugestoes";
import { tabelasIniciais } from "~/modules/tabelas/referencias";
const refs = Object.fromEntries(tabelasIniciais.map((t) => [t.codigo, t]));
it.each([
  [7, 1, 0],
  [14, 1, 1],
  [21, 2, 1],
])("Premium %i → %i guias e %i assistentes", (pax, guias, assistentes) =>
  expect(sugerirEquipe("premium", pax)).toEqual({ guias, assistentes }),
);
it("meia diária aplica fator após adicionais sem cascata", () =>
  expect(
    calcularDiaria(
      { base: 32000, tipo: "guia", minutos: 240, adicionais: [0.2] },
      refs,
    ),
  ).toMatchObject({ valor: 23040, extras: 0 }));
it.each([
  [540, 0],
  [570, 0],
  [600, 1600],
])("carro %i minutos → hora extra %i", (minutos, extras) =>
  expect(
    calcularDiaria(
      { base: 20000, tipo: "carro", minutos, adicionais: [] },
      refs,
    ).extras,
  ).toBe(extras),
);
it("evento e temporada somam sobre a base; noturno não incide no carro", () => {
  expect(
    calcularDiaria(
      {
        base: 32000,
        tipo: "guia",
        minutos: 540,
        adicionais: [0.2, 0.1],
        noturno: true,
      },
      refs,
    ).valor,
  ).toBe(46400);
  expect(
    calcularDiaria(
      {
        base: 20000,
        tipo: "carro",
        minutos: 540,
        adicionais: [0.2, 0.1],
        noturno: true,
      },
      refs,
    ).valor,
  ).toBe(26000);
});
it("período sem horas requer informação", () =>
  expect(
    calcularDiaria(
      { base: 32000, tipo: "guia", minutos: null, adicionais: [] },
      refs,
    ).valor,
  ).toBeNull());
it.each(["2026-08-14", "2026-08-15", "2026-08-16"])(
  "feriado ±2 tem precedência em %s",
  (data) =>
    expect(temporada(data, refs)).toMatchObject({
      adicional: 0.2,
      feriado: true,
    }),
);
it("calendário do ônibus inclui 29/02 sem contaminar outras temporadas", () =>
  expect(
    temporada("2028-02-29", refs, "temporada_onibus").adicional,
  ).toBeCloseTo(-0.1));
