import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import pg from "pg";
import { DATABASE_URL_TEST } from "./ambiente";
import { expect, test } from "@playwright/test";
import { T0, entrarComo, novaViagem, relogio, reiniciar } from "./apoio";

test.beforeEach(async ({ page }) => { await reiniciar(page); });

test("entra com e-mail normalizado e mostra o nome no Pipeline", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByText("Quem é você?")).toHaveCount(0);
  await page.getByLabel("E-mail").fill("Lia@CoreaLux.com ");
  await page.getByLabel("Senha", { exact: true }).fill("corealux123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
  await expect(page.locator("header .usuario")).toHaveText("Lia");
});

test("Sair invalida o token no servidor, voltar e link direto exigem entrada", async ({ page }) => {
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Viagem protegida" });
  const url = page.url();
  const cookies = await page.context().cookies();
  const sessao = cookies.find((c) => c.name === "sessao")!;
  expect(sessao.httpOnly).toBe(true);
  expect(sessao.sameSite).toBe("Lax");
  expect(sessao.path).toBe("/");
  expect(sessao.expires - Date.now() / 1000).toBeLessThanOrEqual(36000);
  expect(cookies.some((c) => c.name === "usuario")).toBe(false);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/entrar/);
  await page.goBack();
  await expect(page).toHaveURL(/\/entrar/);
  await page.context().addCookies([sessao]); // A copied token must also be revoked.
  await page.goto(url);
  await expect(page).toHaveURL(/\/entrar/);
});

test("preserva o link da Viagem e recusa destinos externos", async ({ page }) => {
  await entrarComo(page, "Carlos");
  const codigo = await novaViagem(page, { contato: "Retorno" });
  const url = page.url();
  await page.context().clearCookies();
  await page.goto(url);
  await expect(page).toHaveURL(/\/entrar\?destino=/);
  await preencherEntrada(page);
  await expect(page.getByRole("heading", { name: codigo })).toBeVisible();
  for (const destino of ["https://example.com", "//example.com", "/\\example.com", "javascript:alert(1)"]) {
    await page.goto(`/entrar?destino=${encodeURIComponent(destino)}`);
    await preencherEntrada(page);
    await expect(page).toHaveURL(/\/$/);
  }
});

test("e-mail desconhecido e senha incorreta têm a mesma mensagem; cookie antigo não autentica", async ({ page }) => {
  await page.context().addCookies([{ name: "usuario", value: "1", domain: "localhost", path: "/" }]);
  await page.goto("/viagens/nova");
  await expect(page).toHaveURL(/\/entrar/);
  for (const [email, senha] of [["ninguem@corealux.com", "corealux123"], ["lia@corealux.com", "errada"]]) {
    await preencherEntrada(page, email, senha);
    await expect(page.getByRole("alert")).toHaveText("E-mail ou senha incorretos");
  }
});

test("duas sessões independentes e expiração absoluta em 10 horas mesmo com atividade", async ({ page, browser }) => {
  await relogio(page, T0);
  await entrarComo(page, "Lia");
  const outro = await browser.newContext();
  const segunda = await outro.newPage();
  try {
    await relogio(segunda, T0);
    await entrarComo(segunda, "Lia");
    await relogio(page, "2026-09-24T18:59:59+09:00");
    await page.goto("/viagens/nova");
    await expect(page.getByRole("heading", { name: "Nova viagem" })).toBeVisible();
    await relogio(page, "2026-09-24T19:00:00+09:00");
    await page.goto("/");
    await expect(page).toHaveURL(/\/entrar/);
    await segunda.goto("/");
    await expect(segunda.getByRole("heading", { name: "Pipeline" })).toBeVisible();
    await segunda.getByRole("button", { name: "Sair", exact: true }).click();
  } finally { await outro.close(); }
});

async function preencherEntrada(page: import("@playwright/test").Page, email = "lia@corealux.com", senha = "corealux123") {
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await Promise.all([
    page.waitForResponse((resposta) => resposta.request().method() === "POST"),
    page.getByRole("button", { name: "Entrar", exact: true }).click(),
  ]);
  await expect(page.getByRole("button", { name: "Entrando…", exact: true })).toHaveCount(0);
}

