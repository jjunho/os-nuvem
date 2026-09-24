import { describe, expect, it } from "vitest";
import { conferirSenha, gerarHash } from "./senha.server";

describe("senha", () => {
  it("confere a senha certa e recusa a errada", async () => {
    const h = await gerarHash("segredo 123");
    expect(await conferirSenha("segredo 123", h)).toBe(true);
    expect(await conferirSenha("segredo 124", h)).toBe(false);
  });
  it("gera hashes diferentes para a mesma senha", async () => {
    expect(await gerarHash("x")).not.toBe(await gerarHash("x"));
  });
});
