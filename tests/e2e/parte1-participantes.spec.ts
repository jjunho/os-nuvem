import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";

test("participantes mantêm histórico, relações são simétricas e desejos registram aprovação", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  const codigo1 = await novaViagem(page, { contato: "Grupo — parte 1" });
  const primeira = page.url();
  const codigo2 = await novaViagem(page, { contato: "Grupo — parte 2" });
  const segunda = page.url();
  await page.goto(primeira);
  const participantes = page.getByRole("region", {
    name: "Participantes",
    exact: true,
  });
  await expect(participantes).toBeVisible();
  await participantes
    .getByLabel("Participante", { exact: true })
    .selectOption({ label: "Lia" });
  await participantes
    .getByRole("button", { name: "Adicionar participante", exact: true })
    .click();
  await expect(
    participantes.getByRole("listitem").getByText("Lia", { exact: true }),
  ).toBeVisible();
  await participantes
    .getByRole("button", { name: "Remover participante", exact: true })
    .click();
  await expect(participantes).toContainText("Removido");
  await expect(participantes).toContainText("Lia");
  const relacionadas = page.getByRole("region", {
    name: "Viagens relacionadas",
    exact: true,
  });
  await relacionadas
    .getByRole("combobox", { name: "Viagem relacionada", exact: true })
    .fill(codigo2);
  await relacionadas
    .getByRole("option", { name: codigo2, exact: true })
    .click();
  await relacionadas
    .getByRole("button", { name: "Vincular viagem", exact: true })
    .click();
  await expect(
    relacionadas.getByRole("link", { name: codigo2, exact: true }),
  ).toBeVisible();
  await page.goto(segunda);
  await expect(
    relacionadas.getByRole("link", { name: codigo1, exact: true }),
  ).toBeVisible();
  await relacionadas
    .getByRole("button", { name: "Desvincular", exact: true })
    .click();
  await expect(
    relacionadas.getByRole("link", { name: codigo1, exact: true }),
  ).toHaveCount(0);
  await page.goto(primeira);
  await expect(
    relacionadas.getByRole("link", { name: codigo2, exact: true }),
  ).toHaveCount(0);
  const desejos = page.getByRole("region", {
    name: "Desejos e aprovações",
    exact: true,
  });
  await desejos.getByLabel("Desejo do cliente").fill("Hotel premium");
  await desejos
    .getByRole("button", { name: "Adicionar desejo", exact: true })
    .click();
  await desejos.getByRole("button", { name: "Aprovar", exact: true }).click();
  await expect(desejos).toContainText("Aprovado por Carlos");
  await desejos.getByLabel("Desejo do cliente").fill("Passeio de barco");
  await desejos
    .getByRole("button", { name: "Adicionar desejo", exact: true })
    .click();
  await desejos
    .getByRole("listitem")
    .filter({ hasText: "Passeio de barco" })
    .getByRole("button", { name: "Descartar desejo", exact: true })
    .click();
  await expect(desejos).toContainText("Descartado");
  await expect(desejos).toContainText("Hotel premium");
});
