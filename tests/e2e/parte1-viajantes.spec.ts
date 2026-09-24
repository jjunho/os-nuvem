import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar } from "./apoio";

test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
});

test("o quadro rápido vira viajantes únicos e editar, adicionar ou remover recalcula os totais", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Agente do grupo");
  await page.getByLabel("Pagantes", { exact: true }).fill("10");
  await page.getByLabel("Gratuidades", { exact: true }).fill("2");
  await page.getByLabel("Idades das crianças").fill("8");
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  const tabela = page.getByRole("table", { name: "Viajantes", exact: true });
  await expect(tabela).toBeVisible();
  await expect(tabela.locator("tbody tr")).toHaveCount(12);
  await expect(page.getByTestId("total-viajantes")).toContainText(
    "10 pagantes, 2 gratuidades",
  );
  const primeira = tabela.locator("tbody tr").first();
  await primeira
    .getByRole("combobox", { name: "Nome", exact: true })
    .fill("Ana Viajante");
  await primeira.getByRole("option", { name: /Outro/ }).click();
  await primeira.getByLabel("Pagamento").selectOption("gratuidade");
  await primeira.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByTestId("total-viajantes")).toContainText(
    "9 pagantes, 3 gratuidades",
  );
  await page.reload();
  await expect(
    primeira.getByRole("combobox", { name: "Nome", exact: true }),
  ).toHaveValue("Ana Viajante");
  await primeira.getByRole("button", { name: "Remover", exact: true }).click();
  await expect(tabela.locator("tbody tr")).toHaveCount(11);
  await expect(page.getByTestId("total-viajantes")).toContainText(
    "9 pagantes, 2 gratuidades",
  );
  await page
    .getByRole("button", { name: "Adicionar viajante", exact: true })
    .click();
  await expect(tabela.locator("tbody tr")).toHaveCount(12);
  await expect(page.getByTestId("total-viajantes")).toContainText(
    "10 pagantes, 2 gratuidades",
  );
});

test("um contato viajante é reutilizado em outra viagem e nunca soma duas vezes ao quadro rápido", async ({
  page,
}) => {
  for (let i = 0; i < 2; i++) {
    await page.goto("/viagens/nova");
    await page.getByLabel("Nome do contato").fill("Ana recorrente");
    if (i) await page.getByRole("option", { name: /Ana recorrente/ }).click();
    await page.getByLabel("Viajante", { exact: true }).check();
    await page.getByLabel("Pagantes", { exact: true }).fill("2");
    await page
      .getByRole("button", { name: "Criar viagem", exact: true })
      .click();
    const tabela = page.getByRole("table", { name: "Viajantes", exact: true });
    await expect(tabela.locator("tbody tr")).toHaveCount(2);
    await expect(
      tabela.getByRole("cell", { name: "Ana recorrente", exact: true }),
    ).toHaveCount(1);
  }
  const linha = page
    .getByRole("table", { name: "Viajantes", exact: true })
    .locator("tbody tr")
    .first();
  await linha.getByLabel("Faixa etária").selectOption("crianca");
  await linha.getByLabel("Idade", { exact: true }).fill("8");
  await linha.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByTestId("total-viajantes")).toContainText(
    "crianças de 8 anos",
  );
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Ana");
  await expect(
    page.getByRole("option", { name: /Ana recorrente/ }),
  ).toHaveCount(1);
});
