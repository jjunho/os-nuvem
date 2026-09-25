import { describe, expect, it } from "vitest";
import { erroDeFormulario } from "./erro-formulario.server";

describe("erros recuperáveis de formulário", () => {
  it.each([400, 409, 413, 422])(
    "preserva explicação e status %i",
    async (status) => {
      const resposta = await erroDeFormulario(
        new Response("Confira os dados", { status }),
      );
      expect(resposta.data).toEqual({ erro: "Confira os dados" });
      expect(resposta.init?.status).toBe(status);
    },
  );
  it.each([302, 401, 403, 404, 500])(
    "mantém status %i no limite de rota",
    async (status) => {
      const erro = new Response("Restrito", { status });
      await expect(erroDeFormulario(erro)).rejects.toBe(erro);
    },
  );
  it("não transforma falhas inesperadas em erro de validação", async () => {
    const erro = new Error("Banco indisponível");
    await expect(erroDeFormulario(erro)).rejects.toBe(erro);
  });
});
