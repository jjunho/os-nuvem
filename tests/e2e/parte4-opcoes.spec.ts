import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";
test("opções copiadas conservam preços independentes e margem insuficiente pede motivo sem bloquear", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Duas alternativas" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
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
    .fill("Serviço negociado");
  await page.getByLabel("Valor unitário USD", { exact: true }).fill("1000");
  await expect(page.getByTestId("margem-real")).toContainText(
    "não verificável",
  );
  await page.getByLabel("Custo real da linha USD", { exact: true }).fill("910");
  await expect(page.getByTestId("margem-real")).toContainText("9%");
  await page
    .getByLabel("Motivo da margem", { exact: true })
    .fill("Cliente recorrente");
  await page.getByRole("button", { name: "Copiar opção", exact: true }).click();
  const a = page.getByRole("region", { name: "Opção A", exact: true });
  const b = page.getByRole("region", { name: "Opção B", exact: true });
  await expect(a).toBeVisible();
  await expect(b).toBeVisible();
  await b.getByLabel("Pagantes", { exact: true }).fill("12");
  await b.getByLabel("Valor unitário USD", { exact: true }).fill("1200");
  await expect(a.getByTestId("preco-calculado")).toContainText("1.000,00");
  await expect(b.getByTestId("preco-calculado")).toContainText("1.200,00");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page.reload();
  await expect(b.getByLabel("Pagantes", { exact: true })).toHaveValue("12");
  await expect(a.getByLabel("Motivo da margem", { exact: true })).toHaveValue(
    "Cliente recorrente",
  );
});
