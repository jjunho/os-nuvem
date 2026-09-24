import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar } from "./apoio";

test("perfil reconhece a pessoa, reutiliza preferências e destaca aniversário durante a viagem", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Ana recorrente");
  await page.getByLabel("Viajante", { exact: true }).check();
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  const perfil = page.getByRole("region", {
    name: "Perfil do cliente: Ana recorrente",
    exact: true,
  });
  await expect(perfil).toBeVisible();
  const anterior = page.url();
  await perfil.getByLabel("Nascimento", { exact: true }).fill("1990-10-30");
  await perfil
    .getByLabel("Preferências", { exact: true })
    .fill("Museus e arte");
  await perfil
    .getByLabel("Como o roteiro foi recebido")
    .fill("Gostou dos museus; reduzir caminhadas");
  await perfil
    .getByRole("button", { name: "Salvar perfil", exact: true })
    .click();
  const tabela = page.getByRole("table", { name: "Viajantes", exact: true });
  await tabela.getByLabel("O que você não come", { exact: true }).fill("Carne");
  await tabela.getByLabel("Mobilidade", { exact: true }).fill("Evitar escadas");
  await tabela.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(perfil).toContainText("Evitar escadas");
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Ana");
  await page.getByRole("option", { name: /Ana recorrente/ }).click();
  await page.getByLabel("Viajante", { exact: true }).check();
  await page.getByLabel("Chegada", { exact: true }).fill("2026-10-28");
  await page.getByLabel("Partida", { exact: true }).fill("2026-11-01");
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(
    perfil.getByText("Cliente conhecido", { exact: true }),
  ).toBeVisible();
  await expect(
    perfil.locator(`a[href="${new URL(anterior).pathname}"]`),
  ).toBeVisible();
  await expect(perfil.getByLabel("Preferências", { exact: true })).toHaveValue(
    "Museus e arte",
  );
  await expect(perfil).toContainText("Gostou dos museus; reduzir caminhadas");
  await expect(perfil).toContainText("Aniversário durante a viagem");
  await expect(
    tabela.getByLabel("O que você não come", { exact: true }),
  ).toHaveValue("Carne");
  await expect(tabela.getByLabel("Idade", { exact: true })).toHaveValue("35");
});

test("vincular pessoa conhecida a slot anônimo preserva restrições e identificador Luhn", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Pessoa com restrições");
  await page.getByLabel("Viajante", { exact: true }).check();
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("numero-cliente")).toBeVisible();
  const numero = await page.getByTestId("numero-cliente").innerText();
  expect(numero).toMatch(/^CLX\d{6}$/);
  const digitos = numero.slice(3).split("").map(Number);
  expect(
    digitos.reduce(
      (s, d, i) => s + (i % 2 === 0 ? (d * 2 > 9 ? d * 2 - 9 : d * 2) : d),
      0,
    ) % 10,
  ).toBe(0);
  const tabela = page.getByRole("table", { name: "Viajantes", exact: true });
  await tabela
    .getByLabel("O que você não come", { exact: true })
    .fill("Amendoim");
  await tabela
    .getByLabel("Mobilidade", { exact: true })
    .fill("Cadeira de rodas");
  await tabela.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("region", {
      name: "Perfil do cliente: Pessoa com restrições",
      exact: true,
    }),
  ).toContainText("Cadeira de rodas");
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Organizador");
  await page.getByLabel("Pagantes", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await tabela
    .getByRole("combobox", { name: "Nome", exact: true })
    .fill("Pessoa com restrições");
  await page.getByRole("option", { name: /Pessoa com restrições/ }).click();
  await tabela.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(tabela.getByLabel("Mobilidade", { exact: true })).toHaveValue(
    "Cadeira de rodas",
  );
  await expect(
    tabela.getByLabel("O que você não come", { exact: true }),
  ).toHaveValue("Amendoim");
  await expect(
    page
      .getByRole("region", {
        name: "Perfil do cliente: Pessoa com restrições",
        exact: true,
      })
      .getByTestId("numero-cliente"),
  ).toHaveText(numero);
});
