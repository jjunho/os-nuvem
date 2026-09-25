import { expect, test, type Page } from "@playwright/test";
import { entrarComo, novaViagem, reiniciar, escolherOpcao } from "./apoio";
async function abrir(page: Page) {
  await reiniciar(page);
  await entrarComo(page, "Carlos");
  await novaViagem(page, { contato: "Revisão do orçamento" });
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Salvar orçamento", exact: true }),
  ).toBeVisible();
}
const salvar = (page: Page) =>
  page.getByRole("button", { name: "Salvar orçamento", exact: true });
function porta() {
  let liberar!: () => void;
  const espera = new Promise<void>((r) => {
    liberar = r;
  });
  return { espera, liberar };
}

test("erro de gravação mantém envio bloqueado e sucesso tardio preserva nova edição", async ({
  page,
}) => {
  await abrir(page);
  const guia = page.getByTestId("linha-guia");
  await guia.getByLabel("Valor unitário USD").fill("300");
  await salvar(page).click();
  await expect(page.getByRole("alert")).toContainText(
    "Informe o motivo do ajuste",
  );
  await expect(
    page.getByRole("button", { name: "Registrar envio", exact: true }),
  ).toBeDisabled();
  await guia.getByLabel("Motivo do ajuste").fill("Tarifa acordada");
  const recebeu = porta(),
    resposta = porta();
  await page.route("**/orcamentos/*.data*", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    recebeu.liberar();
    await resposta.espera;
    await route.fulfill({ response });
  });
  await page.getByLabel("Manhã", { exact: true }).fill("Enviado A");
  await salvar(page).click();
  await recebeu.espera;
  await page.getByLabel("Manhã", { exact: true }).fill("Edição B");
  resposta.liberar();
  await expect(salvar(page)).toBeEnabled();
  await expect(page.getByLabel("Manhã", { exact: true })).toHaveValue(
    "Edição B",
  );
  await expect(
    page.getByRole("button", { name: "Registrar envio", exact: true }),
  ).toBeDisabled();
  await page.unroute("**/orcamentos/*.data*");
  await salvar(page).click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page.reload();
  await expect(page.getByLabel("Manhã", { exact: true })).toHaveValue(
    "Edição B",
  );
});

test("editar pedido invalida prévia inclusive resposta atrasada; confirmar exige draft salvo", async ({
  page,
}) => {
  await abrir(page);
  const texto = page.getByLabel("Pedido do cliente", { exact: true });
  await texto.fill("2026-11-01 2 pagantes Seul");
  await page
    .getByRole("button", { name: "Preparar rascunho", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Revisão do pedido" }),
  ).toBeVisible();
  await texto.fill("2026-11-02 7 pagantes Busan");
  await expect(
    page.getByRole("button", { name: "Confirmar pedido", exact: true }),
  ).toHaveCount(0);
  const recebeu = porta(),
    resposta = porta();
  await page.route("**/orcamentos/*.data*", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    recebeu.liberar();
    await resposta.espera;
    await route.fulfill({ response });
  });
  await page
    .getByRole("button", { name: "Preparar rascunho", exact: true })
    .click();
  await recebeu.espera;
  await texto.fill("2026-11-03 3 pagantes Jeju");
  resposta.liberar();
  await expect(
    page.getByRole("button", { name: "Preparar rascunho", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Confirmar pedido", exact: true }),
  ).toHaveCount(0);
  await page.unroute("**/orcamentos/*.data*");
  await page
    .getByLabel("Incluso", { exact: true })
    .fill("Condição local preservada");
  await page
    .getByRole("button", { name: "Preparar rascunho", exact: true })
    .click();
  const confirmar = page.getByRole("button", {
    name: "Confirmar pedido",
    exact: true,
  });
  await expect(confirmar).toBeDisabled();
  await salvar(page).click();
  await expect(confirmar).toBeEnabled();
  const confirmou = porta(),
    liberarConfirmacao = porta();
  await page.route("**/orcamentos/*.data*", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    confirmou.liberar();
    await liberarConfirmacao.espera;
    await route.fulfill({ response });
  });
  await confirmar.click();
  await confirmou.espera;
  await expect(page.getByLabel("Incluso", { exact: true })).toBeDisabled();
  await expect(salvar(page)).toBeDisabled();
  liberarConfirmacao.liberar();
  await expect(page.getByRole("status")).toHaveText("Pedido confirmado");
  await expect(page.getByLabel("Pagantes", { exact: true })).toHaveValue("3");
  await expect(page.getByLabel("Incluso", { exact: true })).toHaveValue(
    "Condição local preservada",
  );
});

test("revalidação externa não associa revisão nova ao draft antigo", async ({
  page,
  context,
}) => {
  await abrir(page);
  const revisao = await page.locator('input[name="revisao"]').inputValue();
  const outra = await context.newPage();
  await outra.goto(page.url());
  await page.getByLabel("Manhã", { exact: true }).fill("Draft local");
  await outra
    .getByLabel("Manhã", { exact: true })
    .fill("Salvo por outra sessão");
  await salvar(outra).click();
  await expect(outra.getByRole("status")).toHaveText("Orçamento salvo");
  const envioAntigo = await page.request.post(page.url(), {
    form: {
      intent: "enviar",
      revisao,
      destinatario: "Contato",
      canal: "WhatsApp",
    },
  });
  expect(envioAntigo.status()).toBe(409);
  await page
    .getByLabel("Pedido do cliente", { exact: true })
    .fill("2026-11-01 2 pagantes Seul");
  await page
    .getByRole("button", { name: "Preparar rascunho", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("O orçamento mudou");
  await expect(salvar(page)).toBeDisabled();
  await expect(page.getByLabel("Manhã", { exact: true })).toHaveValue(
    "Draft local",
  );
  await page.reload();
  await expect(page.getByLabel("Manhã", { exact: true })).toHaveValue(
    "Salvo por outra sessão",
  );
  await outra.close();
});

test("nova versão reinicia identidade/revisão e cópia trata HTTP e clipboard", async ({
  page,
}) => {
  await abrir(page);
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("2");
  await salvar(page).click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page.getByLabel("Manhã", { exact: true }).fill("Memória persistida");
  await salvar(page).click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page
    .getByRole("button", { name: "Registrar envio", exact: true })
    .click();
  await expect(
    page.getByText("Versão congelada", { exact: true }),
  ).toBeVisible();
  await page.route("**/propostas/*?formato=texto", (route) =>
    route.fulfill({ status: 500, body: "erro" }),
  );
  const copiar = page.getByRole("button", {
    name: "Copiar resumo B2B",
    exact: true,
  });
  await copiar.click();
  await expect(page.getByRole("alert")).toHaveText(
    "Não foi possível copiar. Tente novamente.",
  );
  await expect(page.getByText("Texto copiado", { exact: true })).toHaveCount(0);
  await page.unroute("**/propostas/*?formato=texto");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("negado");
        },
      },
    }),
  );
  await copiar.click();
  await expect(page.getByRole("alert")).toHaveText(
    "Não foi possível copiar. Tente novamente.",
  );
  await page
    .getByRole("button", { name: "Iniciar nova versão", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: /Versão 2/ })).toBeVisible();
  await page.getByLabel("Manhã", { exact: true }).fill("Segunda versão");
  await salvar(page).click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page.reload();
  await expect(page.getByLabel("Manhã", { exact: true })).toHaveValue(
    "Segunda versão",
  );
});

