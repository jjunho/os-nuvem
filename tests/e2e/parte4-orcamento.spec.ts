import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar, relogio, T0 } from "./apoio";
test("orçamento rápido calcula, negocia e conserva os dias ao inserir e reordenar", async ({
  page,
}) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Cotação rápida" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Orçamento V26-/ }),
  ).toBeVisible();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("10");
  await page.getByLabel("Gratuidades", { exact: true }).fill("2");
  await page.getByLabel("Margem (%)", { exact: true }).fill("0");
  await page
    .getByRole("button", { name: "Adicionar linha", exact: true })
    .click();
  await page
    .getByLabel("Descrição da linha", { exact: true })
    .fill("Pacote de serviços");
  await page.getByLabel("Valor unitário USD", { exact: true }).fill("1233");
  await expect(page.getByTestId("preco-calculado")).toContainText("1.233,00");
  await expect(page.getByTestId("preco-enviado")).toContainText("1.240,00");
  await page.getByLabel("Preço enviado USD", { exact: true }).fill("1200");
  await expect(page.getByTestId("por-pessoa")).toContainText("120,00");
  await expect(page.getByTestId("diferenca-preco")).toHaveText(/-.*33,00/);
  await page
    .getByRole("button", { name: "Inserir dia após este", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Dia 2", exact: true }),
  ).toBeVisible();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }).last(),
    "livre",
  );
  await page
    .getByRole("button", { name: "Mover dia para cima", exact: true })
    .click();
  await expect(page.getByTestId("preco-calculado")).toContainText("1.233,00");
  await page.getByLabel("Contagem dos dias").selectOption("0");
  await expect(
    page.getByRole("heading", { name: "Dia 0", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page.reload();
  await expect(page.getByTestId("preco-enviado")).toContainText("1.200,00");
  await page.getByRole("link", { name: "Voltar à viagem" }).click();
  await expect(page.getByTestId("etapa")).toHaveText("Em orçamento");
});

test("datas, cidades e viajantes conhecidos abrem preenchidos no orçamento", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Grupo de outubro");
  await page.getByLabel("Chegada", { exact: true }).fill("2026-10-28");
  await page.getByLabel("Partida", { exact: true }).fill("2026-11-01");
  for (const cidade of ["Seul", "Busan"]) {
    await page
      .getByRole("combobox", { name: "Cidades", exact: true })
      .fill(cidade);
    await page.getByRole("option", { name: cidade, exact: true }).click();
  }
  await page.getByLabel("Pagantes", { exact: true }).fill("10");
  await page.getByLabel("Gratuidades", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: /^Dia \d$/ })).toHaveCount(5);
  await expect(page.getByLabel("Data", { exact: true }).first()).toHaveValue(
    "2026-10-28",
  );
  await expect(page.getByLabel("Data", { exact: true }).last()).toHaveValue(
    "2026-11-01",
  );
  await expect(
    page
      .getByRole("combobox", { name: "Cidade ou trecho", exact: true })
      .first(),
  ).toHaveValue("Seul / Busan");
  await expect(page.getByLabel("Pagantes", { exact: true })).toHaveValue("10");
  await expect(page.getByLabel("Gratuidades", { exact: true })).toHaveValue(
    "2",
  );
});
