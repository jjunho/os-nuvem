import { projetarTarefa } from "./cartao";
import { cartoesViagem } from "~/modules/viagens/cartoes.server";
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
    const viagem = d.tarefa.viagemId
      ? (await cartoesViagem([d.tarefa.viagemId], u))[0]
      : undefined;
    return projetarTarefa(
      { ...d.tarefa, responsavel: d.responsavel, preco: viagem?.preco },
      ref,
    );
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
      `select codigo as referencia,titulo from tarefas t where titulo ilike $1 and tarefa_visivel(t.id,$2,$3) limit 15`,
      ["%" + q.replace(/[\\%_]/g, "\\$&") + "%", u.id, u.papel],
    )
  ).rows;
}
