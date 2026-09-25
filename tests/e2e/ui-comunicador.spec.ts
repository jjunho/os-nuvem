import { test, expect, type Page, type Route } from "@playwright/test";
import { entrarComo, reiniciar } from "./apoio";

async function preparar(page: Page) {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  const dados = await (await page.request.get("/comunicador/api")).json();
  const criar = async (nome: string) => {
    const { id } = await (
      await page.request.post("/comunicador/api", {
        data: {
          acao: "direta",
          usuarioId: dados.usuarios.find(
            (u: { nome: string }) => u.nome === nome,
          ).id,
        },
      })
    ).json();
    const msg = await (
      await page.request.post("/comunicador/api", {
        data: {
          acao: "enviar",
          conversaId: id,
          texto: `Original ${nome}`,
          clientId: crypto.randomUUID(),
        },
      })
    ).json();
    return { id, mensagemId: msg.id };
  };
  const a = await criar("Lia"),
    b = await criar("Jessica");
  await page.goto(`/comunicador?conversa=${a.id}`);
  await expect(page.locator(`#mensagem-${a.mensagemId}`)).toBeVisible();
  return { a, b };
}
const navegar = (page: Page, nome: string) =>
  page
    .locator(".comunicador nav")
    .getByRole("button", { name: new RegExp(nome) })
    .click();

// Mantém o transporte real; só controla a ordem de chegada das respostas.
function barreira() {
  let liberar!: () => void;
  const espera = new Promise<void>((r) => {
    liberar = r;
  });
  return { espera, liberar };
}

