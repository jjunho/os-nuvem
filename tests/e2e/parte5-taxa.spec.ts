import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";
test("taxa de elaboração começa desligada, pagamento anterior ao aceite vira desconto", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Roteiro personalizado" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await expect(
    page.getByLabel("Cobrar elaboração de roteiro", { exact: true }),
  ).not.toBeChecked();
  await page
    .getByLabel("Cobrar elaboração de roteiro", { exact: true })
    .check();
  await page.getByLabel("Taxa de elaboração USD", { exact: true }).fill("200");
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("1");
  await page.getByLabel("Preço enviado USD", { exact: true }).fill("1000");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page
    .getByRole("button", { name: "Registrar pagamento da taxa", exact: true })
    .click();
  await expect(page.getByText("Taxa paga", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Registrar envio", exact: true })
    .click();
  await expect(
    page.getByText("Versão congelada", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Registrar aceite", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirmar aceite", exact: true })
    .click();
  await expect(page.getByTestId("etapa")).toHaveText("Confirmada");
  await expect(page.getByTestId("desconto-elaboracao")).toContainText("200,00");
  await expect(page.getByTestId("preco-acordado")).toContainText("800,00");
});
