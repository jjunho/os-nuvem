import { expect, test } from "@playwright/test";
import ExcelJS from "exceljs";
import { entrarComo, novaViagem, reiniciar, escolherOpcao } from "./apoio";
test("exceções do orçamento ficam conhecidas e valores sem regra ficam a informar", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Exceções" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "Madrugada especial",
  );
  await expect(page.getByTestId("linha-guia")).toContainText("A informar");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page.reload();
  await page
    .getByRole("combobox", { name: "Período", exact: true })
    .fill("Madrugada");
  await expect(
    page.getByRole("option", { name: "Madrugada especial", exact: true }),
  ).toBeVisible();
});
test("margem abaixo do piso da tabela avisa Admin e memória Excel preserva viajantes", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await page.goto("/tabelas/pagamentos");
  await page.getByLabel("Valor — Margem mínima", { exact: true }).fill("0.15");
  await page
    .getByRole("button", { name: "Salvar nova versão", exact: true })
    .click();
  await expect(page.getByTestId("versao-tabela")).toHaveText("Versão 2");
  await page.goto("/viagens/nova");
  await page.getByLabel("Nome do contato").fill("Viajante congelado");
  await page.getByLabel("Viajante", { exact: true }).check();
  await page.getByRole("button", { name: "Criar viagem", exact: true }).click();
  await expect(page.getByTestId("etapa")).toBeVisible();
  const viagem = page.url();
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page
    .getByRole("button", { name: "Adicionar linha", exact: true })
    .click();
  await page
    .getByLabel("Descrição da linha", { exact: true })
    .fill("Serviço negociado");
  await page.getByLabel("Valor unitário USD", { exact: true }).fill("1000");
  await page.getByLabel("Custo real da linha USD", { exact: true }).fill("880");
  await page.getByLabel("Preço enviado USD", { exact: true }).fill("1000");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  const excel = page.url() + "/excel";
  await page
    .getByRole("button", { name: "Registrar envio", exact: true })
    .click();
  await expect(
    page.getByText("Versão congelada", { exact: true }),
  ).toBeVisible();
  const pushes = await (await page.request.get("/test/push")).json();
  expect(
    pushes.pushes.some((p: { titulo: string }) => p.titulo.includes("15%")),
  ).toBe(true);
  const ler = async () => {
    const w = new ExcelJS.Workbook();
    await w.xlsx.load(
      Uint8Array.from(await (await page.request.get(excel)).body()).buffer,
    );
    return w.worksheets.map((s) => s.getSheetValues());
  };
  const antes = await ler();
  await page.goto(viagem);
  const p = page.getByRole("table", { name: "Viajantes", exact: true });
  await p
    .getByRole("combobox", { name: "Nome", exact: true })
    .fill("Outro viajante");
  await page.getByRole("option", { name: /Outro/ }).last().click();
  await p.getByLabel("Idade", { exact: true }).fill("8");
  await p.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    p.getByRole("combobox", { name: "Nome", exact: true }),
  ).toHaveValue("Outro viajante");
  expect(await ler()).toEqual(antes);
});
