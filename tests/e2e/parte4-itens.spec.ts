import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";
test("itens têm quantidades próprias e gorjetas são sugeridas sem entrar no total", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Busan com cápsula" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("4");
  await page.getByLabel("Margem (%)", { exact: true }).fill("0");
  await page
    .getByLabel("Item de referência", { exact: true })
    .selectOption("kit_busan");
  await page
    .getByRole("button", { name: "Adicionar item", exact: true })
    .click();
  await page
    .getByLabel("Item de referência", { exact: true })
    .selectOption("sky_capsule");
  await page
    .getByRole("button", { name: "Adicionar item", exact: true })
    .click();
  await expect(page.getByTestId("preco-calculado")).toContainText("180,00");
  await page.getByLabel("Mostrar gorjeta sugerida").check();
  await expect(page.getByTestId("gorjeta-sugerida")).toContainText("44,00");
  await expect(page.getByTestId("preco-calculado")).toContainText("180,00");
  await escolherOpcao(
    page.getByRole("combobox", { name: "Categoria do orçamento", exact: true }),
    "premium",
  );
  await expect(page.getByTestId("gorjeta-sugerida")).toContainText("80,00");
  await page.getByLabel("Pagantes", { exact: true }).fill("5");
  await expect(
    page
      .getByTestId("item-sky_capsule")
      .getByLabel("Quantidade", { exact: true }),
  ).toHaveValue("2");
});
