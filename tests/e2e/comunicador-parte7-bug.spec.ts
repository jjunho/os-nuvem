import { test, expect } from "@playwright/test";
import { reiniciar, entrarComo, novaViagem } from "./apoio";
test("/bug conserva contexto e anexa captura da página", async ({ page }) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  await novaViagem(page, { contato: "Bug teste", telefone: "1133312345" });
  const viagemUrl = page.url();
  await page.getByRole("button", { name: "Comunicador", exact: true }).click();
  await page.getByLabel("Conversa direta").selectOption({ label: "Lia" });
  await page.getByRole("button", { name: "Iniciar conversa" }).click();
  await page.getByLabel("Mensagem", { exact: true }).fill("/bug");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(page.getByLabel("Página", { exact: true })).toHaveValue(
    viagemUrl,
  );
  for (const campo of ["Ação", "Esperado", "Observado", "Reprodução"])
    await page.getByLabel(campo, { exact: true }).fill("Teste " + campo);
  await page.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(
    page.getByRole("img", { name: "Foto", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Esperado: Teste Esperado/)).toBeVisible();
});

test("/bug abre a conversa interna materializada antes de enfileirar a captura", async ({ page }) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  await novaViagem(page, { contato: "Bug interno" });
  const viagemUrl = new URL(page.url());
  const viagemId = Number(viagemUrl.pathname.split("/").at(-1));
  if (!Number.isSafeInteger(viagemId) || viagemId < 1)
    throw new Error("ID da viagem ausente");
  viagemUrl.searchParams.set("interna", String(viagemId));
  await page.goto(viagemUrl.href);
  await expect(
    page.getByRole("heading", { name: "Conversa interna", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Mensagem", { exact: true }).fill("/bug");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  for (const campo of ["Ação", "Esperado", "Observado", "Reprodução"])
    await page.getByLabel(campo, { exact: true }).fill("Teste interno");
  await page.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(
    page.getByRole("img", { name: "Foto", exact: true }),
  ).toBeVisible();
  const lista = await (await page.request.get("/comunicador/api")).json();
  const conversa = lista.conversas.find(
    (item: { tipo: string; viagem_id: number }) =>
      item.tipo === "interna" && item.viagem_id === viagemId,
  );
  if (!conversa) throw new Error("Conversa interna não materializada");
  await expect(
    page.locator(".comunicador nav button[aria-pressed=true]"),
  ).toContainText(conversa.nome);
});