test("Excel invalida prévia ao selecionar arquivo e ignora revisão atrasada", async ({
  page,
}) => {
  await abrir(page);
  await salvar(page).click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Exportar Excel", exact: true }).click();
  const caminho = await (await downloadPromise).path();
  expect(caminho).not.toBeNull();
  const arquivo = page.getByLabel("Arquivo Excel");
  await arquivo.setInputFiles(caminho!);
  const revisar = page.getByRole("button", {
    name: "Revisar importação",
    exact: true,
  });
  await revisar.click();
  await expect(
    page.getByRole("button", { name: "Aplicar importação", exact: true }),
  ).toBeVisible();
  await arquivo.setInputFiles([]);
  await expect(
    page.getByRole("button", { name: "Aplicar importação", exact: true }),
  ).toHaveCount(0);
  await arquivo.setInputFiles(caminho!);
  const recebeu = porta(),
    resposta = porta();
  await page.route("**/orcamentos/*.data*", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    recebeu.liberar();
    await resposta.espera;
    await route.fulfill({ response });
  });
  await revisar.click();
  await recebeu.espera;
  await arquivo.setInputFiles({
    name: "outro.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from("outro arquivo"),
  });
  resposta.liberar();
  await expect(revisar).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Aplicar importação", exact: true }),
  ).toHaveCount(0);
});

test("contrato rejeita intent/draft inválidos e repetição de envio após resultado desconhecido", async ({
  page,
}) => {
  await abrir(page);
  const url = page.url();
  const revisaoInicial = await page
    .locator('input[name="revisao"]')
    .inputValue();
  for (const form of [
    { intent: "atualizar-refencias", revisao: revisaoInicial, dados: "{}" },
    {
      intent: "salvar",
      revisao: revisaoInicial,
      dados: JSON.stringify({ categoria: 7, diaInicial: 1, opcoes: [] }),
    },
    { intent: "salvar", revisao: "1e2", dados: "{}" },
  ]) {
    const resposta = await page.request.post(url, { form });
    expect(resposta.status()).toBe(400);
  }
  await page.reload();
  await expect(page.locator('input[name="revisao"]')).toHaveValue(
    revisaoInicial,
  );
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("2");
  await salvar(page).click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  const revisao = await page.locator('input[name="revisao"]').inputValue();
  const form = {
    intent: "enviar",
    revisao,
    destinatario: "Cliente",
    canal: "WhatsApp",
  };
  // The first response is deliberately not used to update this page, as when the acknowledgement is lost.
  expect((await page.request.post(url, { form })).ok()).toBe(true);
  expect((await page.request.post(url, { form })).status()).toBe(409);
  const reenvio = { ...form, revisao: String(Number(revisao) + 1) };
  expect((await page.request.post(url, { form: reenvio })).ok()).toBe(true);
  expect((await page.request.post(url, { form: reenvio })).status()).toBe(409);
  await page.reload();
  await expect(
    page.getByText("Versão congelada", { exact: true }),
  ).toBeVisible();
});

test("preparação de pedido é independente de salvamento pendente", async ({
  page,
}) => {
  await abrir(page);
  await page.getByLabel("Manhã", { exact: true }).fill("Salvar A");
  const recebeu = porta(),
    resposta = porta();
  await page.route("**/orcamentos/*.data*", async (route) => {
    if (
      route.request().method() !== "POST" ||
      !route.request().postData()?.includes("intent=salvar")
    ) {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    recebeu.liberar();
    await resposta.espera;
    await route.fulfill({ response });
  });
  await salvar(page).click();
  await recebeu.espera;
  await page
    .getByLabel("Pedido do cliente", { exact: true })
    .fill("2026-11-01 2 pagantes Seul");
  await page
    .getByRole("button", { name: "Preparar rascunho", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Revisão do pedido" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirmar pedido", exact: true }),
  ).toBeDisabled();
  resposta.liberar();
  await expect(salvar(page)).toBeEnabled();
});