test("dez falhas bloqueiam por 15 minutos sem prolongar o bloqueio", async ({ page }) => {
  await relogio(page, T0);
  await page.goto("/entrar");
  for (let i = 0; i < 9; i++) {
    await preencherEntrada(page, "Lia@CoreaLux.com ", "errada");
    await expect(page.getByRole("alert")).toHaveText("E-mail ou senha incorretos");
  }
  await preencherEntrada(page, "lia@corealux.com", "errada");
  await expect(page.getByRole("alert")).toHaveText("Tente novamente em 15 minutos");
  await relogio(page, "2026-09-24T09:14:59+09:00");
  await preencherEntrada(page);
  await expect(page.getByRole("alert")).toHaveText("Tente novamente em 15 minutos");
  await relogio(page, "2026-09-24T09:15:00+09:00");
  await preencherEntrada(page);
  await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
});

test("nove falhas seguidas de sucesso zeram a contagem", async ({ page }) => {
  for (let ciclo = 0; ciclo < 2; ciclo++) {
    await page.goto("/entrar");
    for (let i = 0; i < 9; i++) {
      await preencherEntrada(page, "lia@corealux.com", "errada");
      await expect(page.getByRole("alert")).toHaveText("E-mail ou senha incorretos");
    }
    await preencherEntrada(page);
    await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
    await page.getByRole("button", { name: "Sair", exact: true }).click();
  }
});

test("e-mail desconhecido bloqueia igual e não afeta outro e-mail; fim do bloqueio zera falhas", async ({ page }) => {
  await relogio(page, T0);
  await page.goto("/entrar");
  for (let i = 1; i <= 10; i++) {
    await preencherEntrada(page, "desconhecido@corealux.com", "errada");
    await expect(page.getByRole("alert")).toHaveText(i < 10 ? "E-mail ou senha incorretos" : "Tente novamente em 15 minutos");
  }
  await preencherEntrada(page);
  await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await relogio(page, "2026-09-24T09:15:00+09:00");
  for (let i = 1; i <= 10; i++) {
    await preencherEntrada(page, "DESCONHECIDO@corealux.com ", "errada");
    await expect(page.getByRole("alert")).toHaveText(i < 10 ? "E-mail ou senha incorretos" : "Tente novamente em 15 minutos");
  }
});

test("dez tentativas simultâneas também bloqueiam o e-mail", async ({ page }) => {
  await relogio(page, T0);
  const respostas = await Promise.all(Array.from({ length: 10 }, (_, i) => page.request.post("/entrar", {
    form: { email: i % 2 ? "lia@corealux.com" : "LIA@corealux.com ", senha: "errada" },
  })));
  expect(respostas.every((r) => r.status() === 400)).toBe(true);
  await page.goto("/entrar");
  await preencherEntrada(page);
  await expect(page.getByRole("alert")).toHaveText("Tente novamente em 15 minutos");
});

async function prepararBanco(sql: string, valores: unknown[] = []) {
  const pool = new pg.Pool({ connectionString: DATABASE_URL_TEST });
  try { await pool.query(sql, valores); } finally { await pool.end(); }
}

function criarAdmin(nome: string, email: string, senha: string) {
  return new Promise<{ codigo: string | number; saida: string }>((resolve) => {
    execFile("pnpm", ["admin:criar", nome, email, senha], {
      env: { ...process.env, DATABASE_URL: DATABASE_URL_TEST }, timeout: 15000,
    }, (erro, stdout, stderr) => resolve({ codigo: erro?.code ?? 0, saida: stdout + stderr }));
  });
}

test("script cria o primeiro Admin e recusa uma segunda criação", async ({ page }) => {
  await prepararBanco("truncate usuarios restart identity cascade");
  const criado = await criarAdmin("Primeiro Admin", "  ADMIN@exemplo.com  ", "abcdefgh");
  expect(criado.codigo, criado.saida).toBe(0);
  await page.goto("/entrar");
  await preencherEntrada(page, "admin@exemplo.com", "abcdefgh");
  await expect(page.locator("header .usuario")).toHaveText("Primeiro Admin");
  const recusado = await criarAdmin("Intruso", "outro@exemplo.com", "abcdefgh");
  expect(recusado.codigo).not.toBe(0);
  expect(recusado.saida).toContain("Já existe um Admin ativo");
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await preencherEntrada(page, "outro@exemplo.com", "abcdefgh");
  await expect(page.getByRole("alert")).toHaveText("E-mail ou senha incorretos");
});

