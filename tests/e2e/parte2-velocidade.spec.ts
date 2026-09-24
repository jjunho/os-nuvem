import { expect, test } from "@playwright/test";
import { semearVolume } from "./volume";

test.beforeAll(async ({ request }) => { await semearVolume(request); });
test.afterAll(async ({ request }) => { await request.post("/test/reset"); });

test("leitura de /entrar em até 100 ms", async ({ request }) => {
  await request.get("/entrar");
  const inicio = performance.now();
  const resposta = await request.get("/entrar");
  const ms = performance.now() - inicio;
  expect(resposta.ok()).toBe(true);
  expect(ms, `/entrar: ${ms} ms`).toBeLessThan(100);
});

test("abrir /entrar e entrar no Pipeline em até 300 ms, com feedback em até 100 ms", async ({ page }) => {
  await page.goto("/entrar"); // warm browser assets
  const inicio = performance.now();
  await page.goto("/entrar");
  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeVisible();
  const abrirMs = performance.now() - inicio;
  expect(abrirMs, `abrir /entrar: ${abrirMs} ms`).toBeLessThan(300);
  await page.getByLabel("E-mail").fill("lia@corealux.com");
  await page.getByLabel("Senha", { exact: true }).fill("corealux123");
  const entrada = performance.now();
  const feedbackMs = await page.evaluate(async () => {
    const botao = document.querySelector<HTMLButtonElement>("button")!;
    const inicio = performance.now();
    botao.click();
    await new Promise<void>((resolve) => {
      const verificar = () => botao.disabled ? resolve() : requestAnimationFrame(verificar);
      verificar();
    });
    return performance.now() - inicio;
  });
  await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
  await expect(page.getByRole("row", { name: /V26-/ }).first()).toBeVisible();
  const entrarMs = performance.now() - entrada;
  expect(feedbackMs, `feedback: ${feedbackMs} ms`).toBeLessThan(100);
  expect(entrarMs, `entrada e Pipeline: ${entrarMs} ms`).toBeLessThan(300);
});
