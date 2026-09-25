import type { Pool, PoolClient } from "pg";
import { pool } from "~/db/client.server";
import type { Conversa, Usuario } from "./tipos";
export function restrito(): never {
  throw new Response("Acesso restrito", { status: 403 });
}
export function invalido(texto = "Dados inválidos"): never {
  throw new Response(texto, { status: 400 });
}
export async function podeLer(
  u: Usuario,
  id: number,
  cliente: Pool | PoolClient = pool,
) {
  const { rows } = await cliente.query<Conversa>(
    `select c.* from conversas c where c.id=$1 and
    (c.tipo <> 'interna' or $3 <> 'guiamento') and ($3='admin' or (c.tipo='interna' and $3<>'guiamento') or exists
    (select 1 from membros_conversa m where m.conversa_id=c.id and m.usuario_id=$2))`,
    [id, u.id, u.papel],
  );
  return rows[0] ?? null;
}
export async function exigirConversa(
  u: Usuario,
  id: number,
  escrever = false,
  cliente: Pool | PoolClient = pool,
) {
  const c = await podeLer(u, id, cliente);
  if (!c) restrito();
  if (escrever && c.arquivada) invalido("Conversa arquivada");
  return c;
}
