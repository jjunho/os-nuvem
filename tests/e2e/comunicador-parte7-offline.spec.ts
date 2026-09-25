import { test, expect } from "@playwright/test";
import { reiniciar, entrarComo } from "./apoio";
test("caixa de saída persistente envia em ordem após reconectar", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  await page.getByRole("button", { name: "Comunicador", exact: true }).click();
  await page.getByLabel("Conversa direta").selectOption({ label: "Lia" });
  await page.getByRole("button", { name: "Iniciar conversa" }).click();
  await expect(page.locator(".comunicador nav button[aria-pressed=true]")).toContainText("Lia");
  await page.context().setOffline(true);
  for (const texto of [
    "offline primeiro",
    "offline segundo",
    "offline terceiro",
  ]) {
    await page.getByLabel("Mensagem", { exact: true }).fill(texto);
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
  }
  await expect(page.getByText("Pendente", { exact: true })).toHaveCount(3);
  await page.context().setOffline(false);
  await expect(page.getByText("Pendente", { exact: true })).toHaveCount(0);
  const list = await (await page.request.get("/comunicador/api")).json();
  const d = await (
    await page.request.get(`/comunicador/api?conversa=${list.conversas[0].id}`)
  ).json();
  expect(d.mensagens.map((m: { texto: string }) => m.texto)).toEqual([
    "offline primeiro",
    "offline segundo",
    "offline terceiro",
  ]);
});

test("reabre instalado sem rede com a conversa e saída preservadas", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  await page.goto("/comunicador");
  await page.getByLabel("Conversa direta").selectOption({ label: "Lia" });
  await page.getByRole("button", { name: "Iniciar conversa" }).click();
  await expect(page.locator(".comunicador nav button[aria-pressed=true]")).toContainText("Lia");
  await page.getByLabel("Mensagem", { exact: true }).fill("Conversa em cache");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(
    page.getByText("Conversa em cache", { exact: true }),
  ).toBeVisible();
  const lista = await (await page.request.get("/comunicador/api")).json();
  const conversaId = lista.conversas.find((conversa: { nome: string }) => conversa.nome === "Lia")?.id;
  if (!conversaId) throw new Error("Conversa direta não encontrada");
  await expect.poll(async () => {
    const dados = await (await page.request.get(`/comunicador/api?conversa=${conversaId}`)).json();
    return dados.mensagens.some((mensagem: { texto: string }) => mensagem.texto === "Conversa em cache");
  }).toBe(true);
  await expect(page.getByText("Pendente", { exact: true })).toHaveCount(0);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(
    page.getByText("Conversa em cache", { exact: true }),
  ).toBeVisible();
  await page.context().setOffline(true);
  await page
    .getByLabel("Mensagem", { exact: true })
    .fill("Preservada na reabertura");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(page.getByText("Pendente", { exact: true })).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByText("Conversa em cache", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Preservada na reabertura", { exact: true }),
  ).toBeVisible();
  await page.context().setOffline(false);
  await expect(page.getByText("Pendente", { exact: true })).toHaveCount(0);
});