test("script recusa senha curta, e-mail inválido e e-mail já usado inclusive inativo", async ({ page }) => {
  await prepararBanco("update usuarios set ativo = false where papel = 'admin'");
  for (const [email, senha, mensagem] of [
    ["novo@exemplo.com", "1234567", "pelo menos 8 caracteres"],
    ["invalido", "abcdefgh", "e-mail válido"],
    [" CARLOS@corealux.com ", "abcdefgh", "E-mail já está em uso"],
    [" LIA@corealux.com ", "abcdefgh", "E-mail já está em uso"],
  ]) {
    const resultado = await criarAdmin("Novo", email, senha);
    expect(resultado.codigo).not.toBe(0);
    expect(resultado.saida).toContain(mensagem);
  }
  await page.goto("/entrar");
  await preencherEntrada(page, "novo@exemplo.com", "1234567");
  await expect(page.getByRole("alert")).toHaveText("E-mail ou senha incorretos");
  // Refusals neither replace credentials nor leave an active Admin behind.
  await preencherEntrada(page);
  await expect(page.locator("header .usuario")).toHaveText("Lia");
  const valido = await criarAdmin("Novo Admin", "novo@exemplo.com", "abcdefgh");
  expect(valido.codigo, valido.saida).toBe(0);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await preencherEntrada(page, "novo@exemplo.com", "abcdefgh");
  await expect(page.locator("header .usuario")).toHaveText("Novo Admin");
});

test("duas execuções simultâneas do script criam apenas um primeiro Admin", async ({ page }) => {
  await prepararBanco("truncate usuarios restart identity cascade");
  const resultados = await Promise.all([
    criarAdmin("Admin A", "a@exemplo.com", "abcdefgh"),
    criarAdmin("Admin B", "b@exemplo.com", "abcdefgh"),
  ]);
  expect(resultados.filter((r) => r.codigo === 0)).toHaveLength(1);
  const falha = resultados.findIndex((r) => r.codigo !== 0);
  expect(resultados[falha].saida).toContain("Já existe um Admin ativo");
  await page.goto("/entrar");
  await preencherEntrada(page, falha === 0 ? "a@exemplo.com" : "b@exemplo.com", "abcdefgh");
  await expect(page.getByRole("alert")).toHaveText("E-mail ou senha incorretos");
  await preencherEntrada(page, falha === 0 ? "b@exemplo.com" : "a@exemplo.com", "abcdefgh");
  await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
});

test("Usuário inativo recebe erro genérico e deixa de usar uma sessão existente", async ({ page }) => {
  await entrarComo(page, "Lia");
  await prepararBanco("update usuarios set ativo = false where email = $1", ["lia@corealux.com"]);
  await page.goto("/");
  await expect(page).toHaveURL(/\/entrar/);
  await preencherEntrada(page);
  await expect(page.getByRole("alert")).toHaveText("E-mail ou senha incorretos");
});

test("Papel e nome vêm do Usuário atual e nenhum hash chega ao navegador", async ({ page }) => {
  await entrarComo(page, "Lia");
  await prepararBanco("update usuarios set papel = 'itinerarios', nome = 'Lia Atualizada' where email = $1", ["lia@corealux.com"]);
  const resposta = await page.goto("/viagens/nova");
  await expect(page.locator("header .usuario")).toHaveText("Lia Atualizada");
  const html = await resposta!.text();
  expect(html).toContain("itinerarios");
  expect(html).not.toContain("scrypt$");
  expect(html).not.toContain("senhaHash");
});

