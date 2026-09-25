import { test, expect } from "@playwright/test";
import { reiniciar, entrarComo } from "./apoio";
test("Guiamento só participa por convite; saída revoga leitura, busca e envio", async ({
  page,
  browser,
}) => {
  await reiniciar(page);
  await entrarComo(page, "lia");
  const ctx = await browser.newContext(),
    guia = await ctx.newPage();
  await entrarComo(guia, "jessica");
  const usuarios = (await (await page.request.get("/comunicador/api")).json())
    .usuarios;
  const guiaId = usuarios.find(
    (u: { nome: string }) => u.nome === "Jessica",
  ).id;
  const { id } = await (
    await page.request.post("/comunicador/api", {
      data: { acao: "grupo", nome: "Privado guia", privada: true },
    })
  ).json();
  expect(
    (
      await guia.request.post("/comunicador/api", {
        data: { acao: "grupo", nome: "Proibido" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (await (await guia.request.get("/comunicador/api")).json()).grupos,
  ).toHaveLength(0);
  expect(
    (
      await guia.request.post("/comunicador/api", {
        data: { acao: "entrar", conversaId: id },
      })
    ).status(),
  ).toBe(403);
  await page.request.post("/comunicador/api", {
    data: { acao: "convidar", conversaId: id, usuarioId: guiaId },
  });
  const clientId = crypto.randomUUID();
  const enviar = (texto: string) =>
    guia.request.post("/comunicador/api", {
      data: { acao: "enviar", conversaId: id, clientId, texto },
    });
  expect((await enviar("Roteiro aprovado")).ok()).toBeTruthy();
  await enviar("Outra mensagem");
  const d = await (
    await guia.request.get(`/comunicador/api?conversa=${id}`)
  ).json();
  expect(d.mensagens.map((m: { texto: string }) => m.texto)).toEqual([
    "Roteiro aprovado",
  ]);
  expect(
    (
      await guia.request.post("/comunicador/api", {
        data: { acao: "grupo-editar", conversaId: id, nome: "Indevido" },
      })
    ).status(),
  ).toBe(403);
  await guia.request.post("/comunicador/api", {
    data: { acao: "sair", conversaId: id },
  });
  expect(
    (await guia.request.get(`/comunicador/api?conversa=${id}`)).status(),
  ).toBe(403);
  expect(
    (await (await guia.request.get("/comunicador/api?busca=Roteiro")).json())
      .resultados,
  ).toHaveLength(0);
  expect((await enviar("Não entra")).status()).toBe(403);
  await ctx.close();
});
