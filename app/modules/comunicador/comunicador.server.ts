import { publicar } from "~/modules/notificacoes/eventos.server";
import type { Pool, PoolClient } from "pg";
import type { MidiaNova } from "./midia.server";
import { segmentar, type Segmento } from "./leitura";
import { avisarMensagem, preferencia } from "./notificacoes.server";
import { entregarPush } from "~/modules/notificacoes/push.server";
import { randomUUID } from "node:crypto";
import { pool } from "~/db/client.server";
import type { usuarios } from "~/db/schema";
export type Usuario = Omit<typeof usuarios.$inferSelect, "senhaHash">;
export type Conversa = {
  id: number;
  tipo: "direta" | "grupo" | "interna" | "equipe";
  nome: string;
  descricao: string;
  privada: boolean;
  arquivada: boolean;
  criador_id: number;
  viagem_id: number | null;
  nao_lidas: number;
  lida_ate: number;
  notificacao: string;
};
export type Mensagem = {
  id: number;
  client_id: string;
  conversa_id: number;
  autor_id: number;
  autor: string;
  ativo: boolean;
  texto: string;
  segmentos: Segmento[];
  criada_em: string;
  apagada: boolean;
  urgente: boolean;
  citada_id: number | null;
  versoes: { texto: string; em: string }[];
  transcricao: string;
  reacoes: { emoji: string; nome: string }[];
  midia: {
    id: string;
    mime: string;
    removida: boolean;
    movida: boolean;
  } | null;
};
export type Pessoa = { id: number; nome: string; papel: string };
export { eventos, publicar } from "~/modules/notificacoes/eventos.server";
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
export async function listar(u: Usuario) {
  const { rows: conversas } = await pool.query<Conversa>(
    `select c.*,m.notificacao, coalesce(m.lida_ate,0) as lida_ate,
    (select count(*)::int from mensagens x where x.conversa_id=c.id and x.id>coalesce(m.lida_ate,0)) as nao_lidas,
    case when c.tipo='direta' then coalesce((select string_agg(p.nome, ', ') from membros_conversa mm join usuarios p on p.id=mm.usuario_id where mm.conversa_id=c.id and p.id<>$1),c.nome) else c.nome end as nome
    from conversas c left join membros_conversa m on m.conversa_id=c.id and m.usuario_id=$1
    where (c.tipo<>'interna' or $2<>'guiamento') and ($2='admin' or m.usuario_id is not null or (c.tipo='interna' and $2<>'guiamento'))
    order by c.atualizada_em desc,c.id desc limit 200`,
    [u.id, u.papel],
  );
  const { rows: usuarios } = await pool.query<Pessoa>(
    "select id,nome,papel from usuarios where ativo order by nome",
  );
  const { rows: grupos } = await pool.query<Conversa>(
    `select c.* from conversas c where tipo='grupo' and not privada and not arquivada and $1<>'guiamento' order by nome limit 100`,
    [u.papel],
  );
  return {
    conversas,
    usuarios,
    grupos,
    preferencia: await preferencia(u),
    usuario: u.id,
    papel: u.papel,
  };
}
export async function direta(u: Usuario, outro: number) {
  if (!Number.isInteger(outro) || outro === u.id) invalido();
  if (
    !(
      await pool.query("select id from usuarios where id=$1 and ativo", [outro])
    ).rowCount
  )
    invalido();
  const tx = await pool.connect();
  try {
    await tx.query("begin");
    const {
      rows: [c],
    } = await tx.query<{ id: number }>(
      `insert into conversas(chave,tipo,nome,criador_id) values($1,'direta','Conversa direta',$2)
      on conflict(chave) do update set chave=excluded.chave returning id`,
      [[u.id, outro].sort((a, b) => a - b).join(":"), u.id],
    );
    await tx.query(
      "insert into membros_conversa(conversa_id,usuario_id) values($1,$2),($1,$3) on conflict do nothing",
      [c.id, u.id, outro],
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
export async function ler(u: Usuario, id: number, query: URLSearchParams) {
  const conversa = await exigirConversa(u, id);
  const antes = Number(query.get("antes")) || 2147483647;
  let depois = Number(query.get("depois")) || 0;
  let crescente = query.has("depois");
  if (query.has("inicial")) {
    const {
      rows: [p],
    } = await pool.query<{ id: number }>(
      `select min(id) as id from mensagens where conversa_id=$1 and id>coalesce((select lida_ate from membros_conversa where conversa_id=$1 and usuario_id=$2),0)`,
      [id, u.id],
    );
    if (p?.id) {
      depois = p.id - 1;
      crescente = true;
    }
  }
  const { rows: leitores } = await pool.query<{
    nome: string;
    lida_ate: number;
  }>(
    "select u.nome,m.lida_ate from membros_conversa m join usuarios u on u.id=m.usuario_id where m.conversa_id=$1",
    [id],
  );
  const { rows: mensagens } = await pool.query<Mensagem>(
    `select m.id,m.client_id,m.conversa_id,m.autor_id,u.nome as autor,u.ativo,
    case when m.apagada and $4<>'admin' then '' else m.texto end as texto,
    case when m.apagada and $4<>'admin' then '[]'::jsonb else m.segmentos end as segmentos,
    coalesce((select jsonb_agg(jsonb_build_object('emoji',r.emoji,'nome',p.nome)) from reacoes_mensagem r join usuarios p on p.id=r.usuario_id where r.mensagem_id=m.id),'[]') as reacoes,
    case when m.apagada and $4<>'admin' then null else (select jsonb_build_object('id',a.id,'mime',a.mime,'removida',a.removida,'movida',a.viajante_id is not null) from midias_comunicador a where a.mensagem_id=m.id) end as midia,
    m.criada_em::text,m.apagada,m.urgente,m.citada_id,
    case when m.apagada and $4<>'admin' then '[]'::jsonb else m.versoes end as versoes,
    case when m.apagada and $4<>'admin' then '' else m.transcricao end as transcricao
    from mensagens m join usuarios u on u.id=m.autor_id where m.conversa_id=$1 and m.id<$2 and m.id>$3 order by m.id ${crescente ? "asc" : "desc"} limit 50`,
    [id, antes, depois, u.papel],
  );
  return {
    conversa,
    mensagens: crescente ? mensagens : mensagens.reverse(),
    leitores,
  };
}
export async function enviar(
  u: Usuario,
  d: { conversaId: number; clientId: string; texto: string; citadaId?: number },
  agora: Date,
  origem: string,
  midia?: MidiaNova,
  transacao?: PoolClient,
) {
  const conversa = await exigirConversa(u, d.conversaId, true, transacao);
  if (
    !/^[a-zA-Z0-9-]{16,80}$/.test(d.clientId) ||
    typeof d.texto !== "string" ||
    !d.texto.trim() ||
    d.texto.length > 20000
  )
    invalido();
  const { segmentos, urgente } = await analisarMensagem(
    u,
    d.texto,
    origem,
    transacao,
  );
  const tx = transacao ?? (await pool.connect());
  try {
    if (!transacao) await tx.query("begin");
    await tx.query("select id from conversas where id=$1 for update", [
      d.conversaId,
    ]);
    await exigirConversa(u, d.conversaId, true, tx);
    if (
      d.citadaId &&
      !(
        await tx.query(
          "select id from mensagens where id=$1 and conversa_id=$2",
          [d.citadaId, d.conversaId],
        )
      ).rowCount
    )
      invalido();
    const {
      rows: [m],
    } = await tx.query<{
      id: number;
      autor_id: number;
      conversa_id: number;
      nova: boolean;
    }>(
      `insert into mensagens(client_id,conversa_id,autor_id,texto,criada_em,citada_id,segmentos,urgente) values($1,$2,$3,$4,$5,$6,$7,$8)
      on conflict(client_id) do update set client_id=excluded.client_id returning id,autor_id,conversa_id,(xmax=0) as nova`,
      [
        d.clientId,
        d.conversaId,
        u.id,
        d.texto,
        agora,
        d.citadaId ?? null,
        JSON.stringify(segmentos),
        urgente,
      ],
    );
    if (m.autor_id !== u.id || m.conversa_id !== Number(d.conversaId))
      restrito();
    if (!m.nova) {
      if (!transacao) await tx.query("commit");
      return m;
    }
    await tx.query("update conversas set atualizada_em=$2 where id=$1", [
      d.conversaId,
      agora,
    ]);
    if (midia)
      await tx.query(
        "insert into midias_comunicador(id,mensagem_id,caminho,mime,tamanho,proxima_transcricao) values($1,$2,$3,$4,$5,$6) on conflict(mensagem_id) do nothing",
        [
          midia.id,
          m.id,
          midia.caminho,
          midia.mime,
          midia.tamanho,
          midia.mime.startsWith("audio/") ? agora : null,
        ],
      );
    await tx.query(
      "insert into membros_conversa(conversa_id,usuario_id,lida_ate) values($1,$2,$3) on conflict(conversa_id,usuario_id) do update set lida_ate=greatest(membros_conversa.lida_ate,excluded.lida_ate)",
      [d.conversaId, u.id, m.id],
    );
    await avisarMensagem(tx, u, conversa, m.id, segmentos, urgente, agora);
    if (!transacao) await tx.query("commit");
    if (!transacao) {
      publicar(d.conversaId);
      void entregarPush().catch(console.error);
    }
    return m;
  } catch (e) {
    if (!transacao) await tx.query("rollback");
    throw e;
  } finally {
    if (!transacao) tx.release();
  }
}
export async function localizarMensagem(u: Usuario, id: number) {
  const {
    rows: [m],
  } = await pool.query<{ conversa_id: number }>(
    "select conversa_id from mensagens where id=$1",
    [id],
  );
  if (!m) restrito();
  await exigirConversa(u, m.conversa_id);
  return { conversaId: m.conversa_id };
}

export async function analisarMensagem(
  u: Usuario,
  texto: string,
  origem: string,
  cliente: Pool | PoolClient = pool,
) {
  const { rows: usuarios } = await cliente.query<Pessoa>(
    "select id,nome from usuarios where ativo",
  );
  const { rows: grupos } = await cliente.query<{ id: number; nome: string }>(
    "select c.id,c.nome from conversas c where c.tipo='grupo' and ($1='admin' or exists(select 1 from membros_conversa m where m.conversa_id=c.id and m.usuario_id=$2))",
    [u.papel, u.id],
  );
  const segmentos = segmentar(texto, { usuarios, grupos, origem });
  const urgente = segmentos[0]?.texto === "/urgente";
  if (urgente && u.papel !== "admin") restrito();

  return { segmentos, urgente };
}
