import { expect, test, type Page } from "@playwright/test";
import pg from "pg";
import { DATABASE_URL_TEST } from "../../playwright.config";
import {
  T0,
  entrarComo,
  novaViagem,
  reiniciar,
  relogio,
  escolherOpcao,
} from "./apoio";
const banco = new pg.Pool({ connectionString: DATABASE_URL_TEST });
test.afterAll(() => banco.end());
test.beforeEach(async ({ page }) => {
  await reiniciar(page);
  await relogio(page, T0);
  await entrarComo(page, "Carlos");
});
async function contato(page: Page) {
  await page
    .getByLabel("O que ocorreu", { exact: true })
    .fill("Enviei as informações por WhatsApp");
  await page
    .getByLabel("Por quê", { exact: true })
    .fill("Cliente pediu detalhes");
  await page
    .getByRole("button", { name: /^(Respondi o contato|Registrar contato)$/ })
    .click();
  await expect(
    page.getByRole("region", { name: "Histórico de etapas" }),
  ).toContainText("Enviei as informações por WhatsApp");
}
async function enviar(page: Page) {
  await page
    .getByRole("button", { name: "Criar orçamento", exact: true })
    .click();
  await escolherOpcao(
    page.getByRole("combobox", { name: "Período", exact: true }),
    "livre",
  );
  await page.getByLabel("Pagantes", { exact: true }).fill("1");
  await page
    .getByRole("button", { name: "Salvar orçamento", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Orçamento salvo");
  await page
    .getByRole("button", { name: "Registrar envio", exact: true })
    .click();
  await expect(
    page.getByText("Versão congelada", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Voltar à viagem", exact: true })
    .click();
  await expect(page.getByTestId("etapa")).toHaveText("Proposta enviada");
}
test("lead registra fato, corrige sem duplicar e mantém histórico", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Lead das etapas" });
  await expect(
    page.getByRole("link", {
      name: "Responder o primeiro contato",
      exact: true,
    }),
  ).toHaveCount(1);
  await contato(page);
  await expect(page.locator(".acoes li")).toContainText("Concluída");
  const antes = await banco.query(
    "select t.id,t.estado,e.fato_conclusivo_id from tarefas t join tarefas_etapa e on e.tarefa_id=t.id where t.tipo='responder'",
  );
  expect(antes.rows).toHaveLength(1);
  expect(antes.rows[0].fato_conclusivo_id).toBeTruthy();
  await page
    .getByLabel("Motivo da correção", { exact: true })
    .fill("Contato registrado na viagem errada");
  await page
    .getByRole("button", { name: "Corrigir fato", exact: true })
    .click();
  await expect(page.locator(".acoes li")).toContainText("Aberta");
  await page.reload();
  const depois = await banco.query(
    "select id,estado from tarefas where tipo='responder'",
  );
  expect(depois.rows).toEqual([{ id: antes.rows[0].id, estado: "aberta" }]);
  await expect(
    page.getByRole("region", { name: "Histórico de etapas" }),
  ).toContainText("Contato registrado na viagem errada");
});
test("modelo versionado conserva tarefa e destinatário nomeado ao transferir", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Antes do modelo" });
  const antiga = page.url();
  await relogio(page, "2026-09-24T10:00:00+09:00");
  await page.goto("/modelos-etapa");
  const form = page.locator("form").filter({
    has: page.getByRole("heading", {
      name: "Lead · Responder o primeiro contato",
      exact: true,
    }),
  });
  await form.getByLabel("Título", { exact: true }).fill("Acolher novo cliente");
  await form.getByLabel("Prazo relativo em horas", { exact: true }).fill("5");
  await form
    .getByLabel("Destinatário", { exact: true })
    .selectOption("usuario");
  await form
    .getByLabel("Usuário", { exact: true })
    .selectOption({ label: "Lia" });
  await form.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Lead · Acolher novo cliente" }),
  ).toBeVisible();
  await page.goto(antiga);
  await expect(
    page.getByRole("link", {
      name: "Responder o primeiro contato",
      exact: true,
    }),
  ).toBeVisible();
  await novaViagem(page, { contato: "Depois do modelo" });
  await expect(page.locator(".acoes li")).toContainText(
    "Acolher novo cliente — Lia",
  );
  await page
    .getByLabel("Responsável", { exact: true })
    .selectOption({ label: "Lidiane" });
  await page.reload();
  await expect(page.locator(".acoes li")).toContainText(
    "Acolher novo cliente — Lia",
  );
  await entrarComo(page, "Lia");
  const resposta = await page.request.post("/modelos-etapa", {
    form: {
      id: "1",
      titulo: "Inválido",
      horas: "2",
      fato: "contato",
      destinatario: "responsavel",
    },
  });
  expect(resposta.status()).toBe(403);
});
test("ciclo comercial cria tarefas por etapa, follow-ups ilimitados e resposta encerra série", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Ciclo comercial" });
  const viagem = page.url();
  await enviar(page);
  expect(
    (
      await banco.query(
        "select count(*)::int n from notificacoes where chave like 'viagem:%:etapa:%'",
      )
    ).rows[0].n,
  ).toBe(2);
  await page.reload();
  expect(
    (
      await banco.query(
        "select count(*)::int n from notificacoes where chave like 'viagem:%:etapa:%'",
      )
    ).rows[0].n,
  ).toBe(2);
  await expect(
    page.locator(".acoes li").filter({ hasText: "Enviar proposta" }),
  ).toContainText("Concluída");
  await expect(
    page.locator(".acoes li").filter({ hasText: "Pedir cotações" }),
  ).toContainText("Cancelada");
  await expect(
    page.locator(".acoes li").filter({ hasText: "Retomar proposta" }),
  ).toHaveCount(3);
  await contato(page);
  const followups = await banco.query(
    "select estado from tarefas where tipo='followup' order by prazo",
  );
  expect(followups.rows.map((r) => r.estado)).toEqual([
    "concluida",
    "aberta",
    "aberta",
  ]);
  await relogio(page, new Date(Date.parse(T0) + 12 * 86400000).toISOString());
  await entrarComo(page, "Carlos");
  await page.goto(viagem);
  await page.reload();
  await expect(
    page.locator(".acoes li").filter({ hasText: "Retomar proposta" }),
  ).toHaveCount(4);
  expect(
    (
      await banco.query(
        "select count(*)::int n from notificacoes where chave like 'sem-resposta:%'",
      )
    ).rows[0].n,
  ).toBe(2);
  await page
    .getByLabel("Resposta do cliente", { exact: true })
    .selectOption("mudancas");
  await page
    .getByRole("button", { name: "Registrar resposta do cliente", exact: true })
    .click();
  await expect(page.getByTestId("etapa")).toHaveText("Em negociação");
  await expect(
    page.getByRole("link", { name: "Enviar nova versão", exact: true }),
  ).toBeVisible();
  expect(
    (
      await banco.query(
        "select count(*)::int n from tarefas where tipo='followup' and estado='aberta'",
      )
    ).rows[0].n,
  ).toBe(0);
  await page
    .getByLabel("Motivo do descarte", { exact: true })
    .fill("Pedido encerrado");
  await page.getByRole("button", { name: "Descartar", exact: true }).click();
  await expect(page.getByTestId("etapa")).toHaveText("Descartada");
  await expect(page.locator(".acoes li").filter({hasText:"Enviar nova versão"})).toContainText("Cancelada");
  expect(
    (
      await banco.query(
        "select count(*)::int n from tarefas where tipo<>'manual' and estado='aberta'",
      )
    ).rows[0].n,
  ).toBe(0);
});

