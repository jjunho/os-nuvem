import { describe, expect, it } from "vitest";
import { confirmarEnvio } from "./contratos";
import { validarSaida } from "./offline.client";

const saida = {
  clientId: "0123456789abcdef",
  usuarioId: 1,
  conversaId: 2,
  texto: "Mensagem",
  falhou: false,
  ordem: 1,
};
describe("fronteira da caixa de saída", () => {
  it.each([
    null,
    {},
    { ...saida, conversaId: 1.5 },
    { ...saida, usuarioId: 0 },
    { ...saida, clientId: {} },
    { ...saida, falhou: "false" },
    { ...saida, citadaId: -1 },
    { ...saida, ordem: Infinity },
    { ...saida, texto: " " },
    { ...saida, arquivo: {} },
  ])("rejeita dados corrompidos sem normalizar intenção: %j", (valor) => {
    expect(() => validarSaida(valor)).toThrow("Dados locais");
  });
  it("aceita os destinos locais de conversas internas e citações válidas", () => {
    expect(() =>
      validarSaida({ ...saida, conversaId: -2, citadaId: 3 }),
    ).not.toThrow();
  });
});
describe("confirmação antes de remover a saída", () => {
  it.each([null, {}, { id: "12" }, { id: -1 }, { id: 1.5 }])(
    "não considera JSON 2xx inválido uma confirmação: %j",
    (valor) => {
      expect(() => confirmarEnvio(valor, 2)).toThrow("Resposta inválida");
    },
  );
  it("exige destino resolvido da conversa interna e id da mídia", () => {
    expect(() => confirmarEnvio({ id: 1 }, -2)).toThrow();
    expect(() => confirmarEnvio({ id: 1 }, 2, true)).toThrow();
    expect(confirmarEnvio({ id: 1, conversaId: 3 }, -2)).toEqual({
      id: 1,
      conversaId: 3,
    });
    expect(confirmarEnvio({ id: 1, midiaId: "arquivo" }, 2, true)).toEqual({
      id: 1,
      conversaId: 2,
    });
  });
});
