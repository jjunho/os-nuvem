import { pool } from "~/db/client.server";
import { detalheTarefa } from "./tarefas.server";
import type { Cartao } from "~/modules/comunicador/cartao";
export async function cartaoTarefa(
  ref: string,
  u: { id: number; papel: string },
): Promise<Cartao> {
  const id = Number(ref.replace(/^TAR-/, "").replace(/^\/tarefas\//, ""));
  try {
    const d = await detalheTarefa(u, id);
    return {
      referencia: ref,
      titulo: `${d.tarefa.codigo} · ${d.tarefa.titulo}`,
      url: `/tarefas/${id}`,
      estado: d.tarefa.estado,
      prazo: d.tarefa.prazo.toISOString(),
      responsavel: d.responsavel,
      tarefaId: id,
      manual: d.tarefa.tipo === "manual",
    };
  } catch (e) {
    if (e instanceof Response && e.status === 403)
      return { referencia: ref, titulo: "Acesso restrito" };
    throw e;
  }
}
export async function buscarCartoesTarefa(
  q: string,
  u: { id: number; papel: string },
) {
  return (
    await pool.query<{ referencia: string; titulo: string }>(
      `select codigo as referencia,titulo from tarefas t where titulo ilike $1 and ($3<>'guiamento' or responsavel_id=$2 or exists(select 1 from tarefas_copias c where c.tarefa_id=t.id and c.usuario_id=$2)) limit 15`,
      ["%" + q.replace(/[\\%_]/g, "\\$&") + "%", u.id, u.papel],
    )
  ).rows;
}
