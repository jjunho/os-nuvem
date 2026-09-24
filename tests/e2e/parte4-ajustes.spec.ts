import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";
test("ajuste exige motivo e preserva o valor aplicado ao atualizar referências", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Preço ajustado" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Orçamento V26-/ }),
  ).toBeVisible();
  const orcamento = page.url();
  const guia = page.getByTestId("linha-guia");
  await page.getByLabel("Data", { exact: true }).fill("2026-11-10");
  await guia.getByLabel("Valor unitário USD").fill("300");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Informe o motivo do ajuste",
  );
  await guia
    .getByLabel("Motivo do ajuste")
    .fill("Tarifa negociada com fornecedor");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page.goto("/tabelas/equipe");
  await page
    .getByLabel("Guia USD — Cliente final", { exact: true })
    .fill("400");
  await page.getByRole("button", { name: "Salvar nova versão" }).click();
  await expect(page.getByTestId("versao-tabela")).toHaveText("Versão 2");
  await page.goto(orcamento);
  await page
    .getByRole("button", { name: "Atualizar referências", exact: true })
    .click();
  await expect(guia).toContainText("400,00");
  await expect(guia.getByLabel("Valor unitário USD")).toHaveValue("300");
  await expect(guia).toContainText("Carlos");
  await expect(guia.getByLabel("Motivo do ajuste")).toHaveValue(
    "Tarifa negociada com fornecedor",
  );
});
