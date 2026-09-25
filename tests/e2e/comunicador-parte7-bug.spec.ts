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
