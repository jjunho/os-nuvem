import { afterEach, expect, it, vi } from "vitest";
import { leituraOffline } from "./offline.client";
afterEach(() => vi.unstubAllGlobals());
it("cancelamento de leitura não recupera cache nem tenta IndexedDB", async () => {
  const controle = new AbortController();
  const abrir = vi.fn();
  vi.stubGlobal("indexedDB", { open: abrir });
  vi.stubGlobal(
    "fetch",
    vi.fn(
      (_url, opcoes: RequestInit) =>
        new Promise((_resolve, reject) => {
          opcoes.signal?.addEventListener("abort", () =>
            reject(opcoes.signal?.reason),
          );
        }),
    ),
  );
  const leitura = leituraOffline(1, "/comunicador/api", controle.signal);
  controle.abort();
  await expect(leitura).rejects.toMatchObject({ name: "AbortError" });
  expect(abrir).not.toHaveBeenCalled();
});
