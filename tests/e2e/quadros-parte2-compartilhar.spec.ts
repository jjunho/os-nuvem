import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar } from "./apoio";
test("Quadro privado, compartilhamento, delegação e revogação", async ({
  page,
  browser,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await page.goto("/quadros");
  await page.getByLabel("Nome", { exact: true }).fill("Equipe");
  await page.getByRole("button", { name: "Criar Quadro", exact: true }).click();
  await expect(page).toHaveURL(/\/quadros\/\d+$/);
  const url = page.url();
  await page.getByLabel("Título", { exact: true }).fill("Conferir reservas");
  await page.getByRole("button", { name: "Criar tarefa", exact: true }).click();
  await expect(
    page.getByRole("link", { name: /TAR-.*Conferir reservas/ }),
  ).toBeVisible();
  const ctx = await browser.newContext(),
    lia = await ctx.newPage();
  await entrarComo(lia, "Lia");
  expect((await lia.request.get(url)).status()).toBe(403);
  await page
    .getByLabel("Pessoa", { exact: true })
    .selectOption({ label: "Lia" });
  await page.getByRole("button", { name: "Compartilhar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remover membro", exact: true }),
  ).toBeVisible();
  await lia.goto(url);
  await expect(
    lia.getByRole("link", { name: /Conferir reservas/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: /TAR-.*Conferir reservas/ }).click();
  await expect(page.getByTestId("codigo-tarefa")).toBeVisible();
  await page
    .getByLabel("Responsável", { exact: true })
    .selectOption({ label: "Lia" });
  await page
    .getByRole("button", { name: "Enviar tarefa", exact: true })
    .click();
  await page.getByRole("link", { name: "Abrir Quadro", exact: true }).click();
  await expect(page).toHaveURL(url);
  const membro = page
    .locator("form")
    .filter({
      has: page.getByRole("button", { name: "Remover membro", exact: true }),
    })
    .filter({ hasText: "Lia" });
  await membro.getByRole("button").click();
  await expect(
    page.getByRole("button", { name: "Remover membro", exact: true }),
  ).toHaveCount(0);
  expect((await lia.request.get(url)).status()).toBe(403);
  await ctx.close();
});