test("troca de conversa cancela edição e citação da conversa anterior", async ({
  page,
}) => {
  const { a, b } = await preparar(page);
  await page
    .locator(`#mensagem-${a.mensagemId}`)
    .getByRole("button", { name: "Editar", exact: true })
    .click();
  await navegar(page, "Jessica");
  await expect(page.locator(`#mensagem-${b.mensagemId}`)).toBeVisible();
  await expect(page.getByLabel("Mensagem", { exact: true })).toHaveValue("");
  await page.getByLabel("Mensagem", { exact: true }).fill("Nova para Jessica");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(
    page.getByText("Nova para Jessica", { exact: true }),
  ).toBeVisible();
  const dados = await (
    await page.request.get(`/comunicador/api?conversa=${a.id}`)
  ).json();
  expect(
    dados.mensagens.find((m: { id: number }) => m.id === a.mensagemId).texto,
  ).toBe("Original Lia");
  await navegar(page, "Lia");
  await page
    .locator(`#mensagem-${a.mensagemId}`)
    .getByRole("button", { name: "Citar", exact: true })
    .click();
  await navegar(page, "Jessica");
  await expect(page.getByRole("button", { name: /Cancelar #/ })).toHaveCount(0);
});

test("página antiga e erro de abertura não contaminam a seleção nova", async ({
  page,
}) => {
  const { a, b } = await preparar(page);
  const iniciou = barreira(),
    atrasada = barreira();
  await page.route(
    `**/comunicador/api?conversa=${a.id}&antes=*`,
    async (route) => {
      const resposta = await route.fetch();
      iniciou.liberar();
      await atrasada.espera;
      await route.fulfill({
        response: resposta,
        json: {
          ...(await resposta.json()),
          mensagens: [
            {
              ...(
                await (
                  await page.request.get(`/comunicador/api?conversa=${a.id}`)
                ).json()
              ).mensagens[0],
            },
          ],
        },
      });
    },
  );
  await page.getByRole("button", { name: "Mensagens anteriores" }).click();
  await iniciou.espera;
  await navegar(page, "Jessica");
  await expect(page.locator(`#mensagem-${b.mensagemId}`)).toBeVisible();
  atrasada.liberar();
  await expect(page.locator(`#mensagem-${a.mensagemId}`)).toHaveCount(0);
  const erroIniciou = barreira(),
    erro = barreira();
  await page.route(
    `**/comunicador/api?conversa=${a.id}&inicial=1`,
    async (route) => {
      erroIniciou.liberar();
      await erro.espera;
      await route.fulfill({
        status: 403,
        body: "Resposta da conversa anterior",
      });
    },
  );
  await navegar(page, "Lia");
  await erroIniciou.espera;
  await navegar(page, "Jessica");
  await expect(page.locator(`#mensagem-${b.mensagemId}`)).toBeVisible();
  erro.liberar();
  await expect(page.locator(`#mensagem-${b.mensagemId}`)).toBeVisible();
  await expect(
    page.getByText("Resposta da conversa anterior", { exact: false }),
  ).toHaveCount(0);
});

test("falha de edição conserva rascunho e sucesso antigo não navega para trás", async ({
  page,
}) => {
  const { a, b } = await preparar(page);
  const editar = page
    .locator(`#mensagem-${a.mensagemId}`)
    .getByRole("button", { name: "Editar", exact: true });
  await editar.click();
  await page
    .getByLabel("Mensagem", { exact: true })
    .fill("Rascunho preservado");
  let falhar = true;
  const iniciou = barreira(),
    atrasada = barreira();
  await page.route("**/comunicador/api", async (route: Route) => {
    if (
      route.request().method() !== "POST" ||
      route.request().postDataJSON()?.acao !== "editar"
    )
      return route.continue();
    if (falhar) return route.fulfill({ status: 500, body: "Falha simulada" });
    const resposta = await route.fetch();
    iniciou.liberar();
    await atrasada.espera;
    await route.fulfill({ response: resposta });
  });
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Falha simulada" }),
  ).toBeVisible();
  await expect(page.getByLabel("Mensagem", { exact: true })).toHaveValue(
    "Rascunho preservado",
  );
  falhar = false;
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await iniciou.espera;
  await navegar(page, "Jessica");
  await expect(page.locator(`#mensagem-${b.mensagemId}`)).toBeVisible();
  await page.getByLabel("Mensagem", { exact: true }).fill("Rascunho novo");
  atrasada.liberar();
  await expect(page.getByLabel("Mensagem", { exact: true })).toHaveValue(
    "Rascunho novo",
  );
  await expect(
    page.locator(".comunicador nav button[aria-pressed=true]"),
  ).toContainText("Jessica");
});

test("dois submits de reporte produzem uma única saída", async ({ page }) => {
  const { a } = await preparar(page);
  await page.getByLabel("Mensagem", { exact: true }).fill("/bug");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  for (const campo of ["Ação", "Esperado", "Observado", "Reprodução"])
    await page.getByLabel(campo, { exact: true }).fill("Reporte único");
  await expect(
    page.getByRole("button", { name: "Enviar reporte" }),
  ).toBeEnabled();
  await page
    .getByRole("form", { name: "Reportar problema" })
    .evaluate((form) => {
      (form as HTMLFormElement).requestSubmit();
      (form as HTMLFormElement).requestSubmit();
    });
  await expect(
    page.getByRole("form", { name: "Reportar problema" }),
  ).toHaveCount(0);
  await expect
    .poll(async () => {
      const d = await (
        await page.request.get(`/comunicador/api?conversa=${a.id}`)
      ).json();
      return d.mensagens.filter((m: { texto: string }) =>
        m.texto.includes("Ação: Reporte único"),
      ).length;
    })
    .toBe(1);
});

test("mensagem recebida durante abertura lenta é sincronizada após o snapshot inicial", async ({
  page,
}) => {
  const { a } = await preparar(page);
  await navegar(page, "Jessica");
  const iniciou = barreira(),
    abrir = barreira();
  await page.route(
    `**/comunicador/api?conversa=${a.id}&inicial=1`,
    async (route) => {
      const resposta = await route.fetch();
      iniciou.liberar();
      await abrir.espera;
      await route.fulfill({ response: resposta });
    },
  );
  await navegar(page, "Lia");
  await iniciou.espera;
  const atualizou = page.waitForResponse(
    (r) =>
      r.url().endsWith("/comunicador/api") && r.request().method() === "GET",
  );
  await page.request.post("/comunicador/api", {
    data: {
      acao: "enviar",
      conversaId: a.id,
      texto: "Chegou durante abertura",
      clientId: crypto.randomUUID(),
    },
  });
  await atualizou;
  abrir.liberar();
  await expect(
    page.getByText("Chegou durante abertura", { exact: true }),
  ).toBeVisible();
});

test("selecionar a mesma conversa preserva a edição em andamento", async ({
  page,
}) => {
  const { a } = await preparar(page);
  await page
    .locator(`#mensagem-${a.mensagemId}`)
    .getByRole("button", { name: "Editar", exact: true })
    .click();
  await page
    .getByLabel("Mensagem", { exact: true })
    .fill("Rascunho ainda local");
  await navegar(page, "Lia");
  await expect(page.getByLabel("Mensagem", { exact: true })).toHaveValue(
    "Rascunho ainda local",
  );
  await expect(
    page.getByRole("button", {
      name: `Cancelar #${a.mensagemId}`,
      exact: true,
    }),
  ).toBeVisible();
});

for (const respostaPerdida of ["json inválido", "erro 503"])
  test(`confirmação perdida (${respostaPerdida}) mantém a saída e repete a mesma identidade`, async ({
    page,
  }) => {
    const { a } = await preparar(page);
    const clientes: string[] = [];
    await page.route("**/comunicador/api", async (route) => {
      if (
        route.request().method() !== "POST" ||
        route.request().postDataJSON()?.acao !== "enviar"
      )
        return route.continue();
      clientes.push(route.request().postDataJSON().clientId);
      const resposta = await route.fetch();
      if (clientes.length === 1)
        return respostaPerdida === "json inválido"
          ? route.fulfill({ status: 200, json: { ok: true } })
          : route.fulfill({
              status: 503,
              body: "Resposta perdida após commit",
            });
      await route.fulfill({ response: resposta });
    });
    await page
      .getByLabel("Mensagem", { exact: true })
      .fill("Confirmação perdida");
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    await expect.poll(() => clientes.length, { timeout: 15000 }).toBe(2);
    expect(new Set(clientes).size).toBe(1);
    await expect
      .poll(async () =>
        page.evaluate(async () => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const r = indexedDB.open("corealux-comunicador", 1);
            r.onsuccess = () => resolve(r.result);
            r.onerror = () => reject(r.error);
          });
          const total = await new Promise<number>((resolve) => {
            const r = db.transaction("fila").objectStore("fila").count();
            r.onsuccess = () => resolve(r.result);
          });
          db.close();
          return total;
        }),
      )
      .toBe(0);
    const d = await (
      await page.request.get(`/comunicador/api?conversa=${a.id}`)
    ).json();
    expect(
      d.mensagens.filter(
        (m: { texto: string }) => m.texto === "Confirmação perdida",
      ),
    ).toHaveLength(1);
  });

