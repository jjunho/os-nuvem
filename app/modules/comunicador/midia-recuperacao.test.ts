import { beforeEach, expect, it, vi } from "vitest";
const dependencias = vi.hoisted(() => ({
  query: vi.fn(),
  enviar: vi.fn(),
  unlink: vi.fn(),
}));
vi.mock("~/db/client.server", () => ({ pool: { query: dependencias.query } }));
vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn(),
  unlink: dependencias.unlink,
}));
vi.mock("./comunicador.server", () => ({
  enviar: dependencias.enviar,
  exigirConversa: vi.fn(),
  invalido: () => {
    throw Error("Inválido");
  },
  restrito: vi.fn(),
  publicar: vi.fn(),
}));
import { receberMidia } from "./midia.server";
import type { Usuario } from "./comunicador.server";
// Only the authenticated identity is consumed by this upload path.
const usuario = { id: 1 } as Usuario;
function formulario() {
  const f = new FormData();
  f.set("conversaId", "2");
  f.set("clientId", "0123456789abcdef");
  f.set("arquivo", new File(["audio"], "voz.webm", { type: "audio/webm" }));
  return f;
}
beforeEach(() => {
  vi.resetAllMocks();
  dependencias.query.mockResolvedValueOnce({ rows: [] });
});
it("preserva bytes após commit quando falha a consulta da confirmação", async () => {
  dependencias.enviar.mockResolvedValue({ id: 3 });
  dependencias.query.mockRejectedValueOnce(Error("Conexão perdida"));
  dependencias.query.mockResolvedValueOnce({
    rows: [{ id: "persistido" }],
    rowCount: 1,
  });
  await expect(
    receberMidia(usuario, formulario(), new Date(0), "http://localhost"),
  ).rejects.toThrow("Conexão perdida");
  expect(dependencias.unlink).not.toHaveBeenCalled();
});
it("preserva bytes quando não é possível esclarecer o resultado do commit", async () => {
  dependencias.enviar.mockRejectedValue(Error("Resultado desconhecido"));
  dependencias.query.mockRejectedValueOnce(Error("Banco indisponível"));
  await expect(
    receberMidia(usuario, formulario(), new Date(0), "http://localhost"),
  ).rejects.toThrow("Resultado desconhecido");
  expect(dependencias.unlink).not.toHaveBeenCalled();
});
it("limpa bytes quando o banco confirma que o envio não foi persistido", async () => {
  dependencias.enviar.mockRejectedValue(Error("Rejeitado"));
  dependencias.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
  dependencias.unlink.mockResolvedValue(undefined);
  await expect(
    receberMidia(usuario, formulario(), new Date(0), "http://localhost"),
  ).rejects.toThrow("Rejeitado");
  expect(dependencias.unlink).toHaveBeenCalledOnce();
});
