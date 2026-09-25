import { expect, test } from "vitest";
import {
  assinaturaRespostas,
  validarTentativa,
  conferirRecibo,
} from "./recibo-planejamento";

test("replay aceita somente o conteúdo da tentativa original", () => {
  const arquivos = [
    {
      nome: "briefing.txt",
      tipo: "text/plain",
      conteudo: Buffer.from("primeiro"),
    },
  ];
  const original = assinaturaRespostas("Hotel: A", arquivos);
  expect(
    conferirRecibo(original, assinaturaRespostas("Hotel: A", arquivos)),
  ).toBe(true);
  expect(
    conferirRecibo(original, assinaturaRespostas("Hotel: B", arquivos)),
  ).toBe(false);
  expect(
    conferirRecibo(
      original,
      assinaturaRespostas("Hotel: A", [
        { ...arquivos[0], conteudo: Buffer.from("segundo") },
      ]),
    ),
  ).toBe(false);
  expect(
    conferirRecibo(
      original,
      assinaturaRespostas("Hotel: A", [{ ...arquivos[0], nome: "outro.txt" }]),
    ),
  ).toBe(false);
});

test("chave ausente conserva compatibilidade; chave inválida é recusada", () => {
  expect(validarTentativa(null)).toBe(null);
  expect(validarTentativa("123e4567-e89b-42d3-a456-426614174000")).toBe(
    "123e4567-e89b-42d3-a456-426614174000",
  );
  expect(() => validarTentativa("invalida")).toThrow();
});
