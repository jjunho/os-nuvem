import { expect, test } from "vitest";
import { reduzirOperacao, type Operacao } from "./operacao-remota";

test("a conclusão antiga não substitui a tentativa atual, incluindo falhas", () => {
  let estado: Operacao<string[]> = { fase: "inicial" };
  estado = reduzirOperacao(estado, {
    tipo: "iniciou",
    tentativa: 1,
    chave: "viajante:1",
  });
  estado = reduzirOperacao(estado, {
    tipo: "iniciou",
    tentativa: 2,
    chave: "viajante:2",
  });
  estado = reduzirOperacao(estado, {
    tipo: "concluiu",
    tentativa: 1,
    dados: ["antigo"],
  });
  estado = reduzirOperacao(estado, {
    tipo: "falhou",
    tentativa: 1,
    erro: "falha",
  });
  expect(estado).toEqual({
    fase: "carregando",
    tentativa: 2,
    chave: "viajante:2",
  });
  estado = reduzirOperacao(estado, {
    tipo: "concluiu",
    tentativa: 2,
    dados: [],
  });
  expect(estado).toEqual({ fase: "pronto", chave: "viajante:2", dados: [] });
});

test("falha permite retry e sucesso conserva qual texto foi copiado", () => {
  let estado: Operacao<null> = { fase: "inicial" };
  estado = reduzirOperacao(estado, {
    tipo: "iniciou",
    tentativa: 1,
    chave: "Mensagem antiga",
  });
  estado = reduzirOperacao(estado, {
    tipo: "falhou",
    tentativa: 1,
    erro: "falha",
  });
  expect(estado.fase).toBe("erro");
  estado = reduzirOperacao(estado, {
    tipo: "iniciou",
    tentativa: 2,
    chave: "Mensagem atual",
  });
  estado = reduzirOperacao(estado, {
    tipo: "concluiu",
    tentativa: 1,
    dados: null,
  });
  expect(estado.fase).toBe("carregando");
  estado = reduzirOperacao(estado, {
    tipo: "concluiu",
    tentativa: 2,
    dados: null,
  });
  expect(estado).toEqual({
    fase: "pronto",
    chave: "Mensagem atual",
    dados: null,
  });
});

test("conclusões sem tentativa pendente são inválidas e preservam a referência", () => {
  const inicial: Operacao<null> = { fase: "inicial" };
  expect(
    reduzirOperacao(inicial, { tipo: "falhou", tentativa: 1, erro: "falha" }),
  ).toBe(inicial);
  expect(
    reduzirOperacao(inicial, { tipo: "concluiu", tentativa: 1, dados: null }),
  ).toBe(inicial);
  const pronto: Operacao<null> = {
    fase: "pronto",
    chave: "texto",
    dados: null,
  };
  expect(
    reduzirOperacao(pronto, { tipo: "falhou", tentativa: 1, erro: "falha" }),
  ).toBe(pronto);
});

test("cancelar invalida a tentativa antes de reabrir e ignora seu resultado", () => {
  let estado: Operacao<string[]> = { fase: "inicial" };
  estado = reduzirOperacao(estado, {
    tipo: "iniciou",
    tentativa: 1,
    chave: "pessoa:1",
  });
  const cancelada = reduzirOperacao(estado, { tipo: "cancelou", tentativa: 1 });
  expect(cancelada).toEqual({ fase: "inicial" });
  expect(
    reduzirOperacao(cancelada, {
      tipo: "concluiu",
      tentativa: 1,
      dados: ["antigo"],
    }),
  ).toBe(cancelada);
  estado = reduzirOperacao(cancelada, {
    tipo: "iniciou",
    tentativa: 2,
    chave: "pessoa:1",
  });
  expect(reduzirOperacao(estado, { tipo: "cancelou", tentativa: 1 })).toBe(
    estado,
  );
});
