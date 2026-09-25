import { expect, test } from "@playwright/test";
import pg from "pg";
import { DATABASE_URL_TEST } from "../../playwright.config";
import { entrarComo, reiniciar } from "./apoio";

test("Conversa da tarefa mantém participantes, comentários e atividade sem avisos duplicados", async ({
  page,
  browser,
}) => {
  await reiniciar(page);
  await entrarComo(page, "carlos");
  const db = new pg.Pool({ connectionString: DATABASE_URL_TEST });
  const ctx = await browser.newContext();
  const lia = await ctx.newPage();
  try {
    const perfil = await (await page.request.get("/comunicador/api")).json();
    const responsavel = perfil.usuarios.find(
      (u: { nome: string }) => u.nome === "Lia",
    );
    const copia = perfil.usuarios.find(
      (u: { nome: string }) => u.nome === "Jessica",
    );
    const criada = await page.request.post("/tarefas", {
      form: {
        titulo: "Conversa única da tarefa",
        responsavelId: String(responsavel.id),
        prazo: "2026-09-30T10:00",
        copias: String(copia.id),
      },
    });
    expect(criada.ok()).toBeTruthy();
    const {
      rows: [tarefa],
    } = await db.query("select id from tarefas where titulo=$1", [
      "Conversa única da tarefa",
    ]);
    const {
      rows: [conversa],
    } = await db.query("select id from conversas where chave=$1", [
      `tarefa:${tarefa.id}`,
    ]);
    expect(conversa.id).toBeTruthy();
    await page.goto(`/tarefas/${tarefa.id}`);
    await page
      .getByRole("link", { name: "Conversa da tarefa", exact: true })
      .click();
    await expect(page.locator(".mensagens")).toContainText("Tarefa criada");
    await entrarComo(lia, "lia");
    const conteudo = async () =>
      await (
        await lia.request.get(`/comunicador/api?conversa=${conversa.id}`)
      ).json();
    const contagem = async () =>
      (await (await lia.request.get("/comunicador/api")).json()).conversas.find(
        (c: { id: number }) => c.id === conversa.id,
      ).nao_lidas;
    expect(await contagem()).toBe(0);
    const enviar = (texto: string, clientId = crypto.randomUUID()) =>
      page.request.post("/comunicador/api", {
        data: { acao: "enviar", conversaId: conversa.id, clientId, texto },
      });
    const clientId = crypto.randomUUID();
    expect((await enviar("Comentário da equipe", clientId)).ok()).toBeTruthy();
    await enviar("Comentário da equipe", clientId);
    expect(await contagem()).toBe(1);
    expect(
      (await conteudo()).mensagens.filter(
        (m: { sistema: boolean }) => !m.sistema,
      ),
    ).toHaveLength(1);
    expect(
      (
        await db.query(
          "select id from notificacoes where chave like 'mensagem:%'",
        )
      ).rowCount,
    ).toBe(0);
    await enviar("@Lia precisamos confirmar");
    expect(
      (
        await db.query(
          "select id from notificacoes where chave like 'mensagem:%' and usuario_id=$1",
          [responsavel.id],
        )
      ).rowCount,
    ).toBe(1);
    await page.request.post(`/tarefas/${tarefa.id}`, {
      form: { intent: "concluir" },
    });
    await page.request.post(`/tarefas/${tarefa.id}`, {
      form: { intent: "concluir" },
    });
    const atividade = (await conteudo()).mensagens.filter(
      (m: { atividade_tipo: string }) => m.atividade_tipo === "concluida",
    );
    expect(atividade).toHaveLength(1);
    expect(atividade[0].autor).toBe("Carlos");
    expect(await contagem()).toBe(2);
    expect(
      (
        await page.request.post("/comunicador/api", {
          data: {
            acao: "editar",
            mensagemId: atividade[0].id,
            texto: "Apagar histórico",
          },
        })
      ).status(),
    ).toBe(403);
    // Real database participant changes must immediately revoke all public readers and writers.
    await db.query("update tarefas set responsavel_id=$2 where id=$1", [
      tarefa.id,
      copia.id,
    ]);
    await db.query(
      "delete from tarefas_copias where tarefa_id=$1 and usuario_id=$2",
      [tarefa.id, responsavel.id],
    );
    expect(
      (
        await lia.request.get(`/comunicador/api?conversa=${conversa.id}`)
      ).status(),
    ).toBe(403);
    expect(
      (
        await lia.request.post("/comunicador/api", {
          data: {
            acao: "enviar",
            conversaId: conversa.id,
            clientId: crypto.randomUUID(),
            texto: "Sem acesso",
          },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await (
          await lia.request.get("/comunicador/api?busca=Comentário")
        ).json()
      ).resultados,
    ).toHaveLength(0);
    expect(
      (await page.request.get(`/comunicador/api?conversa=${conversa.id}`)).ok(),
    ).toBeTruthy();
    expect(
      (
        await db.query("select id from conversas where chave=$1", [
          `tarefa:${tarefa.id}`,
        ])
      ).rowCount,
    ).toBe(1);
  } finally {
    await ctx.close();
    await db.end();
  }
});
