import { pool } from "~/db/client.server";
import type { Cartao } from "~/modules/comunicador/cartao";

/** A shared, reader-authorized projection for Pipeline and conversation references. */
export async function cartoesViagem(
  ids: number[],
  u: { id: number; papel: string },
): Promise<Cartao[]> {
  if (u.papel === "guiamento" || !ids.length) return [];
  const podePreco = ["admin", "propostas", "faturamento"].includes(u.papel);
  const { rows } = await pool.query<{
    id: number;
    codigo: string;
    etapa: string;
    nome: string | null;
    preco?: number | null;
  }>(
    `select v.id,v.codigo,v.etapa,
    (select c.nome from viagem_contatos vc join contatos c on c.id=vc.contato_id where vc.viagem_id=v.id order by vc.papel limit 1) as nome
    ${podePreco ? ", (select preco_acordado from aceites where viagem_id=v.id and anulado_em is null order by id desc limit 1) as preco" : ""}
    from viagens v where v.id=any($1::int[])`,
    [ids],
  );
  return rows.map((v) => ({
    referencia: `/viagens/${v.id}`,
    titulo: `${v.codigo} · ${v.nome ?? ""}`,
    estado: v.etapa,
    url: `/viagens/${v.id}`,
    ...(v.preco != null ? { preco: v.preco } : {}),
  }));
}

export async function cartaoViagem(
  ref: string,
  u: { id: number; papel: string },
): Promise<Cartao> {
  const base: Cartao = { referencia: ref, titulo: "Acesso restrito" };
  if (u.papel === "guiamento") return base;
  const id = /^\/viagens\/(\d+)$/.exec(ref)?.[1];
  const {
    rows: [v],
  } = await pool.query<{ id: number }>(
    "select id from viagens where codigo=$1 or id=$2",
    [ref, Number(id) || null],
  );
  if (!v) return base;
  const [cartao] = await cartoesViagem([v.id], u);
  return cartao ? { ...cartao, referencia: ref } : base;
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
