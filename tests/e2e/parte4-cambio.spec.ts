import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";
test("custo em KRW mantém moeda, taxa, data e origem e recalcula em USD", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Fornecedor coreano" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Margem (%)", { exact: true }).fill("0");
  await page
    .getByRole("button", { name: "Adicionar linha", exact: true })
    .click();
  await page
    .getByLabel("Descrição da linha", { exact: true })
    .fill("Fornecedor em Won");
  await escolherOpcao(
    page.getByRole("combobox", { name: "Moeda da linha", exact: true }),
    "KRW",
  );
  await page.getByLabel("Valor unitário KRW", { exact: true }).fill("632000");
  await page
    .getByLabel("Unidades da moeda por USD", { exact: true })
    .fill("1350");
  await page.getByLabel("Data do câmbio", { exact: true }).fill("2026-09-24");
  await expect(page.getByLabel("Fonte do câmbio", { exact: true })).toHaveValue(
    "Naver",
  );
  await expect(page.getByTestId("preco-calculado")).toContainText("514,96");
  await page
    .getByLabel("Unidades da moeda por USD", { exact: true })
    .fill("1400");
  await expect(page.getByTestId("preco-calculado")).toContainText("496,57");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page.reload();
  await expect(
    page.getByLabel("Valor unitário KRW", { exact: true }),
  ).toHaveValue("632000");
  await expect(page.getByLabel("Data do câmbio", { exact: true })).toHaveValue(
    "2026-09-24",
  );
});
