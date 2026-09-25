import { test, expect } from "@playwright/test";
import { reiniciar, entrarComo } from "./apoio";

test("conversa direta única, envio ao vivo e acesso restrito", async ({
  page,
  browser,
}) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  const context = await browser.newContext();
  const lia = await context.newPage();
  await entrarComo(lia, "lia");
  await page.getByRole("button", { name: "Comunicador", exact: true }).click();
  await page.getByLabel("Conversa direta").selectOption({ label: "Lia" });
  await page.getByRole("button", { name: "Iniciar conversa" }).click();
  await lia.getByRole("button", { name: "Comunicador", exact: true }).click();
  await lia
    .getByRole("button", { name: /Carlos/ })
    .last()
    .click();
  await page.getByLabel("Mensagem", { exact: true }).fill("Olá Lia 안녕하세요");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(
    lia.getByText("Olá Lia 안녕하세요", { exact: true }),
  ).toBeVisible();
  const list = await (await page.request.get("/comunicador/api")).json();
  const id = list.conversas[0].id;
  const repeat = await page.request.post("/comunicador/api", {
    data: {
      acao: "direta",
      usuarioId: list.usuarios.find((u: { nome: string }) => u.nome === "Lia")
        .id,
    },
  });
  expect((await repeat.json()).id).toBe(id);
  const outsider = await browser.newContext();
  const jessica = await outsider.newPage();
  await entrarComo(jessica, "jessica");
  expect(
    (await jessica.request.get(`/comunicador/api?conversa=${id}`)).status(),
  ).toBe(403);
  expect(
    (
      await jessica.request.post("/comunicador/api", {
        data: {
          acao: "enviar",
          conversaId: id,
          clientId: crypto.randomUUID(),
          texto: "intrusão",
        },
      })
    ).status(),
  ).toBe(403);
  await context.close();
  await outsider.close();
});

test("grupos privados, edição auditável, exclusão e supervisão", async ({
  page,
  browser,
}) => {
  await reiniciar(page);
  await entrarComo(page, "lia");
  const ctx = await browser.newContext(),
    admin = await ctx.newPage();
  await entrarComo(admin, "carlos");
  const post = (data: object) =>
    page.request.post("/comunicador/api", { data });
  const r = await post({
    acao: "grupo",
    nome: "Equipe Seul",
    descricao: "Coordenação",
    privada: true,
  });
  expect(r.ok()).toBeTruthy();
  const { id } = await r.json();
  const sent = await post({
    acao: "enviar",
    conversaId: id,
    clientId: crypto.randomUUID(),
    texto: "Hotel 한강",
  });
  const m = await sent.json();
  expect(
    (
      await post({ acao: "editar", mensagemId: m.id, texto: "Hotel 서울" })
    ).ok(),
  ).toBeTruthy();
  let history = await (
    await admin.request.get(`/comunicador/api?conversa=${id}`)
  ).json();
  expect(history.mensagens[0].versoes[0].texto).toBe("Hotel 한강");
  expect(
    (
      await admin.request.post("/comunicador/api", {
        data: { acao: "editar", mensagemId: m.id, texto: "Não autorizado" },
      })
    ).status(),
  ).toBe(403);
  expect((await post({ acao: "apagar", mensagemId: m.id })).ok()).toBeTruthy();
  history = await (
    await page.request.get(`/comunicador/api?conversa=${id}`)
  ).json();
  expect(history.mensagens[0].texto).toBe("");
  expect(history.mensagens[0].versoes).toEqual([]);
  history = await (
    await admin.request.get(`/comunicador/api?conversa=${id}`)
  ).json();
  expect(history.mensagens[0].texto).toBe("Hotel 서울");
  expect(
    (
      await post({
        acao: "grupo-editar",
        conversaId: id,
        nome: "Equipe Seul",
        descricao: "Fim",
        privada: true,
        arquivada: true,
      })
    ).ok(),
  ).toBeTruthy();
  expect(
    (
      await post({
        acao: "enviar",
        conversaId: id,
        clientId: crypto.randomUUID(),
        texto: "Bloqueado",
      })
    ).status(),
  ).toBe(400);
  await ctx.close();
});

test("edições concorrentes não esgotam o pool de conexões", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  const post = (data: object) =>
    page.request.post("/comunicador/api", { data, timeout: 10000 });
  const { id } = await (
    await post({ acao: "grupo", nome: "Concorrência", privada: false })
  ).json();
  const ids: number[] = [];
  for (let n = 0; n < 12; n++)
    ids.push(
      (
        await (
          await post({
            acao: "enviar",
            conversaId: id,
            clientId: crypto.randomUUID(),
            texto: `Original ${n}`,
          })
        ).json()
      ).id,
    );
  const resultados = await Promise.all(
    ids.map((mensagemId) =>
      post({ acao: "editar", mensagemId, texto: "Atualizada" }),
    ),
  );
  expect(resultados.every((r) => r.ok())).toBeTruthy();
  expect((await page.request.get("/comunicador/api")).ok()).toBeTruthy();
});
