import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar, relogio, T0 } from "./apoio";
for (const b2b of [true, false])
  test(`primeiro contato até confirmação — ${b2b ? "B2B 10+2 e 12+2" : "B2C família"}`, async ({
    page,
  }) => {
    await reiniciar(page);
    await relogio(page, T0);
    await entrarComo(page, "Carlos");
    await page.goto("/viagens/nova");
    await page
      .getByLabel("Nome do contato")
      .fill(b2b ? "Agente transversal" : "Família transversal");
    await page.getByLabel("Pagantes", { exact: true }).fill(b2b ? "10" : "2");
    await page.getByLabel("Gratuidades", { exact: true }).fill(b2b ? "2" : "0");
    if (b2b) {
      await page
        .getByRole("combobox", { name: "Canal comercial", exact: true })
        .fill("Agência");
      await page.getByRole("option", { name: "Agência", exact: true }).click();
    }
    await page
      .getByRole("button", { name: "Criar viagem", exact: true })
      .click();
    await expect(page.getByTestId("etapa")).toHaveText("Lead");
    const viagem = page.url();
    await expect(
      page.getByLabel("Primeira resposta", { exact: true }),
    ).toHaveValue(/Olá/);
    await page
      .getByRole("button", { name: "Respondi o contato", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Respondi o contato", exact: true }),
    ).toHaveCount(0);
    await page.getByLabel("Chegada", { exact: true }).fill("2026-10-28");
    await page.getByLabel("Partida", { exact: true }).fill("2026-10-29");
    await page
      .getByRole("combobox", { name: "Hotel", exact: true })
      .fill("Hotel transversal");
    await page.getByRole("option", { name: /Outro/ }).click();
    await page.getByLabel("Endereço do hotel", { exact: true }).fill("Seul 10");
    await Promise.all([
      page.waitForResponse(
        (r) => r.request().method() === "POST" && r.url().includes("/viagens/"),
      ),
      page
        .getByRole("button", { name: "Salvar planejamento", exact: true })
        .click(),
    ]);
    await page.reload();
    await expect(page.getByLabel("Chegada", { exact: true })).toHaveValue(
      "2026-10-28",
    );
    const pessoa = page
      .getByRole("table", { name: "Viajantes", exact: true })
      .locator("tbody tr")
      .first();
    await pessoa
      .getByRole("combobox", { name: "Nome", exact: true })
      .fill("Ana Transversal");
    await pessoa.getByRole("option", { name: /Outro/ }).click();
    await pessoa.getByLabel("Idade", { exact: true }).fill("34");
    await Promise.all([
      page.waitForResponse(
        (r) => r.request().method() === "POST" && r.url().includes("/viagens/"),
      ),
      pessoa.getByRole("button", { name: "Salvar", exact: true }).click(),
    ]);
    await page.reload();
    await expect(
      pessoa.getByRole("combobox", { name: "Nome", exact: true }),
    ).toHaveValue("Ana Transversal");
    await page
      .getByRole("button", { name: "Criar orçamento", exact: true })
      .click();
    await expect(page.getByLabel("Data", { exact: true }).first()).toHaveValue(
      "2026-10-28",
    );
    await expect(page.getByLabel("Data", { exact: true })).toHaveCount(2);
    await expect(page.getByLabel("Pagantes", { exact: true })).toHaveValue(
      b2b ? "10" : "2",
    );
    await expect(page.getByLabel("Gratuidades", { exact: true })).toHaveValue(
      b2b ? "2" : "0",
    );
    const hotel = page.getByTestId("linha-hotel");
    await expect(
      hotel.getByRole("combobox", { name: "Hotel da linha", exact: true }),
    ).toHaveValue("Hotel transversal");
    await expect(
      hotel.getByLabel("Endereço do hotel", { exact: true }),
    ).toHaveValue("Seul 10");
    await hotel
      .getByLabel("Reservado por terceiro, sem cobrança", { exact: true })
      .check();
    await page
      .getByLabel("Manhã", { exact: true })
      .first()
      .fill("Palácio e mercado tradicional");
    const guia = page.getByTestId("linha-guia").first();
    await guia.getByLabel("Valor unitário USD", { exact: true }).fill("300");
    await guia
      .getByLabel("Motivo do ajuste", { exact: true })
      .fill("Acordo para o grupo");
    await page.getByLabel("Preço enviado USD", { exact: true }).fill("3000");
    await page
      .getByRole("button", { name: "Copiar opção", exact: true })
      .click();
    const b = page.getByRole("region", { name: "Opção B", exact: true });
    if (b2b) await b.getByLabel("Pagantes", { exact: true }).fill("12");
    await escolherOpcao(
      b.getByRole("combobox", { name: "Categoria da opção", exact: true }),
      "premium",
    );
    await b.getByLabel("Preço enviado USD", { exact: true }).fill("3500");
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
    const versao1 = page.url();
    await page.goto(viagem);
    await expect(page.getByTestId("etapa")).toHaveText("Proposta enviada");
    await expect(page.locator(".acoes")).toContainText("Retomar proposta");
    await page
      .getByLabel("Resposta do cliente", { exact: true })
      .selectOption("mudancas");
    await page
      .getByRole("button", {
        name: "Registrar resposta do cliente",
        exact: true,
      })
      .click();
    await expect(page.getByTestId("etapa")).toHaveText("Em negociação");
    await page.goto(versao1);
    await page
      .getByRole("button", { name: "Iniciar nova versão", exact: true })
      .click();
    await expect(page.getByRole("heading", { name: /Versão 2/ })).toBeVisible();
    await expect(page.getByLabel("Data", { exact: true }).first()).toHaveValue(
      "2026-10-28",
    );
    await page
      .getByRole("button", { name: "Registrar envio", exact: true })
      .click();
    await expect(
      page.getByText("Versão congelada", { exact: true }),
    ).toBeVisible();
    const versao2 = page.url();
    await page
      .getByRole("link", { name: "Abrir proposta", exact: true })
      .click();
    await expect(
      page.getByText("Hotel transversal · Seul 10", { exact: false }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Ana Transversal", { exact: false }).first(),
    ).toBeVisible();
    const pdf = await page.request.get(page.url() + "?formato=pdf");
    expect(pdf.ok()).toBeTruthy();
    expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
    await page.goto(versao2);
    await page
      .getByRole("link", { name: "Registrar aceite", exact: true })
      .click();
    await page
      .getByLabel("Opção aceita", { exact: true })
      .selectOption({ label: `Opção B — ${b2b ? "12 + 2" : "2 + 0"}` });
    await page
      .getByRole("button", { name: "Confirmar aceite", exact: true })
      .click();
    await expect(page.getByTestId("etapa")).toHaveText("Confirmada");
    await expect(page.getByTestId("preco-acordado")).toContainText("3.500,00");
  });
