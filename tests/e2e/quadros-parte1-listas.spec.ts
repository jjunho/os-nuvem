import { expect, test } from "@playwright/test";
import { entrarComo, reiniciar, relogio, T0 } from "./apoio";
test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
});
test("Quadro pessoal cria tarefa sem prazo e sincroniza conclusão e reabertura", async ({
  page,
}) => {
  await page.goto("/quadros");
  await page.getByRole("link", { name: "Meu Quadro", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Novo", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Título", { exact: true }).fill("dentista às 17h");
  await page.getByRole("button", { name: "Criar tarefa", exact: true }).click();
  const tarefa = page.getByRole("link", { name: /TAR-.*dentista/ });
  await expect(tarefa).toBeVisible();
  await tarefa.click();
  await page
    .getByRole("button", { name: "Concluir tarefa", exact: true })
    .click();
  await page.getByRole("link", { name: "Abrir Quadro", exact: true }).click();
  await expect(page.getByTestId("lista-conclusao")).toContainText(
    "dentista às 17h",
  );
  await page.getByRole("link", { name: /TAR-.*dentista/ }).click();
  await page.getByRole("button", { name: "Reabrir", exact: true }).click();
  await page.getByRole("link", { name: "Abrir Quadro", exact: true }).click();
  await expect(page.getByTestId("lista-novo")).toContainText("dentista às 17h");
});

test("Mover por teclado entre Quadros, filtrar e consultar calendário preserva a tarefa", async ({
  page,
}) => {
  await page.goto("/quadros");
  await page.getByLabel("Nome", { exact: true }).fill("Planejamento");
  await page.getByRole("button", { name: "Criar Quadro", exact: true }).click();
  await expect(page).toHaveURL(/\/quadros\/\d+$/);
  const destino = page.url();
  await page.goto("/quadros");
  await page.getByRole("link", { name: "Meu Quadro", exact: true }).click();
  await page.getByLabel("Título", { exact: true }).fill("Agendar reunião");
  await page
    .getByLabel("Prazo", { exact: true })
    .last()
    .fill("2026-09-30T10:00");
  await page.getByRole("button", { name: "Criar tarefa", exact: true }).click();
  const tarefa = page
    .locator(".quadro-tarefa")
    .filter({ hasText: "Agendar reunião" });
  await tarefa.getByText("Mover", { exact: true }).click();
  await tarefa
    .getByLabel("Lista", { exact: true })
    .selectOption({ label: "Planejamento · Novo" });
  const salvo = page.waitForResponse(
    (r) => r.request().method() === "POST" && r.url().includes("/quadros/"),
  );
  await tarefa.getByRole("button", { name: "Mover", exact: true }).click();
  expect((await salvo).ok()).toBeTruthy();
  await expect(tarefa).toHaveCount(0);
  await page.goto(destino);
  await expect(
    page.getByRole("link", { name: /TAR-.*Agendar reunião/ }),
  ).toBeVisible();
  await page.getByLabel("Pesquisar", { exact: true }).fill("Agendar");
  await page
    .getByLabel("Calendário", { exact: true })
    .selectOption("calendario");
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "2026-09-30", exact: true }),
  ).toBeVisible();
});
