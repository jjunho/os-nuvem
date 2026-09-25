import { test, expect } from "@playwright/test";
import { reiniciar, entrarComo, novaViagem } from "./apoio";
test("Interna nasce na primeira mensagem e cartão acompanha a viagem", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  const codigo = await novaViagem(page, {
    contato: "Cliente Comunicador",
    telefone: "11993331111",
  });
  const viagemId = Number(page.url().split("/").at(-1));
  const antes = await (await page.request.get("/comunicador/api")).json();
  expect(antes.conversas).toHaveLength(0);
  const r = await page.request.post("/comunicador/api", {
    data: {
      acao: "interna",
      viagemId,
      texto: `Conferir ${codigo}`,
      clientId: crypto.randomUUID(),
    },
  });
  expect(r.ok()).toBeTruthy();
  const { conversaId } = await r.json();
  const d = await (
    await page.request.get(`/comunicador/api?conversa=${conversaId}`)
  ).json();
  expect(d.conversa.nome).toContain("Cliente Comunicador");
  expect(d.cartoes[0].titulo).toContain(codigo);
  const tarefa = await page.request.post("/comunicador/api", {
    data: {
      acao: "tarefa",
      conversaId,
      mensagemId: d.mensagens[0].id,
      titulo: "Conferir hotel",
      responsavelId: antes.usuario,
      prazo: "2026-10-01T10:00",
      copias: [],
    },
  });
  expect(tarefa.ok()).toBeTruthy();
  const td = await tarefa.json();
  await page.goto(`/tarefas/${td.id}`);
  await expect(
    page.getByRole("link", { name: "Mensagem de origem" }),
  ).toBeVisible();
});

test("tarefa e cartão são atômicos, repetição é idempotente e viagem é opcional", async ({
  page,
}) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  await novaViagem(page, {
    contato: "Viagem da tarefa",
    telefone: "11911112222",
  });
  const viagemId = Number(page.url().split("/").at(-1));
  const lista = await (await page.request.get("/comunicador/api")).json();
  const post = (data: object) =>
    page.request.post("/comunicador/api", { data });
  const { id } = await (
    await post({ acao: "grupo", nome: "Tarefas", privada: false })
  ).json();
  const clientId = crypto.randomUUID();
  // A chave já usada para texto não pode deixar uma tarefa órfã ao rejeitar o cartão.
  await post({
    acao: "enviar",
    conversaId: id,
    clientId,
    texto: "Chave ocupada",
  });
  const dados = {
    acao: "tarefa",
    conversaId: id,
    clientId,
    titulo: "Uma tarefa",
    responsavelId: lista.usuario,
    prazo: "2026-10-01T10:00",
    viagemId,
  };
  expect((await post(dados)).status()).toBe(400);
  const criada = await (
    await post({ ...dados, clientId: crypto.randomUUID() })
  ).json();
  expect(criada.viagemId).toBe(viagemId);
  const chave = crypto.randomUUID();
  const respostas = await Promise.all([
    post({ ...dados, clientId: chave }),
    post({ ...dados, clientId: chave }),
  ]);
  const tarefas = await Promise.all(respostas.map((r) => r.json()));
  expect(tarefas[0].id).toBe(tarefas[1].id);
  await post({
    acao: "grupo-editar",
    conversaId: id,
    nome: "Tarefas",
    arquivada: true,
  });
  expect(
    (await post({ ...dados, clientId: crypto.randomUUID() })).status(),
  ).toBe(400);
  const conversa = await (
    await page.request.get(`/comunicador/api?conversa=${id}`)
  ).json();
  expect(
    conversa.mensagens.filter((m: { texto: string }) =>
      m.texto.startsWith("TAR-"),
    ),
  ).toHaveLength(2);
});
