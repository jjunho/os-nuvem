import { expect, test } from "@playwright/test";
import pg from "pg";
import { DATABASE_URL_TEST } from "../../playwright.config";
import { T0, entrarComo, reiniciar, relogio } from "./apoio";

// ADR-0003 budgets, measured on the production build with realistic volume.
const VIAGENS = 5000;

test.beforeAll(async ({ request }) => {
  await request.post("/test/reset");
  const pool = new pg.Pool({ connectionString: DATABASE_URL_TEST });
  await pool.query(`
    insert into contatos (nome, telefone, email)
    select 'Contato ' || g, '5511' || lpad(g::text, 8, '0'), 'c' || g || '@exemplo.com'
    from generate_series(1, ${VIAGENS}) g;
    insert into viagens (codigo, etapa, canal_comercial, marca, origem, criada_em)
    select 'V26-' || lpad(g::text, 4, '0'),
           (array['lead','em_orcamento','proposta_enviada','confirmada','concluida'])[1 + g % 5]::etapa,
           (array['agencia','cliente_final','operadora'])[1 + g % 3]::canal_comercial,
           'corealux', 'site', timestamptz '2026-01-01' + (g || ' hours')::interval
    from generate_series(1, ${VIAGENS}) g;
    insert into viagem_contatos (viagem_id, contato_id, papel) select g, g, 'solicitante' from generate_series(1, ${VIAGENS}) g;
    insert into responsaveis (viagem_id, usuario_id, desde) select g, 1 + g % 4, timestamptz '2026-01-01' from generate_series(1, ${VIAGENS}) g;
    insert into proximas_acoes (viagem_id, tipo, descricao, responsavel_id, prazo)
    select g, 'responder', 'Responder o primeiro contato', 1 + g % 4, timestamptz '2026-01-01' + (g || ' hours')::interval
    from generate_series(1, ${VIAGENS}) g;
    analyze;
  `);
  await pool.end();
});

test("leitura no servidor em até 100 ms", async ({ page }) => {
  await entrarComo(page, "Carlos");
  await relogio(page, T0);
  for (const url of ["/buscar?q=Contato%204999", "/buscar?q=V26-4321", "/buscar?q=5511000031"]) {
    await page.request.get(url); // warm-up
    const inicio = Date.now();
    const r = await page.request.get(url);
    const ms = Date.now() - inicio;
    expect(r.ok()).toBeTruthy();
    expect(ms, `${url} levou ${ms} ms`).toBeLessThan(100);
  }
});

test("navegação entre telas em até 300 ms", async ({ page }) => {
  await entrarComo(page, "Carlos");
  await relogio(page, T0);
  await page.goto("/viagens/4000");
  await expect(page.getByRole("heading", { name: "V26-4000" })).toBeVisible();

  const inicio = Date.now();
  await page.getByRole("link", { name: "Pipeline" }).click();
  await expect(page.getByRole("row", { name: /V26-/ }).first()).toBeVisible();
  const ms = Date.now() - inicio;
  expect(ms, `pipeline levou ${ms} ms`).toBeLessThan(300);
});

test("resposta visível a um clique em até 100 ms", async ({ page }) => {
  await entrarComo(page, "Carlos");
  await relogio(page, "2026-09-24T09:00:00+09:00");
  await page.goto("/viagens/4995");
  const botao = page.getByRole("button", { name: "Respondi o contato" });
  await expect(botao).toBeVisible();
  const ms = await page.evaluate(async () => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent === "Respondi o contato")!;
    const inicio = performance.now();
    b.click();
    await new Promise<void>((resolve) => {
      const check = () => (document.body.textContent?.includes("Respondi o contato") ? requestAnimationFrame(check) : resolve());
      check();
    });
    return performance.now() - inicio;
  });
  expect(ms, `feedback levou ${ms} ms`).toBeLessThan(100);
});

test.afterAll(async ({ request }) => {
  await request.post("/test/reset");
});
