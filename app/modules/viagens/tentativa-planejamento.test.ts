import { expect, test } from "vitest";
import { identificarTentativa } from "./tentativa-planejamento";
test("repetir conteúdo sem confirmação conserva identidade; mudar conteúdo cria nova ação", () => {
  const anterior = { id: "primeira", assinatura: "conteudo" };
  expect(identificarTentativa(anterior, "conteudo", () => "segunda")).toBe(
    anterior,
  );
  expect(identificarTentativa(anterior, "outro", () => "segunda")).toEqual({
    id: "segunda",
    assinatura: "outro",
  });
  expect(identificarTentativa(null, "conteudo", () => "nova")).toEqual({
    id: "nova",
    assinatura: "conteudo",
  });
});
