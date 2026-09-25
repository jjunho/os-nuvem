import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";

test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
});

test("refocar a segunda opção e Enter preserva seu código", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  const origem = page.getByRole("combobox", { name: "Origem", exact: true });
  await origem.fill("");
  await origem.press("ArrowDown");
  await origem.press("ArrowDown");
  await origem.press("Enter");
  const codigo = await page.locator('input[name="origem"]').inputValue();
  const nome = await origem.inputValue();
  expect(codigo).not.toBe(nome);
  await origem.blur();
  await origem.focus();
  await origem.press("Enter");
  await expect(origem).toHaveValue(nome);
  await expect(page.locator('input[name="origem"]')).toHaveValue(codigo);
});

test("nome novo abandona identificadores herdados mas conserva telefone editado", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Maria original");
  await page.getByLabel("E-mail", { exact: true }).fill("maria@example.test");
  await page.getByLabel("Telefone", { exact: true }).fill("5511999999999");
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Maria");
  await page.getByRole("option", { name: /Maria original/ }).click();
  await page.getByLabel("Telefone", { exact: true }).fill("5511888888888");
  await page.getByLabel("Nome do contato").fill("João novo");
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Telefone", { exact: true })).toHaveValue(
    "5511888888888",
  );
  await expect(page.locator('input[name="contatos.0.contatoId"]')).toHaveValue(
    "",
  );
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  await expect(
    page.getByRole("region", {
      name: "Perfil do cliente: João novo",
      exact: true,
    }),
  ).toBeVisible();
});

test("nome livre de viajante não salva restrições da seleção abandonada", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Pessoa anterior");
  await page.getByLabel("Viajante", { exact: true }).check();
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  const tabela = page.getByRole("table", { name: "Viajantes", exact: true });
  await expect(tabela).toBeVisible();
  await tabela
    .getByLabel("Mobilidade", { exact: true })
    .fill("Cadeira de rodas");
  await tabela
    .getByLabel("O que você não come", { exact: true })
    .fill("Amendoim");
  await tabela.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("region", {
      name: "Perfil do cliente: Pessoa anterior",
      exact: true,
    }),
  ).toContainText("Cadeira de rodas");
  await novaViagem(page, { contato: "Organizador" });
  await page
    .getByRole("button", { name: "Adicionar viajante", exact: true })
    .click();
  const nome = tabela.getByRole("combobox", { name: "Nome", exact: true });
  await nome.fill("Pessoa anterior");
  await tabela
    .getByRole("option", { name: "Pessoa anterior", exact: true })
    .click();
  await expect(tabela.getByLabel("Mobilidade", { exact: true })).toHaveValue(
    "Cadeira de rodas",
  );
  await nome.fill("Pessoa nova");
  await nome.press("Escape");
  await expect(tabela.getByLabel("Mobilidade", { exact: true })).toHaveValue(
    "",
  );
  await expect(
    tabela.getByLabel("O que você não come", { exact: true }),
  ).toHaveValue("");
  await tabela.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    tabela.getByRole("cell", { name: "Pessoa nova", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(tabela.getByLabel("Mobilidade", { exact: true })).toHaveValue(
    "",
  );
  await expect(
    tabela.getByLabel("O que você não come", { exact: true }),
  ).toHaveValue("");
});

test("documentos exibem falha, permitem retry e distinguem lista vazia", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Documentos" });
  await page
    .getByRole("button", { name: "Adicionar viajante", exact: true })
    .click();
  let chamadas = 0;
  await page.route("**/comunicador/api?documentosViajante=*", async (route) => {
    chamadas++;
    await route.fulfill({
      status: chamadas === 1 ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify({ documentos: [] }),
    });
  });
  await page.getByText("Documentos do Viajante", { exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível carregar os documentos",
  );
  await page
    .getByRole("button", { name: "Tentar novamente", exact: true })
    .click();
  await expect(
    page.getByText("Nenhum documento", { exact: true }),
  ).toBeVisible();
});

