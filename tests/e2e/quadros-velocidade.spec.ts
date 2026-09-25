import { expect, test } from "@playwright/test";
import pg from "pg";
import { DATABASE_URL_TEST } from "./ambiente";
import { entrarComo, reiniciar, relogio, T0 } from "./apoio";

// ADR-0003: browser-visible latency, real authorization, persistence and SSE.
test("30 mil Tarefas, 300 Quadros e 600 Viagens respeitam os limites", async ({
  page,
  browser,
}) => {
  test.setTimeout(120000);
  await reiniciar(page);
  const banco = new pg.Pool({ connectionString: DATABASE_URL_TEST });
  let quadroId = 0,
    listaId = 0,
    tarefaId = 0;
  try {
    await banco.query(`
      insert into usuarios(nome,email,senha_hash,papel)
      select 'Volume '||n,'quadros-volume-'||n||'@example.invalid',senha_hash,'conteudo'
      from generate_series(1,30) n cross join (select senha_hash from usuarios where email='carlos@corealux.com') u;
      insert into quadros(nome,criador_id) select 'Quadro volume '||n,1 from generate_series(1,300) n;
      insert into quadros_membros(quadro_id,usuario_id)
      select q.id,u.id from quadros q cross join usuarios u where not q.pessoal and u.papel<>'guiamento';
      insert into quadros_listas(quadro_id,nome,posicao)
      select q.id,l.nome,l.posicao from quadros q cross join (values ('Novo',1),('Em foco',2),('Concluído',3)) l(nome,posicao) where not q.pessoal;
      insert into viagens(codigo,etapa,canal_comercial,marca,origem,criada_em)
      select 'V26-'||lpad(n::text,4,'0'),'lead','cliente_final','guia_na_coreia','site',timestamptz '2026-09-24 09:00:00+09' from generate_series(1,600) n;
      insert into contatos(numero,nome) select numero_cliente(2026),'Cliente volume '||n from generate_series(1,600) n;
      insert into viagem_contatos(viagem_id,contato_id,papel) select id,id,'solicitante' from viagens;
      insert into responsaveis(viagem_id,usuario_id,desde) select id,1,timestamptz '2026-09-24 09:00:00+09' from viagens;
      insert into tarefas(titulo,tipo,responsavel_id,prazo,viagem_id)
      select 'Tarefa volume '||n,'manual',1+(n%2),timestamptz '2026-10-01 09:00:00+09',1+(n%600) from generate_series(1,30000) n;
      update tarefas_posicoes p set quadro_id=q.id,lista_id=l.id
      from tarefas t join quadros q on q.nome='Quadro volume '||(1+((split_part(t.titulo,' ',3)::int-1)%300))
      join quadros_listas l on l.quadro_id=q.id and l.nome='Novo' where p.tarefa_id=t.id;
      insert into sequencias_identificador(chave,valor) values('viagem:2026',600) on conflict(chave) do update set valor=600;
      analyze;
    `);
    const {
      rows: [dados],
    } = await banco.query<{ quadro: number; lista: number; tarefa: number }>(`
      select q.id as quadro,l.id as lista,t.id as tarefa from quadros q
      join quadros_listas l on l.quadro_id=q.id and l.nome='Em foco'
      join tarefas t on t.titulo='Tarefa volume 1' where q.nome='Quadro volume 1'`);
    quadroId = dados.quadro;
    listaId = dados.lista;
    tarefaId = dados.tarefa;
  } finally {
    await banco.end();
  }

  const ctx = await browser.newContext(),
    outra = await ctx.newPage();
  try {
    await relogio(page, T0);
    await relogio(outra, T0);
    await entrarComo(page, "Carlos");
    await entrarComo(outra, "Lia");
    for (const usuario of [page, outra]) {
      for (const url of [
        `/quadros/${quadroId}.data`,
        "/_.data?visualizacao=kanban",
      ]) {
        expect((await usuario.request.get(url)).ok()).toBeTruthy();
        const inicio = performance.now();
        const resposta = await usuario.request.get(url);
        expect(resposta.ok()).toBeTruthy();
        await resposta.body();
        expect(performance.now() - inicio, `leitura ${url}`).toBeLessThan(100);
      }
    }
    await page.goto("/quadros");
    const navegar = async (nome: string, seletor: string) =>
      page.evaluate(
        async ({ nome, seletor }) => {
          const link = [...document.querySelectorAll("a")].find(
            (a) => a.textContent?.trim() === nome,
          );
          if (!link) throw new Error(`Link ausente: ${nome}`);
          const inicio = performance.now();
          link.click();
          await new Promise<void>((resolve) => {
            const verificar = () =>
              document.querySelector(seletor)
                ? resolve()
                : requestAnimationFrame(verificar);
            verificar();
          });
          return performance.now() - inicio;
        },
        { nome, seletor },
      );
    expect(
      await navegar("Quadro volume 1", ".quadro-tarefa"),
      "abrir Quadro",
    ).toBeLessThan(300);
    expect(
      await navegar("Pipeline", "tbody tr"),
      "abrir Pipeline",
    ).toBeLessThan(300);
    expect(
      await navegar("Kanban", ".pipeline-cartao"),
      "abrir Pipeline kanban",
    ).toBeLessThan(300);
    await expect(page.getByTestId("pipeline-cartao")).toHaveCount(50);
    await page.goto(`/quadros/${quadroId}`);
    await outra.goto(`/quadros/${quadroId}`);
    const destino = `[data-testid="lista-${listaId}"] a[href="/tarefas/${tarefaId}"]`;
    await expect(page.locator(`a[href="/tarefas/${tarefaId}"]`)).toBeVisible();
    await expect(outra.locator(destino)).toHaveCount(0);
    const [remoto, local] = await Promise.all([
      outra.evaluate(async (seletor) => {
        await new Promise<void>((resolve) => {
          const verificar = () =>
            document.querySelector(seletor)
              ? resolve()
              : requestAnimationFrame(verificar);
          verificar();
        });
        return Date.now();
      }, destino),
      page.evaluate(
        async ({ tarefaId, listaId, destino }) => {
          const origem = document
            .querySelector(`a[href="/tarefas/${tarefaId}"]`)!
            .closest("article")!;
          const alvo = document.querySelector(
            `[data-testid="lista-${listaId}"]`,
          )!;
          const transferencia = new DataTransfer();
          const inicio = Date.now();
          origem.dispatchEvent(
            new DragEvent("dragstart", {
              bubbles: true,
              dataTransfer: transferencia,
            }),
          );
          alvo.dispatchEvent(
            new DragEvent("drop", {
              bubbles: true,
              cancelable: true,
              dataTransfer: transferencia,
            }),
          );
          await new Promise<void>((resolve) => {
            const verificar = () =>
              document.querySelector(destino)
                ? resolve()
                : requestAnimationFrame(verificar);
            verificar();
          });
          return { inicio, decorrido: Date.now() - inicio };
        },
        { tarefaId, listaId, destino },
      ),
    ]);
    expect(local.decorrido, "movimento local").toBeLessThan(100);
    expect(remoto - local.inicio, "movimento recebido por SSE").toBeLessThan(
      300,
    );
    await page.reload();
    await expect(page.locator(destino)).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await outra.getByRole("button", { name: "Sair", exact: true }).click();
    await entrarComo(outra, "Jessica");
    expect((await outra.request.get(`/quadros/${quadroId}`)).status()).toBe(
      403,
    );
    expect((await outra.request.get("/?visualizacao=kanban")).status()).toBe(
      403,
    );
  } finally {
    await ctx.close();
    await page.request.post("/test/reset");
  }
});
