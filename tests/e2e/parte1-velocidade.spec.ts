import { expect, test } from "@playwright/test";
import { semearVolume } from "./volume";
import { T0, entrarComo, relogio } from "./apoio";

// ADR-0003 budgets, measured on the production build with realistic volume.

test.beforeAll(async ({ request }) => {
  await semearVolume(request);
});

test("leitura no servidor em até 100 ms", async ({ page }) => {
  await entrarComo(page, "Carlos");
  await relogio(page, T0);
  for (const url of [
    "/buscar?q=Contato%204999",
    "/buscar?q=V26-4321",
    "/buscar?q=5511000031",
  ]) {
    await page.request.get(url); // warm-up
    const inicio = Date.now();
    const r = await page.request.get(url);
    const ms = Date.now() - inicio;
    expect(r.ok()).toBeTruthy();
    expect(ms, `${url} levou ${ms} ms`).toBeLessThan(100);
  }
});

test("navegação entre telas em até 300 ms", async ({ page }) => {
  await entrarComo(page, "Carlos");
  await relogio(page, T0);
  await page.goto("/viagens/4000");
  await expect(page.getByRole("heading", { name: "V26-4000" })).toBeVisible();

  const inicio = Date.now();
  await page.getByRole("link", { name: "Pipeline" }).click();
  await expect(page.getByRole("row", { name: /V26-/ }).first()).toBeVisible();
  const ms = Date.now() - inicio;
  expect(ms, `pipeline levou ${ms} ms`).toBeLessThan(300);
});

test("resposta visível a um clique em até 100 ms", async ({ page }) => {
  await entrarComo(page, "Carlos");
  await relogio(page, "2026-09-24T09:00:00+09:00");
  await page.goto("/viagens/4995");
  await page
    .getByLabel("O que ocorreu", { exact: true })
    .fill("Respondi via WhatsApp");
  await page
    .getByLabel("Por quê", { exact: true })
    .fill("Solicitação do cliente");
  const botao = page.getByRole("button", { name: "Respondi o contato" });
  await expect(botao).toBeVisible();
  const ms = await page.evaluate(async () => {
    const b = [...document.querySelectorAll("button")].find(
      (x) => x.textContent === "Respondi o contato",
    )!;
    const inicio = performance.now();
    b.click();
    await new Promise<void>((resolve) => {
      const check = () =>
        document.body.textContent?.includes("Respondi o contato")
          ? requestAnimationFrame(check)
          : resolve();
      check();
    });
    return performance.now() - inicio;
  });
  expect(ms, `feedback levou ${ms} ms`).toBeLessThan(100);
});

test("o Pipeline pagina as viagens sem repetir a primeira página", async ({
  page,
}) => {
  await entrarComo(page, "Carlos");
  await expect(page.locator("tbody tr")).toHaveCount(50);
  const primeiro = await page.locator("tbody tr").first().textContent();
  await page.getByRole("link", { name: "Próxima página", exact: true }).click();
  await expect(page).toHaveURL(/pagina=2/);
  await expect(page.locator("tbody tr")).toHaveCount(50);
  await expect(page.locator("tbody tr").first()).not.toHaveText(primeiro!);
});

test.afterAll(async ({ request }) => {
  await request.post("/test/reset");
});
