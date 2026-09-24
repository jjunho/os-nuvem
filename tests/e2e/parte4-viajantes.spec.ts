import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar } from "./apoio";
test("seleção por dia e linha aplica tarifa infantil e nomeia sem copiar viajantes", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Oito pessoas");
  await page.getByLabel("Pagantes", { exact: true }).fill("8");
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  const viagem = page.url();
  const primeiro = page
    .getByRole("table", { name: "Viajantes", exact: true })
    .getByRole("row")
    .nth(1);
  await primeiro.getByLabel("Idade", { exact: true }).fill("8");
  await primeiro
    .getByRole("combobox", { name: "Nome", exact: true })
    .fill("Ana");
  await page.getByRole("option", { name: /Outro/ }).click();
  await primeiro.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(primeiro.getByRole("cell").first()).toHaveText("Ana");
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Orçamento V26-/ }),
  ).toBeVisible();
  const orcamento = page.url();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Margem (%)", { exact: true }).fill("0");
  const dia = page.getByRole("group", {
    name: "Viajantes do dia",
    exact: true,
  });
  await dia.getByRole("checkbox").nth(7).uncheck();
  await dia.getByRole("checkbox").nth(6).uncheck();
  await page
    .getByRole("button", { name: "Adicionar linha", exact: true })
    .click();
  await page
    .getByLabel("Descrição da linha", { exact: true })
    .fill("Ingresso infantil");
  await page.getByLabel("Valor unitário USD", { exact: true }).fill("10");
  await page.getByLabel("Cobrar por viajante", { exact: true }).check();
  await expect(page.getByTestId("preco-calculado")).toContainText("60,00");
  await page.getByLabel("Tarifa infantil USD", { exact: true }).fill("5");
  await expect(page.getByTestId("preco-calculado")).toContainText("55,00");
  const linha = page.getByRole("group", {
    name: "Viajantes desta linha",
    exact: true,
  });
  for (let i = 5; i >= 2; i--)
    await linha.getByRole("checkbox").nth(i).uncheck();
  await expect(page.getByTestId("preco-calculado")).toContainText("15,00");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page.goto(viagem);
  await primeiro.getByRole("button", { name: "Remover", exact: true }).click();
  await expect(page.getByText(/Ingresso infantil.*Dia/)).toBeVisible();
  await page
    .getByRole("button", { name: "Confirmar remoção", exact: true })
    .click();
  await expect(
    page
      .getByRole("table", { name: "Viajantes", exact: true })
      .getByRole("row"),
  ).toHaveCount(8);
  await page.goto(orcamento);
  await expect(
    page
      .getByRole("group", { name: "Viajantes do dia", exact: true })
      .getByLabel("Ana", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByTestId("preco-calculado")).toContainText("10,00");
});
