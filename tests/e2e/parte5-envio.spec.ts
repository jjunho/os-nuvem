import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar, relogio, T0 } from "./apoio";
test("envio congela memória e nova versão preserva proposta anterior", async ({
  page,
}) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
  await novaViagem(page, {
    contato: "Cliente da proposta",
    telefone: "551199998888",
  });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("1");
  await page.getByLabel("Margem (%)", { exact: true }).fill("0");
  await page
    .getByRole("button", { name: "Adicionar linha", exact: true })
    .click();
  await page
    .getByLabel("Descrição da linha", { exact: true })
    .fill("Exposição estimada");
  await page.getByLabel("Valor unitário USD", { exact: true }).fill("30");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await expect(
    page.getByLabel("Destinatário do envio", { exact: true }),
  ).toHaveValue("Cliente da proposta");
  await page
    .getByRole("button", { name: "Registrar envio", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("custo real");
  await page.getByLabel("Custo real da linha USD", { exact: true }).fill("28");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page
    .getByRole("button", { name: "Registrar envio", exact: true })
    .click();
  await expect(page.getByTestId("numero-proposta")).toHaveText(/^P26-\d+$/);
  await expect(
    page.getByText("Versão congelada", { exact: true }),
  ).toBeVisible();
  const versao1 = page.url();
  await expect(page.getByTestId("valor-congelado")).toContainText("30,00");
  await page
    .getByRole("button", { name: "Iniciar nova versão", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: /Versão 2/ })).toBeVisible();
  await page.getByLabel("Preço enviado USD", { exact: true }).fill("50");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page.goto(versao1);
  await expect(page.getByTestId("valor-congelado")).toContainText("30,00");
  await page
    .getByRole("link", { name: "Voltar à viagem", exact: true })
    .click();
  await expect(page.getByTestId("etapa")).toHaveText("Em negociação");
});
