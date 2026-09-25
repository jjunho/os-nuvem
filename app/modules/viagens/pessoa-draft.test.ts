import { expect, test } from "vitest";
import { iniciarPessoa, reduzirPessoa } from "./pessoa-draft";

test("abandonar contato limpa dados herdados mas preserva edições intencionais", () => {
  let draft = iniciarPessoa({ email: "", telefone: "" });
  draft = reduzirPessoa(draft, {
    tipo: "selecionou",
    id: 7,
    campos: { email: "maria@test.dev", telefone: "111" },
  });
  draft = reduzirPessoa(draft, {
    tipo: "editouCampo",
    campo: "telefone",
    valor: "222",
  });
  draft = reduzirPessoa(draft, { tipo: "editouNome" });
  expect(draft.identidade).toEqual({ tipo: "novo" });
  expect(draft.campos.email.valor).toBe("");
  expect(draft.campos.telefone.valor).toBe("222");
});

test("nome livre não recebe restrições da pessoa abandonada", () => {
  let draft = iniciarPessoa({ mobilidade: "", alimentacao: "" });
  draft = reduzirPessoa(draft, {
    tipo: "selecionou",
    id: 8,
    campos: { mobilidade: "Cadeira de rodas", alimentacao: "Amendoim" },
  });
  draft = reduzirPessoa(draft, { tipo: "editouNome" });
  draft = reduzirPessoa(draft, { tipo: "editouNome" });
  expect(draft.campos.mobilidade.valor).toBe("");
  expect(draft.campos.alimentacao.valor).toBe("");
});

test("editar nome de uma pessoa já nova não produz outra transição", () => {
  const draft = iniciarPessoa({ email: "", telefone: "" });
  expect(reduzirPessoa(draft, { tipo: "editouNome" })).toBe(draft);
});

test("evento para campo que não pertence ao formulário é ignorado", () => {
  const draft = iniciarPessoa({ email: "" });
  expect(
    reduzirPessoa(draft, {
      tipo: "editouCampo",
      campo: "mobilidade",
      valor: "x",
    }),
  ).toBe(draft);
});
