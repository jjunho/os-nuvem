import { expect, type Page } from "@playwright/test";

export const T0 = "2026-09-24T09:00:00+09:00";

export async function reiniciar(page: Page) {
  const r = await page.request.post("/test/reset");
  expect(r.ok()).toBeTruthy();
  await page.context().clearCookies();
}

export async function relogio(page: Page, iso: string) {
  await page.context().addCookies([{ name: "x-test-now", value: encodeURIComponent(iso), domain: "localhost", path: "/" }]);
}

export async function entrarComo(page: Page, nome: string) {
  await page.goto("/entrar");
  await page.getByRole("button", { name: nome }).click();
  await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
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
  if (dados.telefone) await page.getByRole("textbox", { name: "Telefone", exact: true }).fill(dados.telefone);
  if (dados.email) await page.getByRole("textbox", { name: "E-mail", exact: true }).fill(dados.email);
  if (dados.canal) await page.getByLabel("Canal comercial").selectOption({ label: dados.canal });
  for (const [i, nome] of (dados.cadeia ?? []).entries()) {
    await page.getByLabel(`Cadeia comercial ${i + 1}`).selectOption({ label: nome });
  }
  if (dados.responsavel) await page.getByLabel("Responsável").selectOption({ label: dados.responsavel });
  await page.getByRole("button", { name: "Criar viagem" }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  return (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
}