test("leituras e comandos diretos exigem sessão", async ({ page }) => {
  for (const url of ["/", "/viagens/nova", "/viagens/1", "/buscar?q=contato"]) {
    const resposta = await page.request.get(url, { maxRedirects: 0 });
    expect(resposta.status()).toBe(302);
    expect(resposta.headers().location).toMatch(/^\/entrar\?destino=/);
  }
  for (const url of ["/viagens/nova", "/viagens/1"]) {
    const resposta = await page.request.post(url, { form: { acao: "responder" }, maxRedirects: 0 });
    expect(resposta.status()).toBe(302);
    expect(resposta.headers().location).toMatch(/^\/entrar\?destino=/);
  }
});

test("cookie de sessão é Secure atrás do proxy HTTPS", async ({ page }) => {
  const resposta = await page.request.post("/entrar", {
    headers: { "X-Forwarded-Proto": "https" },
    form: { email: "lia@corealux.com", senha: "corealux123" }, maxRedirects: 0,
  });
  expect(resposta.status()).toBe(302);
  expect(resposta.headers()["set-cookie"]).toMatch(/; Secure(?:;|$)/);
});

for (const origem of ["banco vazio", "migração original com histórico"] as const) {
  test(`migra ${origem} e permite criar o primeiro Admin`, async ({ page }) => {
    await prepararBanco("drop schema public cascade; drop schema if exists drizzle cascade; create schema public");
    if (origem === "migração original com histórico") {
      const inicial = await readFile("drizzle/0000_left_virginia_dare.sql", "utf8");
      await prepararBanco(inicial);
      await prepararBanco(`
        create schema drizzle;
        create table drizzle.__drizzle_migrations (id serial primary key, hash text not null, created_at bigint);
      `);
      await prepararBanco("insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, 1790234665290)", [createHash("sha256").update(inicial).digest("hex")]);
      await prepararBanco(`
        insert into usuarios (nome, papel) values ('Legado', 'atendimento');
        insert into contatos (nome) values ('Contato preservado');
        insert into viagens (codigo, canal_comercial, marca, origem, criada_em)
          values ('V26-0001', 'cliente_final', 'corealux', 'site', now());
        insert into viagem_contatos (viagem_id, contato_id, papel) values (1, 1, 'solicitante');
        insert into responsaveis (viagem_id, usuario_id, desde) values (1, 1, now());
      `);
    }
    const migracao = await new Promise<{ codigo: string | number; saida: string }>((resolve) => {
      execFile("pnpm", ["db:migrate"], { env: { ...process.env, DATABASE_URL: DATABASE_URL_TEST }, timeout: 15000 },
        (erro, stdout, stderr) => resolve({ codigo: erro?.code ?? 0, saida: stdout + stderr }));
    });
    expect(migracao.codigo, migracao.saida).toBe(0);
    const admin = await criarAdmin("Admin migrado", "migrado@exemplo.com", "abcdefgh");
    expect(admin.codigo, admin.saida).toBe(0);
    await page.goto("/entrar");
    await preencherEntrada(page, "migrado@exemplo.com", "abcdefgh");
    await expect(page.locator("header .usuario")).toHaveText("Admin migrado");
    if (origem === "migração original com histórico") {
      await expect(page.getByRole("row", { name: /V26-0001.*Contato preservado.*Legado/ })).toBeVisible();
      await page.getByRole("link", { name: "V26-0001" }).click();
      await expect(page.getByText(/Legado:.*agora/)).toBeVisible();
    }
  });
}

test("seed recusa produção antes de modificar os dados", async ({ page }) => {
  await prepararBanco("update usuarios set nome = 'Lia preservada' where email = 'lia@corealux.com'");
  const resultado = await new Promise<{ codigo: string | number; saida: string }>((resolve) => {
    execFile("pnpm", ["db:seed"], {
      env: { ...process.env, NODE_ENV: "production", TEST_MODE: "", DATABASE_URL: DATABASE_URL_TEST }, timeout: 15000,
    }, (erro, stdout, stderr) => resolve({ codigo: erro?.code ?? 0, saida: stdout + stderr }));
  });
  expect(resultado.codigo).not.toBe(0);
  expect(resultado.saida).toContain("Seed não permitido em produção");
  await entrarComo(page, "Lia");
  await expect(page.locator("header .usuario")).toHaveText("Lia preservada");
});
