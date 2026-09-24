import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar, relogio, T0 } from "./apoio";
test("follow-ups continuam a cada três dias, alertam uma vez e resposta remove marca", async ({
  page,
}) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Sem retorno" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("1");
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
    .getByRole("link", { name: "Voltar à viagem", exact: true })
    .click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  const viagem = page.url();
  for (const dias of [3, 6, 9, 12]) {
    await relogio(
      page,
      new Date(Date.parse(T0) + dias * 86400000).toISOString(),
    );
    await entrarComo(page, "Carlos");
    await page.goto(viagem);
    await expect(
      page
        .locator(".acoes li")
        .filter({ hasText: "Retomar proposta com o cliente" }),
    ).toHaveCount(dias / 3 + 1);
  }
  await page.goto("/");
  await expect(
    page.getByRole("row").filter({ hasText: "Sem retorno" }),
  ).toContainText("Sem resposta");
  const pushes = await (await page.request.get("/test/push")).json();
  const alertas = pushes.pushes.filter((p: { chave: string }) =>
    p.chave.startsWith("sem-resposta:"),
  );
  expect(alertas.length).toBe(2);
  await page.reload();
  expect(
    (await (await page.request.get("/test/push")).json()).pushes.filter(
      (p: { chave: string }) => p.chave.startsWith("sem-resposta:"),
    ).length,
  ).toBe(2);
  await page.goto(viagem);
  await page
    .getByLabel("Resposta do cliente", { exact: true })
    .selectOption("pensando");
  await page
    .getByRole("button", { name: "Registrar resposta do cliente", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Histórico de etapas" }),
  ).toContainText("Ainda pensando");
  await page.goto("/");
  await expect(
    page.getByRole("row").filter({ hasText: "Sem retorno" }),
  ).not.toContainText("Sem resposta");
  await expect(
    page.getByRole("row").filter({ hasText: "Sem retorno" }),
  ).toContainText("Proposta enviada");
});
