import { expect, test } from "vitest";
import { novosContextos, opcaoExistente, planoDeMesclagem } from "./normalizacao";

test("opções existentes são reconhecidas por valor ou nome normalizado", () => {
  const opcoes = [{ valor: "Seoul", nomePt: "Seul", nomeKo: "서울", id: 3 }];
  expect(opcaoExistente(opcoes, "Seoul")?.id).toBe(3);
  expect(opcaoExistente(opcoes, " SEÚL ")?.id).toBe(3);
  expect(opcaoExistente(opcoes, "서울")?.id).toBe(3);
  expect(opcaoExistente(opcoes, "Busan")).toBeUndefined();
});

test("novos contextos só preenchem chaves ausentes com valor", () => {
  expect(
    novosContextos(
      { canal: "Agência", existenteVazio: "" },
      { canal: "Cliente final", novo: "valor", vazio: "", existenteVazio: "agora" },
    ),
  ).toEqual({ novo: "valor", existenteVazio: "agora" });
});

test("planos de mesclagem mantêm colunas de arrays, campos apagados e rejeitam nomes desconhecidos", () => {
  expect(planoDeMesclagem("cidades")).toEqual({
    chaveJson: "cidade",
    modo: "array",
    coluna: "cidades",
  });
  expect(planoDeMesclagem("meiosContato")).toEqual({
    chaveJson: null,
    modo: "array",
    coluna: "meiosContato",
  });
  expect(planoDeMesclagem("periodo")).toEqual({
    chaveJson: "periodo",
    modo: "apagar",
    coluna: null,
  });
  expect(planoDeMesclagem("campo-inexistente")).toBeNull();
  expect(planoDeMesclagem("__proto__")).toBeNull();
});