test("transversal: quadro pessoal, fatos comerciais, transferência e aceite corrigido preservam tarefas pessoais", async ({
  page,
  browser,
}) => {
  const contextoAna = await browser.newContext(),
    contextoBruno = await browser.newContext();
  const ana = await contextoAna.newPage(),
    bruno = await contextoBruno.newPage();
  try {
    await relogio(ana, T0);
    await relogio(bruno, T0);
    await entrarComo(ana, "Lia");
    await entrarComo(bruno, "Lidiane");
    await novaViagem(ana, {
      contato: "Transversal correta",
      responsavel: "Lia",
    });
    const correta = ana.url();
    await ana.goto("/quadros");
    await ana.getByRole("link", { name: "Meu Quadro", exact: true }).click();
    await expect(ana.getByTestId("lista-novo")).toContainText(
      "Responder o primeiro contato",
    );
    await ana.getByLabel("Título", { exact: true }).fill("Dentista");
    await ana
      .getByRole("button", { name: "Criar tarefa", exact: true })
      .click();
    await expect(ana.getByText(/Dentista/).first()).toBeVisible();
    const quadroAna = ana.url();
    const dados = await (await ana.request.get("/comunicador/api")).json();
    const brunoId = dados.usuarios.find(
      (u: { nome: string }) => u.nome === "Lidiane",
    ).id;
    const conversa = await (
      await ana.request.post("/comunicador/api", {
        data: { acao: "direta", usuarioId: brunoId },
      })
    ).json();
    const mensagem = await (
      await ana.request.post("/comunicador/api", {
        data: {
          acao: "enviar",
          conversaId: conversa.id,
          clientId: crypto.randomUUID(),
          texto: "Revisar informação separada da viagem",
        },
      })
    ).json();
    const tarefa = await ana.request.post("/comunicador/api", {
      data: {
        acao: "tarefa",
        conversaId: conversa.id,
        mensagemId: mensagem.id,
        titulo: "Revisar mensagem pessoal",
        responsavelId: brunoId,
        prazo: "2026-10-30T10:00:00+09:00",
      },
    });
    expect(tarefa.ok()).toBeTruthy();
    await ana.goto(correta);
    await contato(ana);
    await ana.goto(quadroAna);
    await expect(ana.getByTestId("lista-conclusao")).toContainText(
      "Responder o primeiro contato",
    );
    await ana.goto(correta);
    await page.goto("/?visualizacao=kanban");
    await enviar(ana);
    await expect(
      page
        .getByRole("region", { name: "Proposta enviada", exact: true })
        .getByTestId("pipeline-cartao")
        .filter({ hasText: "Transversal correta" }),
    ).toBeVisible();
    await ana
      .getByLabel("Resposta do cliente", { exact: true })
      .selectOption("mudancas");
    await ana
      .getByRole("button", {
        name: "Registrar resposta do cliente",
        exact: true,
      })
      .click();
    await expect(ana.getByTestId("etapa")).toHaveText("Em negociação");
    const orcamento = await banco.query(
      "select id from orcamentos where viagem_id=$1 order by id desc limit 1",
      [Number(correta.split("/").pop())],
    );
    await ana.goto(`/orcamentos/${orcamento.rows[0].id}`);
    await ana
      .getByRole("button", { name: "Iniciar nova versão", exact: true })
      .click();
    await ana
      .getByRole("button", { name: "Registrar envio", exact: true })
      .click();
    await expect(
      ana.getByText("Versão congelada", { exact: true }),
    ).toBeVisible();
    await ana
      .getByRole("link", { name: "Voltar à viagem", exact: true })
      .click();
    await ana
      .getByLabel("Responsável", { exact: true })
      .selectOption({ label: "Lidiane" });
    await expect(ana.locator(".historico")).toContainText("Lidiane");
    await bruno.goto("/quadros");
    await bruno.getByRole("link", { name: "Meu Quadro", exact: true }).click();
    await expect(
      bruno
        .getByTestId("lista-novo")
        .getByRole("link", { name: /Retomar proposta/ }),
    ).toHaveCount(3);
    await expect(
      bruno.getByText(/Revisar mensagem pessoal/).first(),
    ).toBeVisible();
    await novaViagem(bruno, {
      contato: "Transversal errada",
      responsavel: "Lidiane",
    });
    const errada = bruno.url();
    await enviar(bruno);
    await bruno.goto(`${errada}/aceite`);
    await bruno
      .getByRole("button", { name: "Confirmar aceite", exact: true })
      .click();
    await expect(bruno.getByTestId("etapa")).toHaveText("Confirmada");
    const fato = bruno
      .getByRole("region", { name: "Histórico de etapas" })
      .getByRole("listitem")
      .filter({ hasText: "Aceitou" });
    await fato
      .getByLabel("Motivo da correção")
      .fill("Aceite lançado na viagem errada");
    await fato
      .getByRole("button", { name: "Corrigir fato", exact: true })
      .click();
    await expect(bruno.getByTestId("etapa")).toHaveText("Proposta enviada");
    await bruno.goto(`${correta}/aceite`);
    await bruno
      .getByRole("button", { name: "Confirmar aceite", exact: true })
      .click();
    await expect(bruno.getByTestId("etapa")).toHaveText("Confirmada");
    await expect(
      page
        .getByRole("region", { name: "Confirmada", exact: true })
        .getByTestId("pipeline-cartao")
        .filter({ hasText: "Transversal correta" }),
    ).toBeVisible();
    await ana.goto(quadroAna);
    await expect(ana.getByTestId("lista-novo")).toContainText("Dentista");
    const pessoais = await banco.query(
      "select titulo,estado,tipo from tarefas where titulo in ('Dentista','Revisar mensagem pessoal') order by titulo",
    );
    expect(pessoais.rows).toEqual([
      { titulo: "Dentista", estado: "aberta", tipo: "manual" },
      { titulo: "Revisar mensagem pessoal", estado: "aberta", tipo: "manual" },
    ]);
  } finally {
    await contextoAna.close();
    await contextoBruno.close();
  }
});

