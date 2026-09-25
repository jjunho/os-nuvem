import { expect, test } from "vitest";
import { inteiroEntrada, idOpcional, dataISOValida } from "./entrada";

test("identificadores rejeitam ausentes, frações, coerções e overflow antes do banco", () => {
  for (const valor of [
    null,
    undefined,
    "",
    " ",
    "1.5",
    "1e2",
    "0x10",
    "NaN",
    "Infinity",
    "-1",
    "0",
    "2147483648",
    {},
    1.5,
  ])
    expect(() => inteiroEntrada(valor)).toThrow();
  expect(inteiroEntrada("1")).toBe(1);
  expect(inteiroEntrada("2147483647")).toBe(2147483647);
  expect(inteiroEntrada("0", { min: 0 })).toBe(0);
});

test("filtro ausente difere de filtro inválido", () => {
  expect(idOpcional(null)).toBeUndefined();
  expect(idOpcional("")).toBeUndefined();
  expect(idOpcional("12")).toBe(12);
  expect(() => idOpcional("invalido")).toThrow();
});

test("datas de calendário não normalizam dias inexistentes", () => {
  for (const d of [
    "0000-01-01",
    "2026-02-29",
    "2026-02-30",
    "2024-04-31",
    "2026-13-01",
    "2026-00-10",
    "2026-1-01",
    "",
    "2026-01-01T00:00Z",
  ])
    expect(dataISOValida(d)).toBe(false);
  for (const d of ["2024-02-29", "2026-02-28", "2026-12-31"])
    expect(dataISOValida(d)).toBe(true);
});
