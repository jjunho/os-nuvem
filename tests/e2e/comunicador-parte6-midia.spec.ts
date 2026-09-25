import { test, expect } from "@playwright/test";
import { reiniciar, entrarComo, novaViagem, relogio } from "./apoio";
test("foto protegida, purge definitivo e áudio com transcrição posterior", async ({
  page,
  browser,
}) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  const ctx = await browser.newContext(),
    lia = await ctx.newPage();
  await entrarComo(lia, "lia");
  const { id } = await (
    await page.request.post("/comunicador/api", {
      data: { acao: "grupo", nome: "Mídia", privada: true },
    })
  ).json();
  const upload = await page.request.post("/comunicador/midia", {
    multipart: {
      conversaId: String(id),
      clientId: crypto.randomUUID(),
      arquivo: {
        name: "foto.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aEtYAAAAASUVORK5CYII=",
          "base64",
        ),
      },
    },
  });
  expect(upload.ok()).toBeTruthy();
  const m = await upload.json();
  expect(
    (await page.request.get(`/comunicador/midia/${m.midiaId}`)).ok(),
  ).toBeTruthy();
  expect(
    (await lia.request.get(`/comunicador/midia/${m.midiaId}`)).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post("/comunicador/api", {
        data: { acao: "purgar", midiaId: m.midiaId },
      })
    ).ok(),
  ).toBeTruthy();
  expect(
    (await page.request.get(`/comunicador/midia/${m.midiaId}`)).status(),
  ).toBe(410);
  const audio = await page.request.post("/comunicador/midia", {
    multipart: {
      conversaId: String(id),
      clientId: crypto.randomUUID(),
      arquivo: {
        name: "voz.wav",
        mimeType: "audio/wav",
        buffer: Buffer.from(
          "524946462400000057415645666d74201000000001000100401f0000803e0000020010006461746100000000",
          "hex",
        ),
      },
    },
  });
  expect(audio.ok()).toBeTruthy();
  let d = await (
    await page.request.get(`/comunicador/api?conversa=${id}`)
  ).json();
  expect(d.mensagens.at(-1).transcricao).toBe("");
  await page.request.post("/test/transcricao", {
    data: { texto: "Encontramos o motorista 김", processar: true },
  });
  d = await (
    await page.request.get("/comunicador/api?busca=Encontramos")
  ).json();
  expect(d.resultados).toHaveLength(1);
  await ctx.close();
});

test("foto movida vira documento do Viajante e deixa marcador no Comunicador", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  await novaViagem(page, {
    contato: "Arquivo viajante",
    telefone: "11912223333",
  });
  const viagemId = Number(page.url().split("/").at(-1));
  await page.request.post(`/viagens/${viagemId}`, {
    form: { intent: "viajante-adicionar" },
  });
  const vs = await (
    await page.request.get(`/comunicador/api?viajantes=&viagemId=${viagemId}`)
  ).json();
  const viajanteId = vs.resultados[0].id;
  const { id } = await (
    await page.request.post("/comunicador/api", {
      data: { acao: "grupo", nome: "Documentos", privada: true },
    })
  ).json();
  const upload = await page.request.post("/comunicador/midia", {
    multipart: {
      conversaId: String(id),
      clientId: crypto.randomUUID(),
      arquivo: {
        name: "foto.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aEtYAAAAASUVORK5CYII=",
          "base64",
        ),
      },
    },
  });
  const { midiaId } = await upload.json();
  expect(
    (
      await page.request.post("/comunicador/api", {
        data: { acao: "mover", midiaId, viajanteId },
      })
    ).ok(),
  ).toBeTruthy();
  const d = await (
    await page.request.get(`/comunicador/api?conversa=${id}`)
  ).json();
  expect(d.mensagens[0].midia.movida).toBeTruthy();
  await page.goto(`/viagens/${viagemId}`);
  await page.getByText("Documentos do Viajante", { exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Abrir documento" }),
  ).toBeVisible();
});

test("áudio continua disponível após falha e a transcrição retenta depois", async ({
  page,
}) => {
  await reiniciar(page);
  await relogio(page, "2026-09-25T10:00:00+09:00");
  await entrarComo(page, "carlos");
  const { id } = await (
    await page.request.post("/comunicador/api", {
      data: { acao: "grupo", nome: "Áudio", privada: true },
    })
  ).json();
  const r = await page.request.post("/comunicador/midia", {
    multipart: {
      conversaId: String(id),
      clientId: crypto.randomUUID(),
      arquivo: {
        name: "voz.wav",
        mimeType: "audio/wav",
        buffer: Buffer.from(
          "524946462400000057415645666d74201000000001000100401f0000803e0000020010006461746100000000",
          "hex",
        ),
      },
    },
  });
  const m = await r.json();
  await page.request.post("/test/transcricao", {
    data: { falhar: true, processar: true },
  });
  expect(
    (await page.request.get(`/comunicador/midia/${m.midiaId}`)).ok(),
  ).toBeTruthy();
  expect(
    (await (await page.request.get(`/comunicador/api?conversa=${id}`)).json())
      .mensagens[0].transcricao,
  ).toBe("");
  await relogio(page, "2026-09-25T10:00:31+09:00");
  await page.request.post("/test/transcricao", {
    data: { falhar: false, processar: true, texto: "Guia chegou agora" },
  });
  expect(
    (await (await page.request.get("/comunicador/api?busca=chegou")).json())
      .resultados,
  ).toHaveLength(1);
});
