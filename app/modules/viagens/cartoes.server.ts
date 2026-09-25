import { pool } from "~/db/client.server";
import type { Cartao } from "~/modules/comunicador/cartao";
export async function cartaoViagem(
  ref: string,
  u: { id: number; papel: string },
): Promise<Cartao> {
  const base: Cartao = { referencia: ref, titulo: "Acesso restrito" };
  if (u.papel === "guiamento") return base;
  const id = /^\/viagens\/(\d+)$/.exec(ref)?.[1];
  const {
    rows: [v],
  } = await pool.query<{
    id: number;
    codigo: string;
    etapa: string;
    nome: string;
  }>(
    `select v.id,v.codigo,v.etapa,(select c.nome from viagem_contatos vc join contatos c on c.id=vc.contato_id where vc.viagem_id=v.id limit 1) as nome from viagens v where v.codigo=$1 or v.id=$2`,
    [ref, Number(id) || null],
  );
  if (!v) return base;
  const cartao: Cartao = {
    referencia: ref,
    titulo: `${v.codigo} · ${v.nome ?? ""}`,
    estado: v.etapa,
    url: `/viagens/${v.id}`,
  };
  if (["admin", "propostas", "faturamento"].includes(u.papel)) {
    const {
      rows: [a],
    } = await pool.query<{ preco_acordado: number }>(
      "select preco_acordado from aceites where viagem_id=$1 order by id desc limit 1",
      [v.id],
    );
    if (a) cartao.preco = a.preco_acordado;
  }
  return cartao;
}
export async function buscarCartoesViagem(q: string, u: { papel: string }) {
  if (u.papel === "guiamento") return [];
  return (
    await pool.query<{ viagemId: number; referencia: string; titulo: string }>(
      `select distinct v.id as "viagemId",v.codigo as referencia,v.codigo || ' · ' || c.nome as titulo from viagens v join viagem_contatos vc on vc.viagem_id=v.id join contatos c on c.id=vc.contato_id where c.nome ilike $1 or v.codigo ilike $1 limit 15`,
      ["%" + q.replace(/[\\%_]/g, "\\$&") + "%"],
    )
  ).rows;
}
