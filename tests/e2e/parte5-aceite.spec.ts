import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar, relogio, T0 } from "./apoio";
test("aceite seleciona a opção enviada, avisa validade e correção desfaz o aceite", async ({
  page,
}) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Aceite fora da validade" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("10");
  await page.getByLabel("Gratuidades", { exact: true }).fill("2");
  await page.getByLabel("Preço enviado USD", { exact: true }).fill("1000");
  await page.getByRole("button", { name: "Copiar opção", exact: true }).click();
  const b = page.getByRole("region", { name: "Opção B", exact: true });
  await b.getByLabel("Pagantes", { exact: true }).fill("12");
  await b.getByLabel("Preço enviado USD", { exact: true }).fill("1200");
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
    .getByRole("button", { name: "Iniciar nova versão", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: /Versão 2/ })).toBeVisible();
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
  await relogio(page, "2026-10-20T09:00:00+09:00");
  await entrarComo(page, "Carlos");
  await page.goto(viagem);
  await page
    .getByLabel("Resposta do cliente", { exact: true })
    .selectOption("aceitou");
  await page
    .getByRole("button", { name: "Registrar resposta do cliente", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Registrar aceite", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Proposta fora da validade; confira os preços", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByLabel("Opção aceita", { exact: true })
    .selectOption({ label: "Opção B — 12 + 2" });
  await page
    .getByRole("button", { name: "Confirmar aceite", exact: true })
    .click();
  await expect(page.getByTestId("etapa")).toHaveText("Confirmada");
  await expect(page.getByTestId("preco-acordado")).toContainText("1.200,00");
  const fato = page
    .getByRole("region", { name: "Histórico de etapas" })
    .getByRole("listitem")
    .filter({ hasText: /Aceitou/ });
  await fato
    .getByLabel("Motivo da correção")
    .fill("Opção registrada por engano");
  await fato.getByRole("button", { name: "Corrigir fato" }).click();
  await expect(page.getByTestId("etapa")).toHaveText("Proposta enviada");
  await expect(page.getByTestId("preco-acordado")).toHaveCount(0);
});
