import { expect, test } from "@playwright/test";
import { semearVolume } from "./volume";

test.beforeAll(async ({ request }) => {
  await semearVolume(request);
});
test.afterAll(async ({ request }) => {
  await request.post("/test/reset");
});

test("leitura de /entrar em até 100 ms", async ({ request }) => {
  await request.get("/entrar");
  const inicio = performance.now();
  const resposta = await request.get("/entrar");
  const ms = performance.now() - inicio;
  expect(resposta.ok()).toBe(true);
  expect(ms, `/entrar: ${ms} ms`).toBeLessThan(100);
});

test("abrir /entrar e entrar no Pipeline em até 300 ms, com feedback em até 100 ms", async ({
  page,
}) => {
  await page.goto("/entrar"); // warm browser assets
  const inicio = performance.now();
  await page.goto("/entrar");
  await expect(
    page.getByRole("button", { name: "Entrar", exact: true }),
  ).toBeVisible();
  const abrirMs = performance.now() - inicio;
  expect(abrirMs, `abrir /entrar: ${abrirMs} ms`).toBeLessThan(300);
  await page.getByLabel("E-mail").fill("lia@corealux.com");
  await page.getByLabel("Senha", { exact: true }).fill("corealux123");
  const { feedbackMs, entrarMs } = await page.evaluate(async () => {
    const botao = document.querySelector<HTMLButtonElement>("button")!;
    const inicio = performance.now();
    botao.click();
    let feedbackMs: number | undefined;
    return new Promise<{ feedbackMs: number; entrarMs: number }>((resolve) => {
      const verificar = () => {
        if (feedbackMs === undefined && botao.disabled)
          feedbackMs = performance.now() - inicio;
        const titulo = [...document.querySelectorAll("h1")].find(
          (h) => h.textContent === "Pipeline",
        );
        const linha = document.querySelector("tbody tr");
        const visivel = (e: Element | null | undefined) =>
          !!e &&
          e.getClientRects().length > 0 &&
          getComputedStyle(e).visibility !== "hidden";
        if (
          feedbackMs !== undefined &&
          visivel(titulo) &&
          visivel(linha) &&
          /V26-/.test(linha!.textContent ?? "")
        ) {
          resolve({ feedbackMs, entrarMs: performance.now() - inicio });
        } else requestAnimationFrame(verificar);
      };
      verificar();
    });
  });
  await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
  await expect(page.getByRole("row", { name: /V26-/ }).first()).toBeVisible();
  expect(feedbackMs, `feedback: ${feedbackMs} ms`).toBeLessThan(100);
  expect(entrarMs, `entrada e Pipeline: ${entrarMs} ms`).toBeLessThan(300);
});
