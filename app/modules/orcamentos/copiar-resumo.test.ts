import { expect, it, vi } from "vitest";
import { copiarResumo } from "./copiar-resumo";
it("HTTP inválido nunca chega ao clipboard", async () => {
  const escrever = vi.fn();
  await expect(
    copiarResumo("/texto", {
      buscar: async () => new Response("erro", { status: 500 }),
      escrever,
      atual: () => true,
    }),
  ).rejects.toThrow();
  expect(escrever).not.toHaveBeenCalled();
});
it("falha do clipboard é observável e resposta de outra identidade é descartada", async () => {
  const escrever = vi.fn().mockRejectedValue(new Error("permission"));
  await expect(
    copiarResumo("/texto", {
      buscar: async () => new Response("resumo"),
      escrever,
      atual: () => true,
    }),
  ).rejects.toThrow("permission");
  escrever.mockClear();
  await expect(
    copiarResumo("/texto", {
      buscar: async () => new Response("resumo"),
      escrever,
      atual: () => false,
    }),
  ).resolves.toBe(false);
  expect(escrever).not.toHaveBeenCalled();
});
