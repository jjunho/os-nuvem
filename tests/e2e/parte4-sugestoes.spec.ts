import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";
test("diárias sugeridas acompanham horas, temporada e equipe Premium", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Sugestão de equipe" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await page.getByLabel("Data", { exact: true }).fill("2026-10-28");
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "meio",
  );
  await expect(
    page.getByText("Informe os horários do período", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Início do serviço", { exact: true }).fill("09:00");
  await page.getByLabel("Fim do serviço", { exact: true }).fill("13:00");
  await expect(page.getByTestId("linha-guia")).toContainText("230,40");
  await escolherOpcao(
    page.getByRole("combobox", { name: "Categoria do orçamento", exact: true }),
    "premium",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("14");
  await expect(
    page.getByTestId("linha-guia").getByLabel("Quantidade", { exact: true }),
  ).toHaveValue("1");
  await expect(
    page
      .getByTestId("linha-assistente")
      .getByLabel("Quantidade", { exact: true }),
  ).toHaveValue("1");
  await page.getByLabel("Pagantes", { exact: true }).fill("21");
  await expect(
    page.getByTestId("linha-guia").getByLabel("Quantidade", { exact: true }),
  ).toHaveValue("2");
});
