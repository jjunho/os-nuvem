import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";
test("pedido colado gera prévia e só confirma dias e viajantes após revisão", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Pedido de agência" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await page
    .getByLabel("Pedido do cliente", { exact: true })
    .fill(
      "Viagem de 28/10/2026 a 01/11/2026, 8 pagantes e 2 gratuidades. Seul e Busan. Visitar palácios e mercados.",
    );
  await page
    .getByRole("button", { name: "Preparar rascunho", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Revisão do pedido", exact: true }),
  ).toContainText("5 dias");
  await expect(page.getByLabel("Pagantes", { exact: true })).toHaveValue("0");
  await page
    .getByRole("button", { name: "Confirmar pedido", exact: true })
    .click();
  await expect(page.getByLabel("Pagantes", { exact: true })).toHaveValue("8");
  await expect(page.getByRole("heading", { name: /^Dia \d$/ })).toHaveCount(5);
  await page
    .getByRole("link", { name: "Voltar à viagem", exact: true })
    .click();
  await expect(
    page
      .getByRole("table", { name: "Viajantes", exact: true })
      .getByRole("row"),
  ).toHaveCount(11);
  await page.getByRole("link", { name: /Orçamento · Versão 1/ }).click();
  await page
    .getByLabel("Pedido do cliente", { exact: true })
    .fill("28/10/2026 a 01/11/2026, 8 pagantes e 2 gratuidades. Seul e Busan.");
  await page
    .getByRole("button", { name: "Preparar rascunho", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirmar pedido", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Pedido confirmado");
  await page
    .getByRole("link", { name: "Voltar à viagem", exact: true })
    .click();
  await expect(
    page
      .getByRole("table", { name: "Viajantes", exact: true })
      .getByRole("row"),
  ).toHaveCount(11);
});