test("API rejeita envelope e identidade inválidos antes de executar envio", async ({
  page,
}) => {
  const { a } = await preparar(page);
  for (const data of [
    null,
    [],
    { acao: "interna", viagemId: 1, texto: {}, clientId: crypto.randomUUID() },
    {
      acao: "enviar",
      conversaId: a.id + 0.5,
      texto: "Inválida",
      clientId: crypto.randomUUID(),
    },
  ]) {
    const r = await page.request.post("/comunicador/api", {
      data,
      headers: { "Content-Type": "application/json" },
    });
    expect(r.status()).toBe(400);
  }
});

test("trocar conversa aborta a leitura antiga e preserva a seleção nova", async ({
  page,
}) => {
  const { a, b } = await preparar(page);
  await navegar(page, "Jessica");
  await page.evaluate(() => {
    const original = window.fetch;
    window.fetch = (input, init) => {
      if (init?.signal)
        init.signal.addEventListener(
          "abort",
          () => {
            document.documentElement.dataset.leituraAbortada = String(input);
          },
          { once: true },
        );
      return original(input, init);
    };
  });
  const iniciou = barreira(),
    liberar = barreira();
  await page.route(
    `**/comunicador/api?conversa=${a.id}&inicial=1`,
    async (route) => {
      const resposta = await route.fetch();
      iniciou.liberar();
      await liberar.espera;
      await route.fulfill({ response: resposta });
    },
  );
  await navegar(page, "Lia");
  await iniciou.espera;
  await navegar(page, "Jessica");
  await expect(page.locator("html")).toHaveAttribute(
    "data-leitura-abortada",
    `/comunicador/api?conversa=${a.id}&inicial=1`,
  );
  liberar.liberar();
  await expect(page.locator(`#mensagem-${b.mensagemId}`)).toBeVisible();
});

