import { expect, it } from "vitest";
import { precoItem, gorjetaSugerida } from "./itens";
import { tabelasIniciais } from "~/modules/tabelas/referencias";
const refs = Object.fromEntries(tabelasIniciais.map((t) => [t.codigo, t]));
it("Busan: kit diário e cápsulas por grupo de até quatro", () => {
  expect(precoItem("kit_busan", 4, "2026-11-10", refs)).toEqual({
    unitario: 3000,
    quantidade: 4,
    grupo: "servicos",
  });
  expect(precoItem("sky_capsule", 4, "2026-11-10", refs)).toMatchObject({
    unitario: 6000,
    quantidade: 1,
  });
  expect(precoItem("sky_capsule", 5, "2026-11-10", refs).quantidade).toBe(2);
});
it("Jeju sábado já inclui alta e não aplica novo adicional", () =>
  expect(precoItem("voo_jeju", 1, "2026-11-14", refs)).toMatchObject({
    unitario: 10000,
    grupo: "terceiros",
  }));
it.each([
  ["padrao", 4400],
  ["premium", 8000],
  ["vip", 8000],
])("gorjeta %s para quatro clientes", (categoria, valor) =>
  expect(gorjetaSugerida(4, categoria, 1, 0, 1, refs)).toBe(valor),
);
it("voo da equipe recebe segurança fora da margem", () =>
  expect(precoItem("voo_equipe", 1, "2026-11-14", refs, 20000)).toMatchObject({
    unitario: 23000,
    grupo: "terceiros",
  }));
