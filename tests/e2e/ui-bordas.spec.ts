import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar, novaViagem } from "./apoio";

test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
});

test("identificadores e filtros inválidos são recusados antes da consulta", async ({
  page,
}) => {
  await page.goto("/quadros");
  const quadro = await page
    .getByRole("link", { name: "Meu Quadro", exact: true })
    .getAttribute("href");
  for (const caminho of [
    "/viagens/NaN",
    "/tarefas?responsavel=1.5",
    "/?pagina=Infinity",
    `${quadro}?viagem=abc`,
    `${quadro}?pagina=-1`,
  ]) {
    const resposta = await page.request.get(caminho);
    expect(resposta.status(), caminho).toBe(400);
  }
});

test("idades inválidas não desaparecem do pedido de criação", async ({
  page,
}) => {
  await page.goto("/viagens/nova");
  const form = await page
    .locator("form")
    .filter({
      has: page.getByRole("button", { name: "Criar viagem", exact: true }),
    })
    .evaluate((elemento: HTMLFormElement) =>
      Object.fromEntries(
        [...new FormData(elemento)].filter(
          (par): par is [string, string] => typeof par[1] === "string",
        ),
      ),
    );
  const resposta = await page.request.post("/viagens/nova", {
    form: {
      ...form,
      "contatos.0.nome": "Idade inválida",
      idadesCriancas: "5, abc",
    },
  });
  expect(resposta.status()).toBe(400);
  expect(await resposta.text()).toContain("Quantidade inválida");
});

test("data inexistente e comando desconhecido não criam alocação", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Calendário validado" });
  const viagemId = page.url().split("/").pop()!;
  await page.request.post("/profissionais", {
    form: { nome: "Guia calendário", papel: "guia" },
  });
  await page.goto("/profissionais");
  await page
    .getByLabel("Profissional", { exact: true })
    .selectOption({ label: "Guia calendário" });
  const profissionalId = await page
    .getByLabel("Profissional", { exact: true })
    .inputValue();
  const resposta = await page.request.post("/profissionais", {
    form: {
      intent: "alocar",
      profissionalId,
      viagemId,
      inicio: "2026-02-30",
      fim: "2026-03-03",
      periodo: "inteiro",
    },
  });
  expect(resposta.status()).toBe(400);
  const desconhecido = await page.request.post("/profissionais", {
    form: { intent: "desconhecido", nome: "Não criar", papel: "guia" },
  });
  expect(desconhecido.status()).toBe(400);
  await page.reload();
  await expect(page.getByTestId("alocacoes").locator("li")).toHaveCount(0);
  await expect(
    page.getByRole("cell", { name: "Não criar", exact: true }),
  ).toHaveCount(0);
});

test("inscrição push recusa JSON malformado como erro de entrada", async ({
  page,
}) => {
  const resposta = await page.request.post("/notificacoes", {
    data: "{",
    headers: { "Content-Type": "application/json" },
  });
  expect(resposta.status()).toBe(400);
});

test("repetição concorrente de alocação confirmada não duplica a reserva", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Reserva idempotente" });
  const viagemId = page.url().split("/").pop()!;
  await page.request.post("/profissionais", {
    form: { nome: "Guia idempotente", papel: "guia" },
  });
  await page.goto("/profissionais");
  await page
    .getByLabel("Profissional", { exact: true })
    .selectOption({ label: "Guia idempotente" });
  const profissionalId = await page
    .getByLabel("Profissional", { exact: true })
    .inputValue();
  const form = {
    intent: "alocar",
    profissionalId,
    viagemId,
    inicio: "2026-12-10",
    fim: "2026-12-10",
    periodo: "inteiro",
  };
  const respostas = await Promise.all([
    page.request.post("/profissionais", { form }),
    page.request.post("/profissionais", { form }),
  ]);
  for (const resposta of respostas) expect(resposta.ok()).toBe(true);
  expect((await page.request.post("/profissionais", { form })).ok()).toBe(true);
  await page.reload();
  await expect(page.getByTestId("alocacoes").locator("li")).toHaveCount(1);
});