test("corrigir o primeiro contato troca o fato conclusivo e a data sem apagar histórico", async ({
  page,
}) => {
  await novaViagem(page, { contato: "Duas notas de contato" });
  const viagem = page.url();
  await contato(page);
  const primeiro = (
    await banco.query(
      "select id from fatos_etapa where tipo='contato' order by id limit 1",
    )
  ).rows[0].id;
  await relogio(page, "2026-09-24T10:00:00+09:00");
  expect(
    (
      await page.request.post(viagem, {
        form: {
          intent: "responder",
          meioContato: "WhatsApp",
          ocorreuContato: "Segundo contato válido",
          motivoContato: "Esclarecer o pedido",
        },
      })
    ).ok(),
  ).toBeTruthy();
  expect(
    (
      await page.request.post(viagem, {
        form: {
          intent: "corrigir-etapa",
          fatoId: String(primeiro),
          motivoCorrecao: "Primeiro contato pertencia a outro cliente",
        },
      })
    ).ok(),
  ).toBeTruthy();
  const tarefa = (
    await banco.query(
      "select t.estado,t.concluida_em,e.fato_conclusivo_id,f.em from tarefas t join tarefas_etapa e on e.tarefa_id=t.id join fatos_etapa f on f.id=e.fato_conclusivo_id where t.tipo='responder'",
    )
  ).rows[0];
  expect(tarefa.estado).toBe("concluida");
  expect(tarefa.fato_conclusivo_id).not.toBe(primeiro);
  expect(tarefa.concluida_em.toISOString()).toBe("2026-09-24T01:00:00.000Z");
  expect(tarefa.concluida_em).toEqual(tarefa.em);
  expect(
    (
      await banco.query(
        "select count(*)::int n from tarefas_historico where tipo='concluida'",
      )
    ).rows[0].n,
  ).toBe(2);
  await page.reload();
  expect(
    (
      await banco.query(
        "select count(*)::int n from tarefas_historico where tipo='concluida'",
      )
    ).rows[0].n,
  ).toBe(2);
});
