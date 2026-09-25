import { expect, test } from "@playwright/test";
import {
  entrarComo,
  reiniciar,
  novaViagem,
  escolherOpcao,
  relogio,
  T0,
} from "./apoio";

test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
});

test("Voltar restaura os filtros de Tarefas e do Quadro", async ({ page }) => {
  await page.goto("/tarefas");
  const responsavel = page.locator('select[name="responsavel"]');
  const inicial = await responsavel.inputValue();
  await responsavel.selectOption({ label: "Lia" });
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  await expect(page).toHaveURL(/responsavel=/);
  await page.goBack();
  await expect(responsavel).toHaveValue(inicial);
  await page.goto("/quadros");
  await page.getByRole("link", { name: "Meu Quadro", exact: true }).click();
  await page.getByLabel("Pesquisar", { exact: true }).fill("teste");
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  await expect(page).toHaveURL(/q=teste/);
  await page.goBack();
  await expect(page.getByLabel("Pesquisar", { exact: true })).toHaveValue("");
});

test("erro de lista protegida aparece no Quadro sem desmontar a tela", async ({
  page,
}) => {
  await page.goto("/quadros");
  await page.getByRole("link", { name: "Meu Quadro", exact: true }).click();
  const novo = page.getByTestId("lista-novo");
  await novo.locator("summary").filter({ hasText: "Listas" }).click();
  await novo.getByRole("button", { name: "Arquivar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Listas pessoais são protegidas",
  );
  await expect(novo).toBeVisible();
});

test("validação da resposta mantém a viagem e permite corrigir o motivo", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Erro recuperável" });
  await page
    .getByLabel("Resposta do cliente", { exact: true })
    .selectOption("perda");
  await page
    .getByRole("button", { name: "Registrar resposta do cliente", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Informe o motivo" }),
  ).toBeVisible();
  await expect(page.getByTestId("etapa")).toHaveText("Lead");
  await expect(
    page.getByLabel("Resposta do cliente", { exact: true }),
  ).toHaveValue("perda");
  await page
    .getByLabel("Motivo da resposta", { exact: true })
    .fill("Cliente desistiu");
  await page
    .getByRole("button", { name: "Registrar resposta do cliente", exact: true })
    .click();
  await expect(page.getByTestId("etapa")).toHaveText("Perdida");
});

test("aceite conserva versão visível e enviada ao voltar e recupera erro de data", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Versões do aceite" });
  const viagem = page.url();
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("2");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page
    .getByRole("button", { name: "Registrar envio", exact: true })
    .click();
  await expect(
    page.getByText("Versão congelada", { exact: true }),
  ).toBeVisible();
  const primeira = page.url().split("/").pop()!;
  await page
    .getByRole("button", { name: "Iniciar nova versão", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: /Versão 2/ })).toBeVisible();
  await page
    .getByRole("button", { name: "Registrar envio", exact: true })
    .click();
  await expect(
    page.getByText("Versão congelada", { exact: true }),
  ).toBeVisible();
  const segunda = page.url().split("/").pop()!;
  expect(
    (await page.request.get(`${viagem}/aceite?versao=2147483647`)).status(),
  ).toBe(400);
  await page.goto(`${viagem}/aceite?versao=${primeira}`);
  await page.getByLabel("Versão aceita", { exact: true }).selectOption(segunda);
  await expect(page).toHaveURL(new RegExp(`versao=${segunda}$`));
  await page.goBack();
  await expect(page.getByLabel("Versão aceita", { exact: true })).toHaveValue(
    primeira,
  );
  await expect(page.locator('input[name="orcamentoId"]')).toHaveValue(primeira);
  await page.getByLabel("Aceito em (ISO)", { exact: true }).fill("invalid");
  await page
    .getByRole("button", { name: "Confirmar aceite", exact: true })
    .click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("Aceito em (ISO)", { exact: true })).toHaveValue(
    "invalid",
  );
  await page.getByLabel("Aceito em (ISO)", { exact: true }).fill(T0);
  await page
    .getByRole("button", { name: "Confirmar aceite", exact: true })
    .click();
  await expect(page.getByTestId("etapa")).toHaveText("Confirmada");
});

