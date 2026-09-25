import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar, relogio, T0 } from "./apoio";

test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
});

test("Tarefa tem código, responsável, cópia e prazo, com histórico de conclusão, reabertura e cancelamento", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Tarefa automática" });
  await page.goto("/tarefas");
  await expect(
    page.getByRole("heading", { name: "Minhas Tarefas", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Responder o primeiro contato/ }),
  ).toBeVisible();
  await page.getByLabel("Título", { exact: true }).fill("Revisar pedido");
  await page
    .getByLabel("Descrição", { exact: true })
    .fill("Conferir detalhes do grupo");
  await page
    .getByLabel("Responsável da tarefa", { exact: true })
    .selectOption({ label: "Lia" });
  await page.getByLabel("Jessica", { exact: true }).check();
  await page
    .getByLabel("Prazo da tarefa", { exact: true })
    .fill("2026-09-25T10:00");
  await page.getByRole("button", { name: "Criar tarefa", exact: true }).click();
  await expect(page.getByTestId("codigo-tarefa")).toHaveText(/^TAR-\d+$/);
  await expect(
    page.getByRole("heading", { name: "Revisar pedido", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: /^Jessica$/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Concluir tarefa", exact: true })
    .click();
  await expect(page.getByTestId("estado-tarefa")).toHaveText("Concluída");
  await page.getByRole("button", { name: "Reabrir", exact: true }).click();
  await expect(page.getByTestId("estado-tarefa")).toHaveText("Aberta");
  await page.getByLabel("Motivo do cancelamento").fill("Pedido substituído");
  await page
    .getByRole("button", { name: "Cancelar tarefa", exact: true })
    .click();
  await expect(page.getByTestId("estado-tarefa")).toHaveText("Cancelada");
  const historico = page.getByRole("region", {
    name: "Histórico da tarefa",
    exact: true,
  });
  await expect(historico).toContainText("Carlos");
  await expect(historico).toContainText("Reaberta");
  await expect(historico).toContainText("Pedido substituído");
});

test("filtros encontram tarefas por cópia, viagem e atraso e a próxima ação usa o menor prazo", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Grupo com prazo" });
  const viagemId = page.url().split("/").pop()!;
  await page.goto("/tarefas");
  const criar = page.locator('form[method="post"]').filter({
    has: page.getByRole("button", { name: "Criar tarefa", exact: true }),
  });
  await criar.getByLabel("Título", { exact: true }).fill("Confirmar horário");
  await criar
    .getByLabel("Responsável da tarefa", { exact: true })
    .selectOption({ label: "Lia" });
  await criar.getByLabel("Carlos", { exact: true }).check();
  await criar.getByLabel("Prazo da tarefa").fill("2026-09-23T10:00");
  await criar.getByLabel("Viagem relacionada").fill(viagemId);
  await criar
    .getByRole("button", { name: "Criar tarefa", exact: true })
    .click();
  await expect(page.getByTestId("codigo-tarefa")).toBeVisible();
  await page.goto("/tarefas");
  await expect(
    page.getByRole("link", { name: /Confirmar horário/ }),
  ).toHaveCount(0);
  await page.goto(`/tarefas?responsavel=todos&viagem=${viagemId}&atrasadas=on`);
  await expect(
    page.getByRole("link", { name: /Confirmar horário/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Responder o primeiro contato/ }),
  ).toHaveCount(0);
  await page.goto("/");
  await expect(
    page.getByRole("row").filter({ hasText: "Grupo com prazo" }),
  ).toContainText("Confirmar horário");
});

test("Guiamento só acessa tarefas próprias ou em cópia, inclusive por URL", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Tarefa restrita" });
  await page.goto("/tarefas");
  const restrita = await page
    .getByRole("link", { name: /Responder o primeiro contato/ })
    .getAttribute("href");
  await page.getByLabel("Título", { exact: true }).fill("Cópia para guiamento");
  await page.getByLabel("Jessica", { exact: true }).check();
  await page.getByLabel("Prazo da tarefa").fill("2026-09-25T10:00");
  await page.getByRole("button", { name: "Criar tarefa", exact: true }).click();
  await expect(page.getByTestId("codigo-tarefa")).toBeVisible();
  const copiada = page.url();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/entrar$/);
  await entrarComo(page, "Jessica");
  await page.goto("/tarefas?responsavel=todos");
  await expect(
    page.getByRole("link", { name: /Cópia para guiamento/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Responder o primeiro contato/ }),
  ).toHaveCount(0);
  expect((await page.request.get(restrita!)).status()).toBe(403);
  expect(
    (
      await page.request.post(restrita!, { form: { intent: "concluir" } })
    ).status(),
  ).toBe(403);
  await page.goto(copiada);
  await expect(
    page.getByRole("heading", { name: "Cópia para guiamento", exact: true }),
  ).toBeVisible();
});

// Assignment and overdue pushes use the public app boundary; no module mocks.
test("avisa prazo vencido uma vez também para quem está em cópia", async ({
  page,
}) => {
  await reiniciar(page);
  await relogio(page, "2026-09-25T10:00:00+09:00");
  await entrarComo(page, "carlos");
  const d = await (await page.request.get("/comunicador/api")).json();
  const lia = d.usuarios.find((u: { nome: string }) => u.nome === "Lia").id;
  const { id } = await (
    await page.request.post("/comunicador/api", {
      data: { acao: "grupo", nome: "Prazos", privada: true },
    })
  ).json();
  const r = await page.request.post("/comunicador/api", {
    data: {
      acao: "tarefa",
      conversaId: id,
      titulo: "Prazo teste",
      responsavelId: d.usuario,
      copias: [lia],
      prazo: "2026-09-25T10:01:00+09:00",
    },
  });
  expect(r.ok()).toBeTruthy();
  const tarefa = await r.json();
  await relogio(page, "2026-09-25T10:02:00+09:00");
  await page.request.get("/comunicador/api");
  await page.request.get("/comunicador/api");
  const { pushes } = await (await page.request.get("/test/push")).json();
  expect(
    pushes.filter(
      (p: { chave: string }) => p.chave === `tarefa:${tarefa.id}:vencida`,
    ),
  ).toHaveLength(2);
});
