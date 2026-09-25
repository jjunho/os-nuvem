import { pool } from "~/db/client.server";
import { exigirConversa, invalido } from "./acesso.server";
import { publicar } from "~/modules/notificacoes/eventos.server";
import type { Usuario } from "./tipos";
export async function marcarLeitura(
  u: Usuario,
  id: number,
  mensagemId: number,
  naoLida = false,
) {
  await exigirConversa(u, id);
  if (
    !Number.isInteger(mensagemId) ||
    mensagemId < 1 ||
    !(
      await pool.query(
        "select id from mensagens where id=$1 and conversa_id=$2",
        [mensagemId, id],
      )
    ).rowCount
  )
    invalido();
  const { rowCount } = await pool.query(
    `insert into membros_conversa(conversa_id,usuario_id,lida_ate) values($1,$2,$3)
 on conflict(conversa_id,usuario_id) do update set lida_ate=case when $4 then excluded.lida_ate else greatest(membros_conversa.lida_ate,excluded.lida_ate) end
 where membros_conversa.lida_ate<>case when $4 then excluded.lida_ate else greatest(membros_conversa.lida_ate,excluded.lida_ate) end`,
    [id, u.id, naoLida ? mensagemId - 1 : mensagemId, naoLida],
  );
  if (rowCount) publicar(id, "leitura");
  return { ok: true };
}
export async function buscar(u: Usuario, q: URLSearchParams) {
  const termo = (q.get("busca") ?? "").trim().slice(0, 150);
  if (!termo) return { resultados: [] };
  const data = q.get("data") || null;
  if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) invalido();
  const { rows: resultados } = await pool.query(
    `select m.id,m.conversa_id,m.texto,m.transcricao,u.nome as autor,c.nome from mensagens m join conversas c on c.id=m.conversa_id join usuarios u on u.id=m.autor_id
 where (m.texto || ' ' || m.transcricao) ilike $1 and (not m.apagada or $3='admin')
 and (c.tipo<>'interna' or $3<>'guiamento') and ($3='admin' or (c.tipo='interna' and $3<>'guiamento') or exists(select 1 from membros_conversa mm where mm.conversa_id=c.id and mm.usuario_id=$2))
 and ($4::int is null or c.id=$4) and ($5::int is null or m.autor_id=$5) and ($6::date is null or (m.criada_em>=$6::date and m.criada_em<$6::date+interval '1 day'))
 order by m.id desc limit 50`,
    [
      "%" + termo.replace(/[\\%_]/g, "\\$&") + "%",
      u.id,
      u.papel,
      Number(q.get("filtroConversa")) || null,
      Number(q.get("autor")) || null,
      data,
    ],
  );
  return { resultados };
}
