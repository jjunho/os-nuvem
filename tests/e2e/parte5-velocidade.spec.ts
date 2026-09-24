import { expect, test } from "@playwright/test";
import { semearVolume } from "./volume";
import { entrarComo, escolherOpcao } from "./apoio";
test("proposta congelada abre em 300 ms e lê em 100 ms com volume realista", async ({
  page,
  request,
}) => {
  await semearVolume(request);
  await entrarComo(page, "Carlos");
  await page.goto("/viagens/4000");
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("1");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page
    .getByRole("button", { name: "Registrar envio", exact: true })
    .click();
  await expect(
    page.getByText("Versão congelada", { exact: true }),
  ).toBeVisible();
  const link = page.getByRole("link", { name: "Abrir proposta", exact: true });
  const url = (await link.getAttribute("href"))!;
  await page.request.get(url);
  const inicio = Date.now();
  expect((await page.request.get(url)).ok()).toBe(true);
  expect(Date.now() - inicio).toBeLessThan(100);
  const navegacao = Date.now();
  await link.click();
  await expect(
    page.getByRole("heading", { name: "Proposta", exact: true }),
  ).toBeVisible();
  expect(Date.now() - navegacao).toBeLessThan(300);
});
