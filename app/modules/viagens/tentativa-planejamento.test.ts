import { expect, test } from "vitest";
import { identificarTentativa } from "./tentativa-planejamento";
import {
  assinaturaEnvio,
  prepararTentativa,
} from "./tentativa-planejamento.client";
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
function armazenamentoInicial(valor: string | null = null) {
  let salvo = valor;
  return {
    armazenamento: {
      getItem: () => salvo,
      setItem: (_chave: string, valorSalvo: string) => {
        salvo = valorSalvo;
      },
    },
    ler: () => salvo,
  };
}

test("reusa a tentativa da mesma assinatura e troca por assinatura diferente", () => {
  const estado = armazenamentoInicial(
    JSON.stringify({ id: "anterior", assinatura: "mesma" }),
  );
  expect(
    prepararTentativa(estado.armazenamento, "chave", "mesma", () => "nao-usado"),
  ).toBe("anterior");
  expect(estado.ler()).toBe(
    JSON.stringify({ id: "anterior", assinatura: "mesma" }),
  );

  expect(
    prepararTentativa(estado.armazenamento, "chave", "diferente", () => "nova"),
  ).toBe("nova");
  expect(estado.ler()).toBe(
    JSON.stringify({ id: "nova", assinatura: "diferente" }),
  );
});

test("JSON inválido falha, mas JSON válido em formato inesperado cria tentativa", () => {
  const malformado = armazenamentoInicial("{");
  expect(() =>
    prepararTentativa(malformado.armazenamento, "chave", "assinatura", () => "id"),
  ).toThrow(SyntaxError);
  expect(malformado.ler()).toBe("{");

  const formatoInesperado = armazenamentoInicial(
    JSON.stringify({ id: 7, assinatura: "anterior" }),
  );
  expect(
    prepararTentativa(
      formatoInesperado.armazenamento,
      "chave",
      "assinatura",
      () => "novo",
    ),
  ).toBe("novo");
  expect(formatoInesperado.ler()).toBe(
    JSON.stringify({ id: "novo", assinatura: "assinatura" }),
  );
});

test("falha no digest propaga e impede a criação de assinatura", async () => {
  const form = new FormData();
  form.set("textoRecebido", " resposta ");
  await expect(
    assinaturaEnvio(form, async () => {
      throw new Error("digest indisponível");
    }),
  ).rejects.toThrow("digest indisponível");
});
