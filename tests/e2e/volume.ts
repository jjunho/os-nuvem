import { expect, type APIRequestContext } from "@playwright/test";
import pg from "pg";
import { DATABASE_URL_TEST } from "./ambiente";

const VIAGENS = 5000;

export async function semearVolume(request: APIRequestContext) {
  expect((await request.post("/test/reset")).ok()).toBe(true);
  const pool = new pg.Pool({ connectionString: DATABASE_URL_TEST });
  await pool.query(`
    insert into contatos (numero, nome, telefone, email)
    select numero_cliente(2020 + (g-1)/999), 'Contato ' || g, '5511' || lpad(g::text, 8, '0'), 'c' || g || '@exemplo.com'
    from generate_series(1, ${VIAGENS}) g;
    insert into viagens (codigo, etapa, canal_comercial, marca, origem, criada_em)
    select 'V26-' || lpad(g::text, 4, '0'),
           (array['lead','em_orcamento','proposta_enviada','confirmada','concluida'])[1 + g % 5]::etapa,
           (array['agencia','cliente_final','operadora'])[1 + g % 3]::canal_comercial,
           'corealux', 'site', timestamptz '2026-01-01' + (g || ' hours')::interval
    from generate_series(1, ${VIAGENS}) g;
    insert into sequencias_identificador(chave,valor) values ('viagem:2026',5000) on conflict(chave) do update set valor=greatest(sequencias_identificador.valor,5000);
    insert into viagem_contatos (viagem_id, contato_id, papel) select g, g, 'solicitante' from generate_series(1, ${VIAGENS}) g;
    insert into responsaveis (viagem_id, usuario_id, desde) select g, 1 + g % 4, timestamptz '2026-01-01' from generate_series(1, ${VIAGENS}) g;
    insert into tarefas (viagem_id, tipo, titulo, responsavel_id, prazo)
    select g, 'responder', 'Responder o primeiro contato', 1 + g % 4, timestamptz '2026-01-01' + (g || ' hours')::interval
    from generate_series(1, ${VIAGENS}) g;
    analyze;
  `);
  await pool.end();
}