test("cópia informa falha, permite retry e invalida sucesso quando a mensagem muda", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await novaViagem(page, { contato: "Copiar briefing" });
  const faltantes = page.getByRole("region", {
    name: "Dados faltantes",
    exact: true,
  });
  await page.evaluate(() => {
    const original = navigator.clipboard.writeText.bind(navigator.clipboard);
    let primeira = true;
    navigator.clipboard.writeText = (texto) => {
      if (primeira) {
        primeira = false;
        return Promise.reject(new Error("negado"));
      }
      return original(texto);
    };
  });
  await faltantes
    .getByRole("button", { name: "Copiar mensagem", exact: true })
    .click();
  await expect(faltantes.getByRole("alert")).toContainText(
    "Não foi possível copiar o texto",
  );
  await faltantes
    .getByRole("button", { name: "Copiar mensagem", exact: true })
    .click();
  await expect(
    faltantes.getByRole("button", { name: "Copiado", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Chegada", { exact: true }).fill("2026-10-28");
  await page.getByLabel("Partida", { exact: true }).fill("2026-11-01");
  await page
    .getByRole("button", { name: "Salvar planejamento", exact: true })
    .click();
  await expect(
    faltantes.getByRole("button", { name: "Copiar mensagem", exact: true }),
  ).toBeVisible();
});

test("documentos rejeitam itens inválidos e ignoram resposta da abertura cancelada", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Documentos cancelados" });
  await page
    .getByRole("button", { name: "Adicionar viajante", exact: true })
    .click();
  let liberar!: () => void;
  let iniciou!: () => void;
  let terminou!: () => void;
  const primeiraTerminada = new Promise<void>((resolve) => {
    terminou = resolve;
  });
  const primeiraIniciada = new Promise<void>((resolve) => {
    iniciou = resolve;
  });
  const primeiraLiberada = new Promise<void>((resolve) => {
    liberar = resolve;
  });
  let chamadas = 0;
  const id = "123e4567-e89b-42d3-a456-426614174000";
  await page.route("**/comunicador/api?documentosViajante=*", async (route) => {
    const chamada = ++chamadas;
    if (chamada === 1) {
      iniciou();
      await primeiraLiberada;
    }
    await route
      .fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ documentos: chamada <= 2 ? [null] : [{ id }] }),
      })
      .catch(() => {});
    if (chamada === 1) terminou();
  });
  const resumo = page.getByText("Documentos do Viajante", { exact: true });
  await resumo.click();
  await primeiraIniciada;
  await expect(
    page.getByText("Carregando documentos…", { exact: true }),
  ).toBeVisible();
  await resumo.click();
  await resumo.click();
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível carregar os documentos",
  );
  await page
    .getByRole("button", { name: "Tentar novamente", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Abrir documento", exact: true }),
  ).toHaveAttribute("href", `/comunicador/midia/${id}`);
  liberar();
  await primeiraTerminada;
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Abrir documento", exact: true }),
  ).toHaveAttribute("href", `/comunicador/midia/${id}`);
});

test("resposta enviada não apaga texto digitado enquanto o servidor responde", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Respostas em andamento" });
  let liberar!: () => void;
  let recebeu!: () => void;
  const recebido = new Promise<void>((resolve) => {
    recebeu = resolve;
  });
  const bloqueio = new Promise<void>((resolve) => {
    liberar = resolve;
  });
  await page.route("**/viagens/*.data", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    const resposta = await route.fetch();
    recebeu();
    await bloqueio;
    await route.fulfill({ response: resposta });
  });
  const texto = page.getByLabel("Respostas recebidas", { exact: true });
  await texto.fill("Hotel: Primeiro hotel");
  await page
    .getByRole("button", { name: "Adicionar respostas", exact: true })
    .click();
  await recebido;
  await texto.fill("Mensagem posterior ainda não enviada");
  liberar();
  await expect(
    page.getByRole("combobox", { name: "Hotel", exact: true }),
  ).toHaveValue("Primeiro hotel");
  await expect(texto).toHaveValue("Mensagem posterior ainda não enviada");
});

