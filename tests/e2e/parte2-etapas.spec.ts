import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar, relogio, T0 } from "./apoio";
test("perda é declarada com motivo e correção preserva histórico sem escolher etapa", async ({
  page,
}) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Cliente em decisão" });
  await page
    .getByLabel("Resposta do cliente", { exact: true })
    .selectOption("pensando");
  await page
    .getByRole("button", { name: "Registrar resposta do cliente", exact: true })
    .click();
  await expect(page.getByTestId("etapa")).toHaveText("Lead");
  await page
    .getByLabel("Resposta do cliente", { exact: true })
    .selectOption("perda");
  await page
    .getByLabel("Motivo da resposta", { exact: true })
    .fill("Preferiu outra data");
  await page
    .getByRole("button", { name: "Registrar resposta do cliente", exact: true })
    .click();
  await expect(page.getByTestId("etapa")).toHaveText("Perdida");
  const evento = page
    .getByRole("region", { name: "Histórico de etapas" })
    .getByRole("listitem")
    .filter({ hasText: "Preferiu outra data" });
  await evento
    .getByLabel("Motivo da correção")
    .fill("Resposta registrada na viagem errada");
  await evento.getByRole("button", { name: "Corrigir fato" }).click();
  await expect(page.getByTestId("etapa")).toHaveText("Lead");
  await expect(
    page.getByRole("region", { name: "Histórico de etapas" }),
  ).toContainText("Resposta registrada na viagem errada");
});

test("somente responsável ou Admin corrige fatos e motivo é obrigatório", async ({
  page,
}) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Correção protegida", responsavel: "Lia" });
  const viagem = page.url();
  await page
    .getByLabel("Resposta do cliente", { exact: true })
    .selectOption("pensando");
  await page
    .getByRole("button", { name: "Registrar resposta do cliente", exact: true })
    .click();
  const historico = page.getByRole("region", { name: "Histórico de etapas" });
  await expect(historico.getByRole("listitem")).toHaveCount(1);
  const id = await historico.locator('input[name="fatoId"]').inputValue();
  expect(
    (
      await page.request.post(viagem, {
        form: { intent: "corrigir-etapa", fatoId: id, motivoCorrecao: "" },
      })
    ).status(),
  ).toBe(400);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await entrarComo(page, "Jessica");
  expect(
    (
      await page.request.post(viagem, {
        form: {
          intent: "corrigir-etapa",
          fatoId: id,
          motivoCorrecao: "Engano",
        },
      })
    ).status(),
  ).toBe(403);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await entrarComo(page, "Lia");
  expect(
    (
      await page.request.post(viagem, {
        form: {
          intent: "corrigir-etapa",
          fatoId: id,
          motivoCorrecao: "Engano",
        },
      })
    ).ok(),
  ).toBeTruthy();
  await page.goto(viagem);
  await expect(
    page.getByRole("region", { name: "Histórico de etapas" }),
  ).toContainText("Engano");
});