test("dois submits síncronos de tarefa produzem uma única operação", async ({ page }) => {
  const { a } = await preparar(page);
  await page.getByLabel("Mensagem", { exact: true }).fill("/tarefa Tarefa única");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  const form = page.getByRole("form", { name: "Nova tarefa" });
  await expect(form).toBeVisible();
  await form.locator('[name="prazo"]').fill("2030-01-01T10:00");
  let chamadas = 0;
  const iniciou = barreira();
  const liberar = barreira();
  await page.route("**/comunicador/api", async (route) => {
    if (route.request().method() !== "POST" || route.request().postDataJSON()?.acao !== "tarefa")
      return route.continue();
    chamadas++;
    const resposta = await route.fetch();
    iniciou.liberar();
    await liberar.espera;
    await route.fulfill({ response: resposta });
  });
  await form.evaluate((elemento) => {
    (elemento as HTMLFormElement).requestSubmit();
    (elemento as HTMLFormElement).requestSubmit();
  });
  await iniciou.espera;
  expect(chamadas).toBe(1);
  liberar.liberar();
  await expect(form).toHaveCount(0);
  const dados = await (await page.request.get(`/comunicador/api?conversa=${a.id}`)).json();
  expect(dados.cartoes.filter((cartao: { titulo: string }) => cartao.titulo.endsWith(" · Tarefa única"))).toHaveLength(1);
});

test("recusa definitiva preserva a primeira saída e libera as demais pendentes", async ({ page }) => {
  const { a } = await preparar(page);
  let recusas = 0;
  await page.route("**/comunicador/api", async (route) => {
    const corpo = route.request().postDataJSON();
    if (route.request().method() !== "POST" || corpo?.acao !== "enviar")
      return route.continue();
    if (corpo.texto === "Primeira recusada") {
      recusas++;
      await route.fulfill({ status: 400, body: "Recusa definitiva" });
      return;
    }
    await route.continue();
  });
  const mensagem = page.getByLabel("Mensagem", { exact: true });
  await mensagem.fill("Primeira recusada");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(page.getByText("Primeira recusada", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Falhou. Tentar novamente" })).toBeVisible();
  await mensagem.fill("Segunda em espera");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(page.getByText("Segunda em espera", { exact: true })).toBeVisible();
  await expect
    .poll(async () => {
      const dados = await (
        await page.request.get(`/comunicador/api?conversa=${a.id}`)
      ).json();
      return dados.mensagens.some(
        (item: { texto: string }) => item.texto === "Segunda em espera",
      );
    })
    .toBe(true);
  // A recusa continua visível para retentativa e não é reenviada sozinha.
  await expect(page.getByRole("button", { name: "Falhou. Tentar novamente" })).toBeVisible();
  await expect(page.getByText("Primeira recusada", { exact: true })).toBeVisible();
  expect(recusas).toBe(1);
});

test("confirmação de fila não sincroniza conversa diferente da selecionada", async ({ page }) => {
  const { a, b } = await preparar(page);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false }),
  );
  const mensagem = page.getByLabel("Mensagem", { exact: true });
  await mensagem.fill("Fila da Lia");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(page.getByText("Fila da Lia", { exact: true })).toBeVisible();
  await navegar(page, "Jessica");
  await expect(page.locator(`#mensagem-${b.mensagemId}`)).toBeVisible();
  await page.evaluate(() =>
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true }),
  );
  await expect
    .poll(
      async () => {
        const dados = await (
          await page.request.get(`/comunicador/api?conversa=${a.id}`)
        ).json();
        return dados.mensagens.some(
          (item: { texto: string }) => item.texto === "Fila da Lia",
        );
      },
      { timeout: 15000 },
    )
    .toBe(true);
  await page.waitForTimeout(100);
  await expect(page.getByText("Fila da Lia", { exact: true })).toHaveCount(0);
});
