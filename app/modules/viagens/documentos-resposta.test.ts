import { expect, test } from "vitest";
import { lerDocumentosResposta } from "./documentos-resposta";

const id = "123e4567-e89b-42d3-a456-426614174000";
test("documentos valida cada identificador e aceita a lista vazia", () => {
  expect(lerDocumentosResposta({ documentos: [] })).toEqual([]);
  expect(
    lerDocumentosResposta({ documentos: [{ id, mime: "application/pdf" }] }),
  ).toEqual([{ id }]);
  for (const entrada of [
    null,
    {},
    { documentos: null },
    { documentos: [null] },
    { documentos: [{}] },
    { documentos: [{ id: 7 }] },
    { documentos: [{ id: "../outro" }] },
    { documentos: [{ id }, { id }] },
  ])
    expect(() => lerDocumentosResposta(entrada)).toThrow(
      "Resposta de documentos inválida",
    );
});

test("a lista validada não compartilha objetos mutáveis com a entrada", () => {
  const entrada = { documentos: [{ id }] };
  const documentos = lerDocumentosResposta(entrada);
  entrada.documentos[0].id = "alterado";
  expect(documentos).toEqual([{ id }]);
});
