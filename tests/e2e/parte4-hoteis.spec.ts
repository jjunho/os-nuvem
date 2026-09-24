import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";
test("hotel conhecido vem preenchido, usa Booking e segurança fora da margem, e terceiro preserva endereço", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Hotel conhecido" });
  await page
    .getByRole("combobox", { name: "Hotel", exact: true })
    .fill("Hotel Busan");
  await page.getByRole("option", { name: /Outro/ }).click();
  await page
    .getByLabel("Endereço do hotel", { exact: true })
    .fill("Rua Busan 10");
  await Promise.all([
    page.waitForResponse(
      (r) => r.request().method() === "POST" && r.url().includes("/viagens/"),
    ),
    page
      .getByRole("button", { name: "Salvar planejamento", exact: true })
      .click(),
  ]);
  await expect(
    page.getByRole("combobox", { name: "Hotel", exact: true }),
  ).toHaveValue("Hotel Busan");
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Margem (%)", { exact: true }).fill("20");
  const hotel = page.getByTestId("linha-hotel");
  await expect(
    hotel.getByRole("combobox", { name: "Hotel da linha", exact: true }),
  ).toHaveValue("Hotel Busan");
  await expect(
    hotel.getByLabel("Endereço do hotel", { exact: true }),
  ).toHaveValue("Rua Busan 10");
  await hotel.getByLabel("Valor unitário USD", { exact: true }).fill("3000");
  await hotel.getByLabel("Data da cotação", { exact: true }).fill("2026-09-24");
  await expect(
    hotel.getByLabel("Fonte da cotação", { exact: true }),
  ).toHaveValue("Booking");
  await expect(page.getByTestId("preco-calculado")).toContainText("3.150,00");
  await hotel
    .getByLabel("Reservado por terceiro, sem cobrança", { exact: true })
    .check();
  await expect(page.getByTestId("preco-calculado")).toContainText("0,00");
  await expect(
    hotel.getByLabel("Endereço do hotel", { exact: true }),
  ).toHaveValue("Rua Busan 10");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
});

test("hotel filtra pela cidade e Outro reutiliza um hotel conhecido fora do contexto", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  for (const cidade of ["Seul", "Busan"]) {
    await page.goto("/viagens/nova");
    await page.getByLabel("Nome do contato").fill(`Hotel ${cidade} contato`);
    await page
      .getByRole("combobox", { name: "Cidades", exact: true })
      .fill(cidade);
    await page.getByRole("option", { name: cidade, exact: true }).click();
    await page
      .getByRole("button", { name: "Criar viagem", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Hotel", exact: true })
      .fill(`Hotel exclusivo ${cidade}`);
    await page.getByRole("option", { name: /Outro/ }).click();
    await Promise.all([
      page.waitForResponse(
        (r) => r.request().method() === "POST" && r.url().includes("/viagens/"),
      ),
      page
        .getByRole("button", { name: "Salvar planejamento", exact: true })
        .click(),
    ]);
  }
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  const hotel = page.getByRole("combobox", {
    name: "Hotel da linha",
    exact: true,
  });
  await expect(hotel).toHaveValue("Hotel exclusivo Busan");
  await hotel.fill("");
  await expect(
    page.getByRole("option", { name: "Hotel exclusivo Busan", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("option", { name: "Hotel exclusivo Seul", exact: true }),
  ).toHaveCount(0);
  await hotel.fill("Hotel exclusivo Seul");
  await page.getByRole("option", { name: /Outro/ }).click();
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page.goto("/opcoes");
  await expect(
    page.getByRole("cell", { name: "Hotel exclusivo Seul", exact: true }),
  ).toHaveCount(1);
});
