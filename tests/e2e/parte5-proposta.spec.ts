import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar, relogio, T0 } from "./apoio";
test("proposta espanhola usa versão congelada, omite dados internos e baixa PDF", async ({
  page,
}) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Cliente Español");
  await page
    .getByRole("combobox", { name: "Idioma do cliente", exact: true })
    .fill("Espanhol");
  await page.getByRole("option", { name: "Espanhol", exact: true }).click();
  await page.getByLabel("Pagantes", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Manhã", { exact: true }).fill("Visita al mercado");
  await page.getByLabel("Incluso", { exact: true }).fill("Traslado privado");
  await page
    .getByLabel("Não incluso", { exact: true })
    .fill("Compras personales");
  await page.getByLabel("Sinal (%)", { exact: true }).fill("40");
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
  await page.getByRole("link", { name: "Abrir proposta", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Propuesta", exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("body")).toContainText("Visita al mercado");
  await expect(page.locator("body")).toContainText("Traslado privado");
  await expect(page.locator("body")).toContainText("Compras personales");
  await expect(page.locator("body")).toContainText("40%");
  await expect(page.locator("body")).not.toContainText("Margem");
  await expect(page.locator("body")).not.toContainText("Ajuste manual");
  const antes = await page.locator("main").innerText();
  await page.reload();
  expect(await page.locator("main").innerText()).toBe(antes);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Descargar PDF", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    "Proposta Cliente Español 20260924 v1.pdf",
  );
  expect(await download.failure()).toBeNull();
});
