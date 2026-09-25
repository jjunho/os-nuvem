import { randomUUID } from "node:crypto";
import { pool } from "~/db/client.server";
import {
  exigirConversa,
  analisarMensagem,
  invalido,
  publicar,
  restrito,
  type Usuario,
  type Conversa,
} from "./comunicador.server";
export async function grupo(u: Usuario, d: Record<string, unknown>) {
  if (u.papel === "guiamento") restrito();
  const nome = String(d.nome ?? "").trim(),
    descricao = String(d.descricao ?? "");
  if (!nome || nome.length > 120 || descricao.length > 2000) invalido();
  const tx = await pool.connect();
  try {
    await tx.query("begin");
    const {
      rows: [c],
    } = await tx.query<{ id: number }>(
      `insert into conversas(chave,tipo,nome,descricao,privada,criador_id) values($1,'grupo',$2,$3,$4,$5) returning id`,
      [randomUUID(), nome, descricao, d.privada !== false, u.id],
    );
    await tx.query(
      "insert into membros_conversa(conversa_id,usuario_id) values($1,$2)",
      [c.id, u.id],
    );
    await tx.query("commit");
    publicar(c.id);
    return c;
  } catch (e) {
    await tx.query("rollback");
    throw e;
  } finally {
    tx.release();
  }
}
export async function gerirGrupo(u: Usuario, d: Record<string, unknown>) {
  const id = Number(d.conversaId),
    acao = d.acao;
  const tx = await pool.connect();
  try {
    await tx.query("begin");
    const {
      rows: [c],
    } = await tx.query<Conversa>(
      "select * from conversas where id=$1 for update",
      [id],
    );
    if (!c || c.tipo !== "grupo") restrito();
    const gestor = u.papel === "admin" || u.id === c.criador_id;
    if (acao === "entrar") {
      if (c.privada || c.arquivada || u.papel === "guiamento") restrito();
      await tx.query(
        "insert into membros_conversa(conversa_id,usuario_id) values($1,$2) on conflict do nothing",
        [id, u.id],
      );
    } else if (acao === "sair") {
      await tx.query(
        "delete from membros_conversa where conversa_id=$1 and usuario_id=$2",
        [id, u.id],
      );
    } else {
      if (!gestor) restrito();
      if (acao === "grupo-editar") {
        const nome = String(d.nome ?? "").trim();
        if (!nome || nome.length > 120) invalido();
        await tx.query(
          "update conversas set nome=$2,descricao=$3,privada=$4,arquivada=$5 where id=$1",
          [
            id,
            nome,
            String(d.descricao ?? ""),
            d.privada !== false,
            d.arquivada === true,
          ],
        );
      } else if (acao === "convidar") {
        const pessoa = Number(d.usuarioId);
        if (
          !(
            await tx.query("select id from usuarios where id=$1 and ativo", [
              pessoa,
            ])
          ).rowCount
        )
          invalido();
        await tx.query(
          "insert into membros_conversa(conversa_id,usuario_id) values($1,$2) on conflict do nothing",
          [id, pessoa],
        );
      } else if (acao === "remover")
        await tx.query(
          "delete from membros_conversa where conversa_id=$1 and usuario_id=$2",
          [id, Number(d.usuarioId)],
        );
      else invalido();
    }
    await tx.query("commit");
    publicar(0);
    return { ok: true };
  } catch (e) {
    await tx.query("rollback");
    throw e;
  } finally {
    tx.release();
  }
}
export async function mudarMensagem(
  u: Usuario,
  d: Record<string, unknown>,
  agora: Date,
  origem: string,
) {
  const id = Number(d.mensagemId);
  const tx = await pool.connect();
  try {
    await tx.query("begin");
    const {
      rows: [m],
    } = await tx.query<{
      autor_id: number;
      conversa_id: number;
      apagada: boolean;
      texto: string;
    }>("select * from mensagens where id=$1 for update", [id]);
    if (!m) restrito();
    await exigirConversa(u, m.conversa_id, true, tx);
    if (d.acao === "editar") {
      if (m.autor_id !== u.id) restrito();
      if (m.apagada) invalido();
      const texto = String(d.texto ?? "");
      if (!texto.trim() || texto.length > 20000) invalido();
      const { segmentos, urgente } = await analisarMensagem(
        u,
        texto,
        origem,
        tx,
      );
      await tx.query(
        `update mensagens set versoes=versoes || $2::jsonb,texto=$3,segmentos=$4,urgente=$5 where id=$1`,
        [
          id,
          JSON.stringify([{ texto: m.texto, em: agora.toISOString() }]),
          texto,
          JSON.stringify(segmentos),
          urgente,
        ],
      );
    } else if (d.acao === "apagar") {
      if (m.autor_id !== u.id && u.papel !== "admin") restrito();
      await tx.query("update mensagens set apagada=true where id=$1", [id]);
    } else if (d.acao === "reagir") {
      const emoji = String(d.emoji ?? "");
      if (!["👍", "❤️", "✅", "👀", "🙏", "😊"].includes(emoji) || m.apagada)
        invalido();
      await tx.query(
        "insert into reacoes_mensagem(mensagem_id,usuario_id,emoji) values($1,$2,$3) on conflict do nothing",
        [id, u.id, emoji],
      );
    } else invalido();
    await tx.query("commit");
    publicar(m.conversa_id);
    return { ok: true };
  } catch (e) {
    await tx.query("rollback");
    throw e;
  } finally {
    tx.release();
  }
}
