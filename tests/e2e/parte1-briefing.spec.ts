import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";

test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
});

test("checklist pede só o que falta e as respostas estruturadas alimentam a viagem e o viajante", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Briefing incompleto" });
  const faltantes = page.getByRole("region", {
    name: "Dados faltantes",
    exact: true,
  });
  await expect(faltantes).toBeVisible();
  for (const item of [
    "Datas",
    "Viajantes",
    "Idades",
    "Hotel",
    "Mobilidade",
    "O que você não come",
    "Nível de restaurante",
    "Ritmo",
  ]) {
    await expect(faltantes.getByText(item, { exact: true })).toBeVisible();
  }
  await page.getByLabel("Chegada", { exact: true }).fill("2026-10-28");
  await page.getByLabel("Partida", { exact: true }).fill("2026-11-01");
  await page
    .getByRole("combobox", { name: "Hotel", exact: true })
    .fill("Hotel do cliente");
  await page.getByRole("option", { name: /Outro/ }).click();
  await page
    .getByRole("button", { name: "Salvar planejamento", exact: true })
    .click();
  await expect(faltantes.getByText("Datas", { exact: true })).toHaveCount(0);
  await expect(faltantes.getByText("Hotel", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Mensagem para pedir dados")).not.toHaveValue(
    /hotel|datas/i,
  );
  await page
    .getByRole("button", { name: "Adicionar viajante", exact: true })
    .click();
  const viajante = page
    .getByRole("table", { name: "Viajantes", exact: true })
    .locator("tbody tr")
    .first();
  await viajante.getByLabel("Idade", { exact: true }).fill("34");
  await viajante
    .getByLabel("Mobilidade", { exact: true })
    .fill("Sem restrições");
  await viajante
    .getByLabel("O que você não come", { exact: true })
    .fill("Frutos do mar");
  await viajante.getByRole("button", { name: "Salvar", exact: true }).click();
  for (const item of [
    "Viajantes",
    "Idades",
    "Mobilidade",
    "O que você não come",
  ])
    await expect(faltantes.getByText(item, { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(
    viajante.getByLabel("O que você não come", { exact: true }),
  ).toHaveValue("Frutos do mar");
  await expect(page.getByLabel("Chegada", { exact: true })).toHaveValue(
    "2026-10-28",
  );
});

test("mensagens nos quatro idiomas podem ser copiadas e o Admin edita o modelo", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  for (const [idioma, cumprimento, pergunta] of [
    ["Português", "Olá", "O que você não come"],
    ["Espanhol", "Hola", "Qué no come"],
    ["Inglês", "Hello", "What you do not eat"],
    ["Francês", "Bonjour", "Ce que vous ne mangez pas"],
  ]) {
    await page.goto("/viagens/nova");
    await page.getByLabel("Nome do contato").fill(`Contato ${idioma}`);
    await page
      .getByRole("combobox", { name: "Idioma do cliente", exact: true })
      .fill(idioma);
    await page
      .getByRole("listbox", { name: "Idioma do cliente", exact: true })
      .getByRole("option", { name: idioma, exact: true })
      .click();
    await page
      .getByRole("button", { name: "Criar viagem", exact: true })
      .click();
    const primeira = page.getByLabel("Primeira resposta", { exact: true });
    await expect(primeira).toBeVisible();
    await expect(primeira).toHaveValue(new RegExp(cumprimento));
    await expect(page.getByLabel("Mensagem para pedir dados")).toHaveValue(
      new RegExp(pergunta),
    );
    await page
      .getByRole("button", { name: "Copiar primeira resposta", exact: true })
      .click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(await primeira.inputValue());
  }
  await page.goto("/modelos-resposta");
  await page
    .getByLabel("Modelo Português")
    .fill("Olá, modelo atualizado. {dados_faltantes}");
  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        r.url().includes("/modelos-resposta"),
    ),
    page.getByRole("button", { name: "Salvar Português", exact: true }).click(),
  ]);
  await novaViagem(page, { contato: "Modelo editado" });
  await expect(
    page.getByLabel("Primeira resposta", { exact: true }),
  ).toHaveValue(/modelo atualizado/);
});
