import { describe, expect, it } from "vitest";
import { analisarInscricao } from "./inscricao";

describe("analisarInscricao", () => {
  it("distingue um endpoint que não pode ser interpretado", () => {
    expect(
      analisarInscricao({
        endpoint: "não é uma URL",
        keys: { p256dh: "public", auth: "secret" },
      }),
    ).toEqual({ ok: false, motivo: "endpoint" });
  });
  it("rejeita endpoints HTTP mesmo para um serviço reconhecido", () => {
    expect(
      analisarInscricao({
        endpoint: "http://fcm.googleapis.com/send/token",
        keys: { p256dh: "public", auth: "secret" },
      }),
    ).toEqual({ ok: false, motivo: "servico" });
  });

  it("rejeita um host semelhante ao allowlist", () => {
    expect(
      analisarInscricao({
        endpoint: "https://fcm.googleapis.com.exemplo.invalid/send/token",
        keys: { p256dh: "public", auth: "secret" },
      }),
    ).toEqual({ ok: false, motivo: "servico" });
  });

  it("rejeita chaves que não são strings", () => {
    expect(
      analisarInscricao({
        endpoint: "https://fcm.googleapis.com/send/token",
        keys: { p256dh: "public", auth: null },
      }),
    ).toEqual({ ok: false, motivo: "chaves" });
  });

  it("preserva endpoint e chaves de uma inscrição válida", () => {
    const endpoint = "https://fcm.googleapis.com/send/token";
    expect(
      analisarInscricao({
        endpoint,
        keys: { p256dh: "public-key", auth: "auth-key", ignored: true },
      }),
    ).toEqual({
      ok: true,
      inscricao: {
        endpoint,
        chaves: { p256dh: "public-key", auth: "auth-key" },
      },
    });
  });
});
