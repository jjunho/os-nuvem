import { expect, test } from "@playwright/test";
import { T0, entrarComo, novaViagem, reiniciar, relogio } from "./apoio";

// Spec 1, part 1 — Viagem and first contact (vertical: screen → module → PostgreSQL).

test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
});

test("um lead B2C nasce com código, Responsável e prazo de resposta de 2h", async ({
  page,
}) => {
  const codigo = await novaViagem(page, {
    contato: "Ygara Mendes",
    telefone: "+55 21 99999-0001",
  });
  expect(codigo).toBe("V26-0001");
  await expect(page.getByTestId("etapa")).toHaveText("Lead");
  await expect(
    page.getByText(
      "Responder o primeiro contato — Carlos — prazo 24/09/2026, 11:00",
    ),
  ).toBeVisible();
  await expect(page.getByText("Guia na Coreia (B2C)")).toBeVisible();

  await page.goto("/");
  const linha = page.getByRole("row", { name: /V26-0001/ });
  await expect(linha).toContainText("Ygara Mendes");
  await expect(linha).toContainText("Carlos");
});

test("uma Agência tem prazo de 8h, marca CoreaLux e a cadeia comercial registrada", async ({
  page,
}) => {
  await novaViagem(page, {
    contato: "Analu Souza",
    canal: "Agência",
    cadeia: ["Explore Travel (agencia)"],
  });
  await expect(page.getByText("prazo 24/09/2026, 17:00")).toBeVisible();
  await expect(page.getByText("CoreaLux (B2B)")).toBeVisible();
  await expect(page.getByText("Explore Travel (agencia)")).toBeVisible();
});

test("sem resposta humana por 24h, a Viagem é destacada até alguém responder", async ({
  page,
}) => {
  await novaViagem(page, {
    contato: "Luve Viagens — Ana",
    telefone: "11 90000-0002",
  });
  await relogio(page, "2026-09-25T10:00:00+09:00");
  // A new working day requires a new 10-hour session.
  await entrarComo(page, "Carlos");
  await page.goto("/");
  await expect(page.getByRole("alert")).toHaveText(
    "1 viagem sem resposta há mais de 24h",
  );

  await page.getByRole("link", { name: "V26-0001" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Sem resposta há mais de 24h",
  );
  await page
    .getByLabel("O que ocorreu", { exact: true })
    .fill("Respondi via WhatsApp");
  await page
    .getByLabel("Por quê", { exact: true })
    .fill("Solicitação do cliente");
  await page.getByRole("button", { name: "Respondi o contato" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);

  await page.goto("/");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("trocar o Responsável guarda o histórico e passa a próxima ação", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Rafael", telefone: "55 11 98523-6101" });
  await relogio(page, "2026-09-24T10:30:00+09:00");
  await page.getByLabel("Responsável").selectOption({ label: "Lia" });
  await expect(
    page.getByText("Carlos: 24/09/2026, 09:00 → 24/09/2026, 10:30"),
  ).toBeVisible();
  await expect(page.getByText("Lia: 24/09/2026, 10:30 → agora")).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Responder o primeiro contato — Lia"),
  ).toBeVisible();
});

test("um contato que não é pedido de viagem é descartado e sai do pipeline", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Repórter TV" });
  await page.getByLabel("Motivo do descarte").fill("Imprensa");
  await page.getByRole("button", { name: "Descartar" }).click();
  await expect(page.getByTestId("etapa")).toHaveText("Descartada");
  await page.goto("/");
  await expect(page.getByRole("row", { name: /V26-0001/ })).toHaveCount(0);
});

test("o mesmo contato aberto por outra cadeia comercial gera aviso", async ({
  page,
}) => {
  await novaViagem(page, {
    contato: "Isabelle",
    telefone: "+55 11 97777-0003",
    canal: "Interep/Operadora",
    cadeia: ["Interep (operadora)"],
  });
  await novaViagem(page, {
    contato: "Isabelle",
    telefone: "11 97777-0003".replace(/^/, "+55 "),
  });
  await expect(page.getByRole("status")).toContainText(
    "V26-0001 já está aberta com o mesmo contato por outra cadeia comercial",
  );
});

test("Ctrl+K encontra a Viagem pelo telefone e abre", async ({ page }) => {
  await novaViagem(page, {
    contato: "Fernando",
    telefone: "+55 11 95555-0004",
  });
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await page
    .getByPlaceholder("Código, contato, telefone, e-mail ou agência")
    .fill("95555");
  await expect(page.getByRole("dialog").getByText("V26-0001")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "V26-0001" })).toBeVisible();
});
