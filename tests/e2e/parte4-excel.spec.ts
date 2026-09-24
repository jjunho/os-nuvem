import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";
test("Excel exporta opções e reimporta o modelo sem duplicar viajantes", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Planilha de orçamento" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page
    .getByRole("button", { name: "Adicionar linha", exact: true })
    .click();
  await page
    .getByLabel("Descrição da linha", { exact: true })
    .fill("Serviço Excel");
  await page.getByLabel("Valor unitário USD", { exact: true }).fill("1000");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Exportar Excel", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  const caminho = await download.path();
  await page.getByLabel("Valor unitário USD", { exact: true }).fill("2000");
  await page.getByLabel("Arquivo Excel").setInputFiles(caminho!);
  await page
    .getByRole("button", { name: "Revisar importação", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Aplicar importação", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Aplicar importação", exact: true })
    .click();
  await expect(
    page.getByLabel("Valor unitário USD", { exact: true }),
  ).toHaveValue("1000");
  await page
    .getByLabel("Arquivo Excel")
    .setInputFiles({
      name: "errado.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("Não é o modelo"),
    });
  await page
    .getByRole("button", { name: "Revisar importação", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("modelo CoreaLux");
});
