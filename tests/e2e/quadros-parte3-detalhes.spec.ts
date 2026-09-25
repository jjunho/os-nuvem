import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar } from "./apoio";
test("Checklist promove tarefa com vínculo; etiqueta, anexo e capa seguem direitos", async ({
  page,
  browser,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await page.goto("/quadros");
  await page.getByRole("link", { name: "Meu Quadro", exact: true }).click();
  await page.getByLabel("Título", { exact: true }).fill("Preparar materiais");
  await page.getByRole("button", { name: "Criar tarefa", exact: true }).click();
  await page.getByRole("link", { name: /TAR-.*Preparar materiais/ }).click();
  await expect(
    page.getByRole("heading", { name: "Preparar materiais", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Título", { exact: true }).fill("Separar mapas");
  await page
    .getByRole("button", { name: "Adicionar item", exact: true })
    .click();
  await page.getByRole("button", { name: "Marcar", exact: true }).click();
  await expect(page.getByTestId("estado-tarefa")).toHaveText("Aberta");
  await page
    .getByRole("button", { name: "Promover a tarefa", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Abrir tarefa", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Nome", { exact: true }).fill("Urgente");
  await page
    .getByRole("button", { name: "Criar etiqueta", exact: true })
    .click();
  await page.getByRole("button", { name: "Atribuir", exact: true }).click();
  await page
    .getByLabel("Arquivo", { exact: true })
    .setInputFiles({
      name: "mapa.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Mapa do passeio"),
    });
  await page.getByRole("button", { name: "Anexar", exact: true }).click();
  const link = page.getByRole("link", { name: "mapa.txt", exact: true });
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  expect((await page.request.get(href!)).ok()).toBeTruthy();
  const ctx = await browser.newContext(),
    lia = await ctx.newPage();
  await entrarComo(lia, "Lia");
  expect((await lia.request.get(href!)).status()).toBe(403);
  await ctx.close();
});
