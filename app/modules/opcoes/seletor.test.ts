import { expect, test } from "vitest";
import {
  iniciarSeletor,
  reduzirSeletor,
  escolhaAoConfirmar,
} from "./seletor-modelo";

const opcoes = [
  { valor: "a", nome: "Alpha" },
  { valor: "b", nome: "Beta" },
];
test("refocar e confirmar uma opção preserva seu código", () => {
  let estado = iniciarSeletor("", "", false);
  estado = reduzirSeletor(estado, { tipo: "escolheu", opcao: opcoes[1] });
  estado = reduzirSeletor(estado, { tipo: "abriu" });
  expect(escolhaAoConfirmar(estado, [opcoes[1]])).toEqual(opcoes[1]);
  expect(estado.menu).toEqual({ fase: "aberto", indice: -1 });
});

test("editar invalida o código; seleção múltipla sobrevive a atualização de rótulos", () => {
  let estado = iniciarSeletor("a", "Alpha", true);
  estado = reduzirSeletor(estado, { tipo: "escolheu", opcao: opcoes[1] });
  estado = reduzirSeletor(estado, { tipo: "editou", texto: "Novo" });
  estado = reduzirSeletor(estado, {
    tipo: "sincronizou",
    valor: "a",
    nome: "Alfa",
  });
  expect(escolhaAoConfirmar(estado, [])).toEqual({
    valor: "Novo",
    nome: "Novo",
  });
  expect(estado.selecionadas).toEqual(["b"]);
});

test("novo valor externo reinicia a seleção, mantendo escolhas múltiplas independentes", () => {
  let estado = iniciarSeletor("a", "Alpha", false);
  estado = reduzirSeletor(estado, { tipo: "editou", texto: "Rascunho" });
  estado = reduzirSeletor(estado, {
    tipo: "sincronizou",
    valor: "b",
    nome: "Beta",
  });
  expect(escolhaAoConfirmar(estado, [])).toEqual(opcoes[1]);
});

test("sincronização sem mudança mantém a mesma referência", () => {
  const estado = iniciarSeletor("a", "Alpha", false);
  expect(
    reduzirSeletor(estado, { tipo: "sincronizou", valor: "a", nome: "Alpha" }),
  ).toBe(estado);
});

test("remover opção ausente não muda o estado", () => {
  const estado = iniciarSeletor("", "", true);
  expect(reduzirSeletor(estado, { tipo: "removeu", valor: "ausente" })).toBe(
    estado,
  );
});
