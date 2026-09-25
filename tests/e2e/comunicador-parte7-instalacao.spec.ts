import { test, expect } from "@playwright/test";
import { reiniciar, entrarComo } from "./apoio";
test("orientação de instalação iOS e aviso vistos uma vez", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();
  await reiniciar(page);
  await entrarComo(page, "carlos");
  await expect(
    page.getByText(/No Safari, toque em Compartilhar/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Entendi", exact: true }).click();
  await page.reload();
  await expect(page.getByText(/O Admin pode ler todas/)).toHaveCount(0);
  expect((await page.request.get("/manifest.webmanifest")).ok()).toBeTruthy();
  await page.getByLabel("Idioma da interface").selectOption("ko");
  await page.getByRole("button", { name: "소통", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "소통", exact: true }),
  ).toBeVisible();
  await ctx.close();
});
