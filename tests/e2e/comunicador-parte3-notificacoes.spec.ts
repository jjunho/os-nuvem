import { test, expect } from "@playwright/test";
import { reiniciar, entrarComo, relogio } from "./apoio";
test("menções, DND e urgência com autorização no servidor", async ({
  page,
  browser,
}) => {
  await reiniciar(page);
  await relogio(page, "2026-09-25T23:00:00+09:00");
  await entrarComo(page, "carlos");
  const ctx = await browser.newContext(),
    lia = await ctx.newPage();
  await entrarComo(lia, "lia");
  const users = (await (await page.request.get("/comunicador/api")).json())
    .usuarios;
  const liaId = users.find((u: { nome: string }) => u.nome === "Lia").id;
  const { id } = await (
    await page.request.post("/comunicador/api", {
      data: { acao: "grupo", nome: "Operações", privada: false },
    })
  ).json();
  await lia.request.post("/comunicador/api", {
    data: { acao: "entrar", conversaId: id },
  });
  await lia.request.post("/comunicador/api", {
    data: {
      acao: "preferencias",
      dndInicio: "22:00",
      dndFim: "07:00",
      fuso: "Asia/Seoul",
    },
  });
  const send = (texto: string) =>
    page.request.post("/comunicador/api", {
      data: {
        acao: "enviar",
        conversaId: id,
        clientId: crypto.randomUUID(),
        texto,
      },
    });
  await send("@Lia amanhã");
  expect(
    (await (await page.request.get("/test/push")).json()).pushes.filter(
      (p: { usuarioId: number }) => p.usuarioId === liaId,
    ),
  ).toHaveLength(0);
  const r = await send("/urgente @Lia agora");
  expect(r.ok()).toBeTruthy();
  const pushes = (await (await page.request.get("/test/push")).json()).pushes;
  expect(
    pushes.some(
      (p: { usuarioId: number; url: string }) =>
        p.usuarioId === liaId && p.url.includes("mensagem="),
    ),
  ).toBeTruthy();
  expect(
    (
      await lia.request.post("/comunicador/api", {
        data: {
          acao: "enviar",
          conversaId: id,
          clientId: crypto.randomUUID(),
          texto: "/urgente indevido",
        },
      })
    ).status(),
  ).toBe(403);
  await ctx.close();
});
