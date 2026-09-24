import { expect, test } from "@playwright/test";
import { semearVolume } from "./volume";
import { entrarComo, relogio, T0 } from "./apoio";
test.beforeAll(async ({ request }) => {
  await semearVolume(request);
});
test("orçamento abre em 300 ms, lê em 100 ms e recalcula em 100 ms com volume realista", async ({
  page,
}) => {
  await entrarComo(page, "Carlos");
  await relogio(page, T0);
  await page.goto("/viagens/4000");
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Orçamento V26-4000/ }),
  ).toBeVisible();
  const url = page.url();
  await page.request.get(url);
  const leitura = Date.now();
  expect((await page.request.get(url)).ok()).toBeTruthy();
  expect(Date.now() - leitura).toBeLessThan(100);
  await page.getByRole("link", { name: "Voltar à viagem" }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  const navegar = Date.now();
  await page.getByRole("link", { name: /Orçamento · Versão 1/ }).click();
  await expect(
    page.getByRole("heading", { name: /Orçamento V26-4000/ }),
  ).toBeVisible();
  expect(Date.now() - navegar).toBeLessThan(300);
  await page.getByLabel("Preço enviado USD", { exact: true }).fill("1000");
  await expect(page.getByTestId("preco-enviado")).toContainText("1.000,00");
  const calcular = Date.now();
  await page.getByLabel("Preço enviado USD", { exact: true }).fill("2000");
  await expect(page.getByTestId("preco-enviado")).toContainText("2.000,00");
  expect(Date.now() - calcular).toBeLessThan(100);
});
