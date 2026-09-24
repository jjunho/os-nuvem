import { escolherOpcao } from "./apoio";
import { expect, test } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar } from "./apoio";
test("exceções comerciais aparecem na opção e não impedem salvar", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, {
    contato: "Viagem curta",
    canal: "Agência",
    cadeia: ["Explore Travel (agencia)"],
  });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Categoria do orçamento", exact: true }),
    "vip",
  );
  await escolherOpcao(
    page.getByRole("combobox", { name: "Cidade ou trecho", exact: true }),
    "Jeju",
  );
  await escolherOpcao(
    page.getByRole("combobox", { name: "Veículo do dia", exact: true }),
    "spark",
  );
  await expect(
    page.getByText("Agência: viagem abaixo de 3 dias", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Jeju: menos de 2 dias de guia", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Carro próprio não recomendado para VIP", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
});
