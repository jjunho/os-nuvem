import { expect, test } from "@playwright/test";
import pg from "pg";
import { DATABASE_URL_TEST } from "../../playwright.config";
import { escolherOpcao } from "./apoio";
import { T0, entrarComo, novaViagem, reiniciar, relogio } from "./apoio";

test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
});

test("lista e kanban conservam os filtros e abrem a Viagem sem permitir arraste", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Cliente Carlos" });
  await novaViagem(page, {
    contato: "Cliente Lia",
    responsavel: "Lia",
    canal: "Agência",
  });
  await page.goto("/");
  await page
    .getByLabel("Responsável", { exact: true })
    .selectOption({ label: "Lia" });
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  await expect(page.locator("tbody")).toContainText("Cliente Lia");
  await expect(page.locator("tbody")).not.toContainText("Cliente Carlos");
  await page.getByRole("link", { name: "Kanban", exact: true }).click();
  const cartao = page.getByTestId("pipeline-cartao");
  await expect(cartao).toHaveCount(1);
  await expect(cartao).toContainText("Cliente Lia");
  await expect(page.getByLabel("Responsável", { exact: true })).toHaveValue(
    /\d+/,
  );
  await expect(cartao).toHaveAttribute("draggable", "false");
  await expect(
    page.getByTestId("pipeline-kanban").getByRole("combobox"),
  ).toHaveCount(0);
  await cartao.click();
  await expect(page.getByRole("heading", { name: "V26-0002" })).toBeVisible();
});

test("filtro de próxima ação atrasada vale nas duas visualizações e prazo tem destaque", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Contato atrasado" });
  await relogio(page, "2026-09-24T12:00:00+09:00");
  await page.goto("/");
  await page.getByLabel("Próxima ação atrasada", { exact: true }).check();
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  await expect(page.locator("tbody tr")).toContainText("Contato atrasado");
  await page.getByRole("link", { name: "Kanban", exact: true }).click();
  await expect(page.getByTestId("pipeline-cartao")).toContainText(
    "Contato atrasado",
  );
  await expect(
    page.getByTestId("pipeline-cartao").locator(".pipeline-atrasada"),
  ).toBeVisible();
});

test("mudança de outro usuário aparece ao vivo e encerradas saem do kanban", async ({
  page,
  browser,
}) => {
  await novaViagem(page, { contato: "Cliente ao vivo" });
  const viagemUrl = page.url();
  await page.goto("/?visualizacao=kanban");
  const contexto = await browser.newContext();
  const outra = await contexto.newPage();
  try {
    await relogio(outra, T0);
    await entrarComo(outra, "Lia");
    await outra.goto(viagemUrl);
    await outra.getByLabel("Motivo do descarte").fill("Pedido duplicado");
    await outra.getByRole("button", { name: "Descartar", exact: true }).click();
    await expect(outra.getByTestId("etapa")).toHaveText("Descartada");
    await expect(page.getByTestId("pipeline-cartao")).toHaveCount(0);
    await expect(page).toHaveURL(/visualizacao=kanban/);
  } finally {
    await contexto.close();
  }
});

test("Guiamento recebe recusa do Pipeline mesmo pela URL direta", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await page.goto("/entrar?destino=/tarefas");
  await page.getByLabel("E-mail").fill("jessica@corealux.com");
  await page.getByLabel("Senha", { exact: true }).fill("corealux123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/tarefas$/);
  await expect(
    page.getByRole("heading", { name: "Minhas Tarefas", exact: true }),
  ).toBeVisible();
  expect((await page.request.get("/?visualizacao=kanban")).status()).toBe(403);
});

test("kanban e filtros estão disponíveis em coreano", async ({ page }) => {
  await novaViagem(page, { contato: "Cliente idioma" });
  await page.goto("/?visualizacao=kanban");
  await page.getByLabel("Idioma da interface").selectOption("ko");
  await expect(
    page.getByRole("link", { name: "칸반", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "필터 적용", exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("pipeline-cartao")).toContainText(
    "Cliente idioma",
  );
});

test("Conteúdo recebe cartões sem preço inclusive nos dados enviados pelo servidor", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Cliente preço protegido" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("2");
  await page.getByLabel("Preço enviado USD", { exact: true }).fill("1234");
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
  await page
    .getByRole("link", { name: "Registrar aceite", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirmar aceite", exact: true })
    .click();
  await expect(page.getByTestId("etapa")).toHaveText("Confirmada");
  await page.goto("/?visualizacao=kanban");
  await expect(page.getByTestId("pipeline-cartao")).toContainText("1.234,00");
  const banco = new pg.Pool({ connectionString: DATABASE_URL_TEST });
  try {
    await banco.query(
      "insert into usuarios(nome,email,senha_hash,papel) select 'Conteúdo','conteudo@corealux.com',senha_hash,'conteudo' from usuarios where email='carlos@corealux.com'",
    );
  } finally {
    await banco.end();
  }
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/entrar$/);
  await expect(
    page.getByRole("button", { name: "Entrar", exact: true }),
  ).toBeVisible();
  await entrarComo(page, "conteudo");
  await page.goto("/?visualizacao=kanban");
  await expect(page.getByTestId("pipeline-cartao")).toContainText(
    "Cliente preço protegido",
  );
  await expect(page.getByTestId("pipeline-cartao")).not.toContainText(
    "Preço acordado",
  );
  const resposta = await page.request.get("/?visualizacao=kanban");
  expect(await resposta.text()).not.toContain('"preco"');
});