test("validação de quantidade e descarte preserva os campos preenchidos", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Draft preservado");
  await page.getByLabel("Pagantes", { exact: true }).fill("1001");
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Quantidade inválida");
  await expect(page.getByLabel("Nome do contato")).toHaveValue(
    "Draft preservado",
  );
  await expect(page.getByLabel("Pagantes", { exact: true })).toHaveValue(
    "1001",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toHaveText("Lead");
  await page
    .getByLabel("O que ocorreu", { exact: true })
    .fill("Contato em edição");
  await page.getByLabel("Motivo do descarte").fill("   ");
  await page.getByRole("button", { name: "Descartar", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("Motivo do descarte")).toHaveValue("   ");
  await expect(page.getByLabel("O que ocorreu", { exact: true })).toHaveValue(
    "Contato em edição",
  );
});

test("formulário público exibe validação e conserva respostas para corrigir", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Formulário com erro" });
  await page
    .getByRole("button", { name: "Enviar formulário", exact: true })
    .click();
  const link = page.getByRole("link", {
    name: "Abrir formulário",
    exact: true,
  });
  await expect(link).toBeVisible();
  await page.goto((await link.getAttribute("href"))!);
  await page.getByLabel("Chegada", { exact: true }).fill("2026-12-10");
  await page.getByLabel("Partida", { exact: true }).fill("2026-12-01");
  await page
    .getByRole("button", { name: "Enviar respostas", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveText("Datas inválidas");
  await expect(page.getByLabel("Chegada", { exact: true })).toHaveValue(
    "2026-12-10",
  );
  await page.getByLabel("Partida", { exact: true }).fill("2026-12-15");
  await page
    .getByRole("button", { name: "Enviar respostas", exact: true })
    .click();
  await expect(
    page.getByText("Respostas recebidas", { exact: true }),
  ).toBeVisible();
});

test("sucesso de nota antiga não apaga texto digitado durante o envio", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Notas concorrentes" });
  let liberar!: () => void;
  const bloqueio = new Promise<void>((resolve) => {
    liberar = resolve;
  });
  let recebido!: () => void;
  const respondeu = new Promise<void>((resolve) => {
    recebido = resolve;
  });
  await page.route("**/viagens/*.data*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const response = await route.fetch();
    recebido();
    await bloqueio;
    await route.fulfill({ response });
  });
  const nota = page.getByLabel("Nova nota");
  await nota.fill("Nota enviada");
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await respondeu;
  await nota.fill("Próxima nota");
  liberar();
  await expect(
    page.getByRole("button", { name: "Adicionar", exact: true }),
  ).toBeEnabled();
  await expect(nota).toHaveValue("Próxima nota");
  await expect(page.locator(".notas")).toContainText("Nota enviada");
});

test("filtro de viagem continua visível quando a pesquisa não retorna tarefas", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Filtro sem resultados" });
  const id = page.url().split("/").pop()!;
  await page.goto("/quadros");
  await page.getByRole("link", { name: "Meu Quadro", exact: true }).click();
  await expect(page).toHaveURL(/\/quadros\/\d+$/);
  await page.goto(`${page.url()}?viagem=${id}&q=texto-inexistente-9182`);
  await expect(page.getByLabel("Viagem", { exact: true })).toHaveValue(id);
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  expect(new URL(page.url()).searchParams.get("viagem")).toBe(id);
});

test("canal livre abandona cadeia do canal selecionado", async ({ page }) => {
  await page.goto("/viagens/nova");
  const canal = page.getByRole("combobox", {
    name: "Canal comercial",
    exact: true,
  });
  await canal.fill("Agência");
  await page.getByRole("option", { name: "Agência", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Cadeia comercial 1", exact: true }),
  ).toBeVisible();
  await canal.fill("Canal novo");
  await expect(
    page.getByRole("combobox", { name: "Cadeia comercial 1", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('input[name="canalComercial"]')).toHaveValue(
    "Canal novo",
  );
});

test("dois submits síncronos criam uma única alocação", async ({ page }) => {
  await novaViagem(page, { contato: "Alocação única" });
  const viagemId = page.url().split("/").pop()!;
  await page.goto("/profissionais");
  await page.getByLabel("Nome", { exact: true }).fill("Guia de teste");
  await page.getByLabel("Idiomas (códigos)").fill("pt");
  await page
    .getByRole("button", { name: "Salvar profissional", exact: true })
    .click();
  await expect(
    page.getByRole("cell", { name: "Guia de teste", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Profissional", { exact: true })
    .selectOption({ label: "Guia de teste" });
  await page.getByLabel("Viagem ID").fill(viagemId);
  await page.getByLabel("Início", { exact: true }).fill("2026-12-10");
  await page.getByLabel("Fim", { exact: true }).fill("2026-12-10");
  let chamadas = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/profissionais"))
      chamadas++;
  });
  await page
    .getByRole("button", { name: "Confirmar alocação", exact: true })
    .evaluate((botao: HTMLButtonElement) => {
      botao.form!.requestSubmit(botao);
      botao.form!.requestSubmit(botao);
    });
  await expect(page.getByTestId("alocacoes").locator("li")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Confirmar alocação", exact: true }),
  ).toBeEnabled();
  expect(chamadas).toBe(1);
});

test("cabeçalho do shell em 390 px cabe na largura e mantém a navegação", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const medidas = await page.locator("header.topo").evaluate((elemento) => ({
    scrollWidth: elemento.scrollWidth,
    clientWidth: elemento.clientWidth,
    direita: elemento.getBoundingClientRect().right,
  }));
  expect(medidas.clientWidth).toBe(390);
  expect(medidas.scrollWidth).toBe(medidas.clientWidth);
  expect(medidas.direita).toBeLessThanOrEqual(390);
  const navegacao = page.locator("header.topo nav");
  const caixa = await navegacao.boundingBox();
  expect(caixa).not.toBeNull();
  expect((caixa?.x ?? 0) + (caixa?.width ?? 0)).toBeLessThanOrEqual(390);
  expect(caixa?.width ?? 0).toBeGreaterThan(300);
});