test("edição do viajante fica bloqueada até reconhecer o envio", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Viajante em andamento" });
  await page
    .getByRole("button", { name: "Adicionar viajante", exact: true })
    .click();
  const tabela = page.getByRole("table", { name: "Viajantes", exact: true });
  const mobilidade = tabela.getByLabel("Mobilidade", { exact: true });
  await expect(mobilidade).toBeVisible();
  let liberar!: () => void;
  let recebeu!: () => void;
  const recebido = new Promise<void>((resolve) => {
    recebeu = resolve;
  });
  const bloqueio = new Promise<void>((resolve) => {
    liberar = resolve;
  });
  await page.route("**/viagens/*.data", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    const resposta = await route.fetch();
    recebeu();
    await bloqueio;
    await route.fulfill({ response: resposta });
  });
  await mobilidade.fill("Evitar escadas");
  await tabela.getByRole("button", { name: "Salvar", exact: true }).click();
  await recebido;
  await expect(mobilidade).toBeDisabled();
  liberar();
  await expect(mobilidade).toBeEnabled();
  await expect(mobilidade).toHaveValue("Evitar escadas");
});

test("replay de respostas reconhece tentativa e rejeita conteúdo trocado, nova ação pode repetir", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Recibo planejamento" });
  const url = page.url();
  const tentativaId = crypto.randomUUID();
  const form = {
    intent: "anexar-respostas",
    tentativaId,
    textoRecebido: "Hotel: Recibo A",
  };
  expect((await page.request.post(url, { form })).ok()).toBeTruthy();
  expect((await page.request.post(url, { form })).ok()).toBeTruthy();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Respostas coladas.txt", exact: true }),
  ).toHaveCount(1);
  const conflito = await page.request.post(url, {
    form: { ...form, textoRecebido: "Hotel: Recibo B" },
  });
  expect(conflito.status()).toBe(409);
  expect(
    (
      await page.request.post(url, {
        form: { ...form, tentativaId: crypto.randomUUID() },
      })
    ).ok(),
  ).toBeTruthy();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Respostas coladas.txt", exact: true }),
  ).toHaveCount(2);
});

test("replay de geração de formulário recupera o mesmo link", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Recibo link" });
  const url = new URL(page.url());
  url.pathname += ".data";
  const form = { intent: "gerar-formulario", tentativaId: crypto.randomUUID() };
  const primeira = await page.request.post(url.toString(), { form });
  const segunda = await page.request.post(url.toString(), { form });
  expect(primeira.ok()).toBeTruthy();
  expect(segunda.ok()).toBeTruthy();
  const link = /\/planejamento\/[a-f0-9]{64}/.exec(await primeira.text())?.[0];
  if (!link) throw new Error("Resposta sem link de planejamento");
  expect(await segunda.text()).toContain(link);
});

test("revogação confirmada encerra geração sem confirmação e permite novo link", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Revogação após confirmação perdida" });
  const viagemId = new URL(page.url()).pathname.split("/").at(-1)!;
  const url = new URL(page.url());
  url.pathname += ".data";
  const tentativaId = crypto.randomUUID();
  const form = { intent: "gerar-formulario", tentativaId };
  const gerado = await page.request.post(url.toString(), { form });
  const linkAnterior = /\/planejamento\/[a-f0-9]{64}/.exec(
    await gerado.text(),
  )?.[0];
  expect(linkAnterior).toBeTruthy();
  await page.evaluate(
    ({ viagemId, tentativaId }) =>
      sessionStorage.setItem(
        `planejamento:${viagemId}:formulario`,
        JSON.stringify({ id: tentativaId, assinatura: "formulario" }),
      ),
    { viagemId, tentativaId },
  );
  await page
    .getByRole("button", { name: "Revogar formulário", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Formulário revogado");
  expect((await page.request.post(url.toString(), { form })).status()).toBe(
    409,
  );
  await page
    .getByRole("button", { name: "Enviar formulário", exact: true })
    .click();
  const link = page.getByRole("link", {
    name: "Abrir formulário",
    exact: true,
  });
  await expect(link).toBeVisible();
  await expect(link).not.toHaveAttribute("href", linkAnterior!);
  expect(
    (await page.request.get((await link.getAttribute("href"))!)).ok(),
  ).toBeTruthy();
});
