import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar } from "./apoio";

test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
});

test("Origem filtra pelo texto e reutiliza uma exceção na próxima viagem", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Feira");
  const origem = page.getByRole("combobox", { name: "Origem", exact: true });
  await origem.fill("ins");
  await expect(
    page.getByRole("option", { name: "Instagram", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("option", { name: "Site", exact: true }),
  ).toHaveCount(0);
  await origem.press("ArrowDown");
  await origem.press("Enter");
  await expect(origem).toHaveValue("Instagram");
  await origem.fill("Feira em Lisboa");
  await page.getByRole("option", { name: /Outro/ }).click();
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  await expect(
    page.getByText("Feira em Lisboa", { exact: true }),
  ).toBeVisible();
  await page.goto("/viagens/nova");
  await origem.fill("Feira");
  await expect(
    page.getByRole("option", { name: "Feira em Lisboa", exact: true }),
  ).toBeVisible();
});

test("Contato conhecido preenche os dados e é reutilizado sem cadastrar outra pessoa", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Maria conhecida");
  await page.getByLabel("E-mail", { exact: true }).fill("maria@example.test");
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  await page.goto("/viagens/nova");
  await page
    .getByRole("combobox", { name: "Nome do contato", exact: true })
    .fill("Maria");
  await page.getByRole("option", { name: /Maria conhecida/ }).click();
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveValue(
    "maria@example.test",
  );
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  await page.goto("/viagens/nova");
  await page
    .getByRole("combobox", { name: "Nome do contato", exact: true })
    .fill("Maria");
  await expect(
    page.getByRole("option", { name: /Maria conhecida/ }),
  ).toHaveCount(1);
});

test("categoria, idiomas, marca, cidades e meios de contato aceitam opções novas e as oferecem novamente", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Exceções reutilizadas");
  const escolhas = [
    ["Categoria de atendimento", "Expedição"],
    ["Idioma do cliente", "Italiano"],
    ["Idioma de guiamento", "Alemão"],
    ["Marca", "Parceiro especial"],
    ["Cidades", "Gwangju"],
    ["Meios de contato", "Telegram"],
  ];
  for (const [campo, valor] of escolhas) {
    await page.getByRole("combobox", { name: campo, exact: true }).fill(valor);
    await page.getByRole("option", { name: /Outro/ }).click();
  }
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  for (const [, valor] of escolhas)
    await expect(
      page.getByRole("definition").filter({ hasText: valor }),
    ).toBeVisible();
  await page.goto("/viagens/nova");
  for (const [campo, valor] of escolhas) {
    await page.getByRole("combobox", { name: campo, exact: true }).fill(valor);
    await expect(
      page.getByRole("option", { name: valor, exact: true }),
    ).toBeVisible();
  }
});

test("Admin renomeia, regulariza e mescla exceção atualizando a viagem; outros não administram opções", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Origem administrada");
  await page
    .getByRole("combobox", { name: "Origem", exact: true })
    .fill("Feira Lisboa");
  await page.getByRole("option", { name: /Outro/ }).click();
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  const viagem = page.url();
  await page.goto("/opcoes");
  let linha = page.getByRole("row").filter({
    has: page.getByRole("cell", { name: "Feira Lisboa", exact: true }),
  });
  await linha.getByLabel("Nome").fill("Feira de Lisboa");
  await linha.getByRole("button", { name: "Renomear", exact: true }).click();
  linha = page.getByRole("row").filter({
    has: page.getByRole("cell", { name: "Feira de Lisboa", exact: true }),
  });
  await linha
    .getByRole("button", { name: "Tornar regular", exact: true })
    .click();
  await expect(linha).toContainText("Regular");
  await page.goto(viagem);
  await expect(
    page.getByText("Feira de Lisboa", { exact: true }),
  ).toBeVisible();
  await page.goto("/opcoes");
  await linha.getByLabel("Mesclar com").selectOption({ label: "Site" });
  await linha.getByRole("button", { name: "Mesclar", exact: true }).click();
  await expect(linha).toHaveCount(0);
  await page.goto(viagem);
  await expect(page.locator("dd").filter({ hasText: /^Site$/ })).toBeVisible();
  await page.context().clearCookies();
  await entrarComo(page, "Lia");
  const resposta = await page.request.post("/opcoes", {
    form: { intent: "regularizar", id: "1" },
  });
  expect(resposta.status()).toBe(403);
});

test("intermediários são filtrados pelo canal e Outro reutiliza um registro fora do contexto", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Cadeia excepcional");
  await page
    .getByRole("combobox", { name: "Canal comercial", exact: true })
    .fill("Agência");
  await page.getByRole("option", { name: "Agência", exact: true }).click();
  const cadeia = page.getByRole("combobox", {
    name: "Cadeia comercial 1",
    exact: true,
  });
  await cadeia.fill("");
  await expect(
    page.getByRole("option", { name: "Explore Travel (agencia)", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("option", { name: /Interep/ })).toHaveCount(0);
  await cadeia.fill("Interep");
  await page.getByRole("option", { name: /Outro/ }).click();
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  await expect(
    page.getByText("Interep (operadora)", { exact: true }),
  ).toBeVisible();
  await page.goto("/viagens/nova");
  await page
    .getByRole("combobox", { name: "Canal comercial", exact: true })
    .fill("Interep");
  await page
    .getByRole("option", { name: "Interep/Operadora", exact: true })
    .click();
  await cadeia.fill("Interep");
  await expect(
    page.getByRole("option", { name: "Interep (operadora)", exact: true }),
  ).toHaveCount(1);
});

test("canal excepcional é salvo e reutilizado sem exigir uma regra conhecida", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Canal especial");
  const canal = page.getByRole("combobox", {
    name: "Canal comercial",
    exact: true,
  });
  await canal.fill("Convênio cultural");
  await page.getByRole("option", { name: /Outro/ }).click();
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toHaveText("Lead");
  await expect(
    page.getByText("Convênio cultural", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Responder o primeiro contato/)).toBeVisible();
  await page.goto("/viagens/nova");
  await canal.fill("Convênio");
  await expect(
    page.getByRole("option", { name: "Convênio cultural", exact: true }),
  ).toBeVisible();
});
