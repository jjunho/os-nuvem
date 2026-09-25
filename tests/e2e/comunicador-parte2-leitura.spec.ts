import { test, expect } from "@playwright/test";
import { reiniciar, entrarComo } from "./apoio";
test("leitura sincronizada e busca parcial autorizada PT/KO", async ({
  page,
  browser,
}) => {
  await reiniciar(page);
  await entrarComo(page, "lia");
  const ctx = await browser.newContext(),
    outra = await ctx.newPage();
  await entrarComo(outra, "jessica");
  const usuarios = (await (await page.request.get("/comunicador/api")).json())
    .usuarios;
  const { id } = await (
    await page.request.post("/comunicador/api", {
      data: {
        acao: "direta",
        usuarioId: usuarios.find((u: { nome: string }) => u.nome === "Jessica")
          .id,
      },
    })
  ).json();
  const { id: msg } = await (
    await page.request.post("/comunicador/api", {
      data: {
        acao: "enviar",
        conversaId: id,
        clientId: crypto.randomUUID(),
        texto: "Confirmação amanhã 서울역",
      },
    })
  ).json();
  let lista = await (await outra.request.get("/comunicador/api")).json();
  expect(lista.conversas[0].nao_lidas).toBe(1);
  expect(
    (
      await outra.request.post("/comunicador/api", {
        data: { acao: "ler", conversaId: id, mensagemId: msg },
      })
    ).ok(),
  ).toBeTruthy();
  lista = await (await outra.request.get("/comunicador/api")).json();
  expect(lista.conversas[0].nao_lidas).toBe(0);
  for (const q of ["firma", "울"]) {
    const r = await (
      await outra.request.get(`/comunicador/api?busca=${encodeURIComponent(q)}`)
    ).json();
    expect(r.resultados[0].texto).toContain("서울역");
  }
  const { id: privado } = await (
    await page.request.post("/comunicador/api", {
      data: { acao: "grupo", nome: "Privado", privada: true },
    })
  ).json();
  await page.request.post("/comunicador/api", {
    data: {
      acao: "enviar",
      conversaId: privado,
      clientId: crypto.randomUUID(),
      texto: "Segredo 서울역",
    },
  });
  expect(
    (await (await outra.request.get("/comunicador/api?busca=Segredo")).json())
      .resultados,
  ).toHaveLength(0);
  await ctx.close();
});

test("reabre na primeira não lida e mantém paginação", async ({ page }) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  const list = await (await page.request.get("/comunicador/api")).json();
  const lia = list.usuarios.find((u: { nome: string }) => u.nome === "Lia").id;
  const { id } = await (
    await page.request.post("/comunicador/api", {
      data: { acao: "direta", usuarioId: lia },
    })
  ).json();
  const ids = [];
  for (let n = 0; n < 60; n++) {
    const r = await page.request.post("/comunicador/api", {
      data: {
        acao: "enviar",
        conversaId: id,
        clientId: crypto.randomUUID(),
        texto: `Mensagem ${n}`,
      },
    });
    ids.push((await r.json()).id);
  }
  await page.request.post("/comunicador/api", {
    data: { acao: "nao-lida", conversaId: id, mensagemId: ids[5] },
  });
  const d = await (
    await page.request.get(`/comunicador/api?conversa=${id}&inicial=1`)
  ).json();
  expect(d.mensagens[0].id).toBe(ids[5]);
  expect(d.mensagens).toHaveLength(50);
  const older = await (
    await page.request.get(`/comunicador/api?conversa=${id}&antes=${ids[5]}`)
  ).json();
  expect(older.mensagens).toHaveLength(5);
});

test("link de push localiza mensagem antiga, eventos preservam histórico e leitura respeita a área visível", async ({
  page,
  browser,
}) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  const ctx = await browser.newContext(),
    outra = await ctx.newPage();
  await entrarComo(outra, "lia");
  const usuarios = (await (await page.request.get("/comunicador/api")).json())
    .usuarios;
  const post = (data: object) =>
    page.request.post("/comunicador/api", { data });
  const { id } = await (
    await post({
      acao: "direta",
      usuarioId: usuarios.find((u: { nome: string }) => u.nome === "Lia").id,
    })
  ).json();
  const ids: number[] = [];
  for (let n = 0; n < 65; n++)
    ids.push(
      (
        await (
          await post({
            acao: "enviar",
            conversaId: id,
            clientId: crypto.randomUUID(),
            texto: `Histórico ${n}`,
          })
        ).json()
      ).id,
    );
  await outra.goto(`/?conversa=${id}&mensagem=${ids[2]}`);
  await expect(outra.locator(`#mensagem-${ids[2]}`)).toBeVisible();
  await expect
    .poll(async () => {
      const l = await (await outra.request.get("/comunicador/api")).json();
      return l.conversas[0].nao_lidas;
    })
    .toBeGreaterThan(40);
  await post({
    acao: "enviar",
    conversaId: id,
    clientId: crypto.randomUUID(),
    texto: "Nova depois do histórico",
  });
  await expect(
    outra.getByText("Nova depois do histórico", { exact: true }),
  ).toBeAttached();
  await expect(outra.locator(`#mensagem-${ids[2]}`)).toBeAttached();
  await expect(outra.locator(".mensagens article")).toHaveCount(66);
  // A reconexão recupera mais de uma página, sem lacunas.
  await ctx.setOffline(true);
  for (let n = 0; n < 55; n++)
    await post({
      acao: "enviar",
      conversaId: id,
      clientId: crypto.randomUUID(),
      texto: `Durante desconexão ${n}`,
    });
  await ctx.setOffline(false);
  await expect(outra.locator(".mensagens article")).toHaveCount(121, {
    timeout: 15000,
  });
  await ctx.close();
});
