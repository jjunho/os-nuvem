import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar } from "./apoio";
test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
});
test("referências editáveis mantêm versões anteriores e histórico de autoria", async ({
  page,
}) => {
  await page.goto("/tabelas/equipe");
  await expect(
    page.getByRole("heading", { name: "Guia e Assistente", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Guia USD — Cliente final", { exact: true }),
  ).toHaveValue("320");
  await page
    .getByLabel("Guia USD — Cliente final", { exact: true })
    .fill("350");
  await page.getByRole("button", { name: "Salvar nova versão" }).click();
  await expect(page.getByTestId("versao-tabela")).toHaveText("Versão 2");
  await expect(
    page.getByLabel("Guia USD — Cliente final", { exact: true }),
  ).toHaveValue("350");
  await expect(
    page.getByRole("region", { name: "Histórico de versões" }),
  ).toContainText("Carlos");
  await page.getByRole("link", { name: "Versão 1", exact: true }).click();
  await expect(
    page.getByLabel("Guia USD — Cliente final", { exact: true }),
  ).toHaveValue("320");
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await entrarComo(page, "Lia");
  await page.goto("/tabelas/equipe");
  await expect(
    page.getByLabel("Guia USD — Cliente final", { exact: true }),
  ).toHaveValue("350");
  await expect(
    page.getByRole("button", { name: "Salvar nova versão" }),
  ).toHaveCount(0);
  expect(
    (
      await page.request.post("/tabelas/equipe", { form: { versao: "2" } })
    ).status(),
  ).toBe(403);
});

test("calendários independentes, feriados por ano e eventos conservam suas versões", async ({
  page,
}) => {
  await page.goto("/tabelas/temporada_corealux");
  await page.getByLabel("Fator — Alta", { exact: true }).first().fill("1.25");
  await page.getByRole("button", { name: "Salvar nova versão" }).click();
  await expect(page.getByTestId("versao-tabela")).toHaveText("Versão 2");
  await page.goto("/tabelas/temporada_onibus");
  await expect(
    page.getByLabel("Fator — Alta", { exact: true }).first(),
  ).toHaveValue("1.2");
  await page.goto("/tabelas/temporada_jeju");
  await expect(
    page.getByLabel("Início (MM-DD) — Alta", { exact: true }).first(),
  ).toHaveValue("07-01");
  await page.goto("/tabelas/feriados");
  await expect(
    page.getByLabel("Início — Chuseok 2026", { exact: true }),
  ).toHaveValue("2026-09-24");
  const adicionar = page.getByRole("group", { name: "Adicionar referência" });
  await adicionar.getByLabel("Nome da nova referência").fill("Ano Novo 2027");
  await adicionar.getByLabel("Início", { exact: true }).fill("2027-01-01");
  await adicionar.getByLabel("Fim", { exact: true }).fill("2027-01-01");
  await page.getByRole("button", { name: "Salvar nova versão" }).click();
  await expect(
    page.getByLabel("Início — Ano Novo 2027", { exact: true }),
  ).toHaveValue("2027-01-01");
  await page.getByRole("link", { name: "Versão 1", exact: true }).click();
  await expect(
    page.getByLabel("Início — Ano Novo 2027", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Início — Chuseok 2026", { exact: true }),
  ).toHaveValue("2026-09-24");
  await page.goto("/tabelas/eventos");
  await page.getByLabel("Nome da nova referência").fill("Congresso");
  await page.getByLabel("Início", { exact: true }).fill("2026-11-10");
  await page.getByLabel("Fim", { exact: true }).fill("2026-11-12");
  await page
    .getByLabel("Adicional sobre guia e carro", { exact: true })
    .fill("0.1");
  await page.getByRole("button", { name: "Salvar nova versão" }).click();
  await expect(
    page.getByLabel("Adicional sobre guia e carro — Congresso", {
      exact: true,
    }),
  ).toHaveValue("0.1");
});

test("demais referências têm tarifas editáveis e padrões provisórios identificados", async ({
  page,
}) => {
  for (const [codigo, campo, valor] of [
    ["frota", "Cliente final USD — Kia Carnival externa", "230"],
    ["transfers", "Funcionário USD — Incheon ↔ hotel Seul", "150"],
    ["tickets", "Valor — Sky Capsule / até 4 pessoas", "60"],
    ["kit", "Cortesia USD — Premium", "7.5"],
    ["gorjetas", "Valor — Guia / cliente / dia", "4"],
    ["fatores", "Valor — Intermediação ônibus", "0.15"],
    ["pagamentos", "Valor — PIX", "1.035"],
    ["porte_onibus", "Valor — 16 lugares", "0.8"],
    ["onibus_distancia", "Um dia USD — Até 200 km", "468.148"],
  ]) {
    await page.goto(`/tabelas/${codigo}`);
    await expect(page.getByLabel(campo, { exact: true })).toHaveValue(valor);
  }
  await page.goto("/tabelas/fatores");
  await expect(
    page
      .getByRole("row")
      .filter({
        has: page.getByLabel("Valor — Mais de 4h até 6h", { exact: true }),
      }),
  ).toContainText("Padrão provisório");
});
