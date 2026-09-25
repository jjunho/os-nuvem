import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "~/db/schema";
import { pool } from "~/db/client.server";
import {
  criarTarefa,
  mudarEstadoTarefa,
} from "~/modules/tarefas/tarefas.server";
import { enviar } from "./comunicador.server";
import { exigirConversa, invalido, restrito } from "./acesso.server";
import { publicar } from "~/modules/notificacoes/eventos.server";
import type { Usuario } from "./tipos";
export async function interna(
  u: Usuario,
  viagemId: number,
  texto: string,
  clientId: string,
  agora: Date,
  origem: string,
) {
  if (u.papel === "guiamento") restrito();
  if (!texto?.trim() || texto.length > 20000 || !Number.isInteger(viagemId))
    invalido();
  const {
    rows: [v],
  } = await pool.query<{ codigo: string; nome: string }>(
    `select v.codigo,(select c.nome from viagem_contatos vc join contatos c on c.id=vc.contato_id where vc.viagem_id=v.id limit 1) as nome from viagens v where v.id=$1`,
    [viagemId],
  );
  if (!v) restrito();
  const tx = await pool.connect();
  let id: number;
  try {
    await tx.query("begin");
    const {
      rows: [c],
    } = await tx.query<{ id: number }>(
      `insert into conversas(chave,tipo,nome,criador_id,viagem_id) values($1,'interna',$2,$3,$4) on conflict(chave) do update set nome=excluded.nome returning id`,
      [`interna:${viagemId}`, `${v.codigo} · ${v.nome}`, u.id, viagemId],
    );
    id = c.id;
    await tx.query(
      `insert into membros_conversa(conversa_id,usuario_id) select $1,id from usuarios where ativo and papel<>'guiamento' on conflict do nothing`,
      [id],
    );
    await tx.query("commit");
  } catch (e) {
    await tx.query("rollback");
    throw e;
  } finally {
    tx.release();
  }
  return {
    ...(await enviar(u, { conversaId: id, clientId, texto }, agora, origem)),
    conversaId: id,
  };
}
export async function tarefaDaMensagem(
  u: Usuario,
  d: Record<string, unknown>,
  agora: Date,
  origem: string,
) {
  const cliente = await pool.connect();
  try {
    const tarefa = await drizzle(cliente, { schema }).transaction(
      async (tx) => {
        await cliente.query("select id from conversas where id=$1 for update", [
          Number(d.conversaId),
        ]);
        const c = await exigirConversa(u, Number(d.conversaId), true, cliente);
        const clientId = String(d.clientId ?? randomUUID());
        if (!/^[a-zA-Z0-9-]{16,80}$/.test(clientId)) invalido();
        const anterior = await cliente.query(
          "select t.*,m.conversa_id,m.autor_id from mensagens m left join tarefas t on t.codigo=m.texto where m.client_id=$1",
          [clientId],
        );
        if (anterior.rows[0]) {
          const a = anterior.rows[0];
          if (!a.id || a.conversa_id !== c.id || a.autor_id !== u.id)
            invalido();
          return a;
        }
        const fonte = Number(d.mensagemId) || undefined;
        if (
          fonte &&
          !(
            await cliente.query(
              "select id from mensagens where id=$1 and conversa_id=$2",
              [fonte, c.id],
            )
          ).rowCount
        )
          restrito();
        const viagemId = c.viagem_id || Number(d.viagemId) || null;
        if (viagemId && !c.viagem_id) {
          if (u.papel === "guiamento") restrito();
          if (
            !(
              await cliente.query("select id from viagens where id=$1", [
                viagemId,
              ])
            ).rowCount
          )
            invalido();
        }
        const f = new FormData();
        for (const k of ["titulo", "descricao", "responsavelId", "prazo"])
          f.set(k, String(d[k] ?? ""));
        if (viagemId) f.set("viagemId", String(viagemId));
        for (const copia of Array.isArray(d.copias) ? d.copias : [])
          f.append("copias", String(copia));
        const criada = await criarTarefa(u, f, agora, fonte, tx);
        await enviar(
          u,
          { conversaId: c.id, clientId, texto: criada.codigo },
          agora,
          origem,
          undefined,
          cliente,
        );
        return criada;
      },
    );
    publicar(Number(d.conversaId));
    return tarefa;
  } finally {
    cliente.release();
  }
}
export async function concluirCartao(
  u: Usuario,
  id: number,
  conversaId: number,
  agora: Date,
) {
  await exigirConversa(u, conversaId, true);
  await mudarEstadoTarefa(u, id, "concluir", "", agora);
  publicar(conversaId);
  return { ok: true };
}
