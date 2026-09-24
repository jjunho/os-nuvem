import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar } from "./apoio";
test("bagagem pertence ao viajante e muda a sugestão; falta de assento pede outro veículo", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Grupo e malas");
  await page.getByLabel("Pagantes", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  const viagem = page.url();
  const viajante = page
    .getByRole("table", { name: "Viajantes", exact: true })
    .getByRole("row")
    .nth(1);
  await expect(viajante.getByLabel("Malas de 23 kg")).toHaveValue("2");
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Orçamento V26-/ }),
  ).toBeVisible();
  const orcamento = page.url();
  await expect(page.getByTestId("sugestao-veiculo")).toContainText(
    "Kia Carnival externa",
  );
  await page.goto(viagem);
  await viajante.getByLabel("Malas de 23 kg").fill("10");
  await viajante.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(viajante.getByTestId("bagagem-salva")).toHaveText("10 · 1");
  await page.goto(orcamento);
  await expect(page.getByTestId("sugestao-veiculo")).toContainText(
    "Hyundai Solati",
  );
  await escolherOpcao(
    page.getByRole("combobox", { name: "Categoria do orçamento", exact: true }),
    "premium",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("14");
  await escolherOpcao(
    page.getByRole("combobox", { name: "Veículo do dia", exact: true }),
    "solati",
  );
  await expect(page.getByTestId("alerta-assentos")).toContainText(
    "Assentos insuficientes",
  );
  await expect(page.getByTestId("alerta-assentos")).not.toContainText(
    "Caminhão",
  );
  await escolherOpcao(
    page.getByRole("combobox", { name: "Categoria do orçamento", exact: true }),
    "vip",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("13");
  await escolherOpcao(
    page.getByRole("combobox", { name: "Veículo do dia", exact: true }),
    "sprinter",
  );
  await expect(page.getByTestId("alerta-assentos")).toContainText(
    "Assentos insuficientes",
  );
});
