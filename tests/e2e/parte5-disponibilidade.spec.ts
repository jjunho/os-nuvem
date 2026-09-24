import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";
test("disponibilidade respeita idioma e alocação confirmada sem bloquear orçamento", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await page.goto("/profissionais");
  await page.getByLabel("Nome", { exact: true }).fill("Jessica");
  await page.getByLabel("Idiomas (códigos)").fill("pt,en");
  await page.getByLabel("Especialidades").fill("BTS");
  await page
    .getByRole("button", { name: "Salvar profissional", exact: true })
    .click();
  await expect(
    page.getByRole("cell", { name: "Jessica", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("row")
      .filter({
        has: page.getByRole("cell", { name: "Jessica", exact: true }),
      }),
  ).toContainText("pt, en");
  await novaViagem(page, { contato: "Reserva confirmada" });
  const viagemId = page.url().split("/").pop()!;
  await page.goto("/profissionais");
  await page
    .getByLabel("Profissional", { exact: true })
    .selectOption({ label: "Jessica" });
  await page.getByLabel("Viagem ID").fill(viagemId);
  await page.getByLabel("Início", { exact: true }).fill("2026-10-28");
  await page.getByLabel("Fim", { exact: true }).fill("2026-10-28");
  await page
    .getByRole("button", { name: "Confirmar alocação", exact: true })
    .click();
  await expect(page.getByTestId("alocacoes")).toContainText("2026-10-28");
  await novaViagem(page, { contato: "Tour BTS" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await page.getByLabel("Data", { exact: true }).fill("2026-10-28");
  await page
    .getByLabel("Profissional necessário", { exact: true })
    .selectOption({ label: "Jessica" });
  await expect(
    page.getByRole("alert").filter({ hasText: "Jessica está ocupada" }),
  ).toBeVisible();
  await expect(
    page
      .getByLabel("Guia do dia", { exact: true })
      .getByRole("option", { name: "Jessica — ocupada" }),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
});
