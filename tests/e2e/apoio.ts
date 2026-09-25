import { expect, type Page } from "@playwright/test";

export const T0 = "2026-09-24T09:00:00+09:00";

export async function reiniciar(page: Page) {
  const r = await page.request.post("/test/reset");
  expect(r.ok()).toBeTruthy();
  await page.context().clearCookies();
}

export async function relogio(page: Page, iso: string) {
  await page.context().addCookies([
    {
      name: "x-test-now",
      value: encodeURIComponent(iso),
      domain: "localhost",
      path: "/",
    },
  ]);
}

export async function entrarComo(page: Page, nome: string) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(`${nome.toLowerCase()}@corealux.com`);
  await page.getByLabel("Senha", { exact: true }).fill("corealux123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: nome.toLowerCase() === "jessica" ? "Minhas Tarefas" : "Pipeline",
      exact: true,
    }),
  ).toBeVisible();
}

export async function novaViagem(
  page: Page,
  dados: {
    contato: string;
    telefone?: string;
    email?: string;
    canal?: "Interep/Operadora" | "Agência" | "Cliente final" | "Influencer";
    cadeia?: string[];
    responsavel?: string;
  },
) {
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill(dados.contato);
  if (dados.telefone)
    await page
      .getByRole("textbox", { name: "Telefone", exact: true })
      .fill(dados.telefone);
  if (dados.email)
    await page
      .getByRole("textbox", { name: "E-mail", exact: true })
      .fill(dados.email);
  if (dados.canal) {
    await page
      .getByRole("combobox", { name: "Canal comercial", exact: true })
      .fill(dados.canal);
    await page.getByRole("option", { name: dados.canal, exact: true }).click();
  }
  for (const [i, nome] of (dados.cadeia ?? []).entries()) {
    await page
      .getByRole("combobox", { name: `Cadeia comercial ${i + 1}`, exact: true })
      .fill(nome);
    await page.getByRole("option", { name: nome, exact: true }).click();
  }
  if (dados.responsavel)
    await page
      .getByLabel("Responsável")
      .selectOption({ label: dados.responsavel });
  await page.getByRole("button", { name: "Criar viagem" }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  return (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
}

export async function escolherOpcao(
  campo: import("@playwright/test").Locator,
  valor: string,
) {
  const nomes: Record<string, string> = {
    livre: "Dia livre",
    meio: "Meio período",
    completo: "Dia completo",
    premium: "Premium",
    vip: "VIP",
    padrao: "Padrão",
    spark: "Spark próprio",
    solati: "Hyundai Solati",
    sprinter: "Mercedes Sprinter",
  };
  await campo.fill(nomes[valor] ?? valor);
  await campo.press("ArrowDown");
  await campo.press("Enter");
}
