import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";

test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
});

test("link público pede só dados faltantes, atualiza os mesmos registros e pode ser revogado", async ({
  page,
  browser,
}) => {
  await novaViagem(page, { contato: "Cliente protegido" });
  await page.getByLabel("Chegada", { exact: true }).fill("2026-10-28");
  await page.getByLabel("Partida", { exact: true }).fill("2026-11-01");
  await page
    .getByRole("button", { name: "Salvar planejamento", exact: true })
    .click();
  await page.getByLabel("Nova nota").fill("Segredo comercial 987");
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await page
    .getByRole("button", { name: "Adicionar viajante", exact: true })
    .click();
  const enviar = page.getByRole("button", {
    name: "Enviar formulário",
    exact: true,
  });
  await expect(enviar).toBeVisible();
  await enviar.click();
  const link = await page
    .getByRole("link", { name: "Abrir formulário", exact: true })
    .getAttribute("href");
  expect(link).toMatch(/^\/planejamento\/[a-f0-9]{64}$/);
  const externo = await browser.newContext();
  try {
    const formulario = await externo.newPage();
    const resposta = await formulario.goto(new URL(link!, page.url()).href);
    const html = await resposta!.text();
    expect(html).not.toContain("Segredo comercial 987");
    expect(html).not.toContain("Cliente protegido");
    expect(html).not.toContain("Corealux OS");
    await expect(formulario.getByLabel("Chegada", { exact: true })).toHaveCount(
      0,
    );
    await formulario
      .getByLabel("Hotel", { exact: true })
      .fill("Hotel informado");
    await formulario.getByLabel("Nome", { exact: true }).fill("Ana externa");
    await formulario.getByLabel("Idade", { exact: true }).fill("34");
    await formulario
      .getByRole("button", { name: "Enviar respostas", exact: true })
      .click();
    await expect(
      formulario.getByText("Respostas recebidas", { exact: true }),
    ).toBeVisible();
    await formulario
      .getByLabel("O que você não come", { exact: true })
      .fill("Amendoim");
    await formulario
      .getByRole("button", { name: "Enviar respostas", exact: true })
      .click();
    await expect(
      formulario.getByLabel("O que você não come", { exact: true }),
    ).toHaveCount(0);
    await page.reload();
    const viajantes = page.getByRole("table", {
      name: "Viajantes",
      exact: true,
    });
    await expect(viajantes.locator("tbody tr")).toHaveCount(1);
    await expect(
      viajantes.getByRole("cell", { name: "Ana externa", exact: true }),
    ).toBeVisible();
    await expect(
      viajantes.getByLabel("O que você não come", { exact: true }),
    ).toHaveValue("Amendoim");
    await expect(
      page.getByRole("combobox", { name: "Hotel", exact: true }),
    ).toHaveValue("Hotel informado");
    await page
      .getByRole("button", { name: "Revogar formulário", exact: true })
      .click();
    await expect(
      page.getByText("Formulário revogado", { exact: true }),
    ).toBeVisible();
    expect(
      (await formulario.goto(new URL(link!, page.url()).href))!.status(),
    ).toBe(404);
  } finally {
    await externo.close();
  }
});

test("respostas coladas preenchem campos conhecidos e anexos ficam disponíveis só para a equipe", async ({
  page,
  browser,
}) => {
  await novaViagem(page, { contato: "Respostas por e-mail" });
  const texto = page.getByLabel("Respostas recebidas", { exact: true });
  await expect(texto).toBeVisible();
  await texto.fill("Hotel: Hotel colado\nRitmo: Tranquilo");
  await page
    .getByRole("button", { name: "Adicionar respostas", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Hotel", exact: true }),
  ).toHaveValue("Hotel colado");
  await expect(
    page.getByRole("combobox", { name: "Ritmo", exact: true }),
  ).toHaveValue("Tranquilo");
  await page
    .getByLabel("Arquivo de planejamento")
    .setInputFiles({
      name: "briefing.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Resposta original confidencial"),
    });
  await page
    .getByRole("button", { name: "Adicionar respostas", exact: true })
    .click();
  const anexo = page.getByRole("link", { name: "briefing.txt", exact: true });
  await expect(anexo).toBeVisible();
  const url = new URL((await anexo.getAttribute("href"))!, page.url()).href;
  const download = await page.request.get(url);
  expect(await download.text()).toBe("Resposta original confidencial");
  expect(download.headers()["content-disposition"]).toContain("attachment");
  const anonimo = await browser.newContext();
  try {
    expect((await anonimo.request.get(url, { maxRedirects: 0 })).status()).toBe(
      302,
    );
  } finally {
    await anonimo.close();
  }
});

test("resposta conflitante aguarda escolha da equipe e não sobrescreve o planejamento", async ({
  page,
  browser,
}) => {
  await novaViagem(page, { contato: "Conflito de hotel" });
  await page
    .getByRole("button", { name: "Enviar formulário", exact: true })
    .click();
  const link = await page
    .getByRole("link", { name: "Abrir formulário", exact: true })
    .getAttribute("href");
  const externo = await browser.newContext();
  try {
    const formulario = await externo.newPage();
    await formulario.goto(new URL(link!, page.url()).href);
    await page
      .getByRole("combobox", { name: "Hotel", exact: true })
      .fill("Hotel registrado");
    await page
      .getByRole("button", { name: "Salvar planejamento", exact: true })
      .click();
    await formulario
      .getByRole("combobox", { name: "Hotel", exact: true })
      .fill("Hotel desejado");
    await formulario
      .getByRole("button", { name: "Enviar respostas", exact: true })
      .click();
    await expect(
      formulario.getByText("Respostas recebidas", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("combobox", { name: "Hotel", exact: true }),
    ).toHaveValue("Hotel registrado");
    const conflitos = page.getByRole("region", {
      name: "Respostas conflitantes",
      exact: true,
    });
    await expect(conflitos).toContainText("Hotel registrado");
    await expect(conflitos).toContainText("Hotel desejado");
    await conflitos
      .getByRole("button", { name: "Usar resposta", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Hotel", exact: true }),
    ).toHaveValue("Hotel desejado");
    await expect(conflitos).toHaveCount(0);
  } finally {
    await externo.close();
  }
});
