import type { PoolClient } from "pg";
import { pool } from "~/db/client.server";
import { notificar, type Segmento } from "./leitura";
import {
  exigirConversa,
  invalido,
  type Usuario,
  type Conversa,
} from "./comunicador.server";
const presencas = new Map<
  string,
  { usuario: number; conversa: number; lendo: boolean; em: number }
>();
export async function presenca(u: Usuario, d: Record<string, unknown>) {
  const id = Number(d.conversaId),
    aba = String(d.aba ?? "").slice(0, 80);
  if (!aba) invalido();
  if (id) await exigirConversa(u, id);
  const agora = Date.now();
  for (const [k, v] of presencas)
    if (agora - v.em > 180000) presencas.delete(k);
  presencas.set(`${u.id}:${aba}`, {
    usuario: u.id,
    conversa: id,
    lendo: d.lendo === true,
    em: agora,
  });
  return { ok: true };
}
export async function preferencias(u: Usuario, d: Record<string, unknown>) {
  if (d.acao === "aviso-visto") {
    await pool.query(
      "insert into preferencias_comunicador(usuario_id,aviso_visto) values($1,true) on conflict(usuario_id) do update set aviso_visto=true",
      [u.id],
    );
    return { ok: true };
  }
  if (d.acao === "modo") {
    const id = Number(d.conversaId);
    await exigirConversa(u, id);
    if (!["todas", "mencoes", "mudo"].includes(String(d.modo))) invalido();
    await pool.query(
      "insert into membros_conversa(conversa_id,usuario_id,notificacao) values($1,$2,$3) on conflict(conversa_id,usuario_id) do update set notificacao=excluded.notificacao",
      [id, u.id, d.modo],
    );
    return { ok: true };
  }
  const inicio = String(d.dndInicio ?? ""),
    fim = String(d.dndFim ?? ""),
    fuso = String(d.fuso ?? "Asia/Seoul");
  if ([inicio, fim].some((x) => x && !/^([01]\d|2[0-3]):[0-5]\d$/.test(x)))
    invalido();
  try {
    new Intl.DateTimeFormat("en", { timeZone: fuso });
  } catch {
    invalido();
  }
  await pool.query(
    "insert into preferencias_comunicador(usuario_id,dnd_inicio,dnd_fim,fuso) values($1,$2,$3,$4) on conflict(usuario_id) do update set dnd_inicio=excluded.dnd_inicio,dnd_fim=excluded.dnd_fim,fuso=excluded.fuso",
    [u.id, inicio, fim, fuso],
  );
  return { ok: true };
}
export async function preferencia(u: Usuario) {
  return (
    (
      await pool.query<{
        aviso_visto: boolean;
        dnd_inicio: string;
        dnd_fim: string;
        fuso: string;
      }>("select * from preferencias_comunicador where usuario_id=$1", [u.id])
    ).rows[0] ?? {
      aviso_visto: false,
      dnd_inicio: "",
      dnd_fim: "",
      fuso: "Asia/Seoul",
    }
  );
}
export async function avisarMensagem(
  tx: PoolClient,
  u: Usuario,
  c: Conversa,
  mensagemId: number,
  segmentos: Segmento[],
  urgente: boolean,
  agora: Date,
) {
  const { rows } = await tx.query<{
    usuario_id: number;
    notificacao: string;
    dnd_inicio: string;
    dnd_fim: string;
    fuso: string;
  }>(
    "select m.usuario_id,m.notificacao,p.dnd_inicio,p.dnd_fim,p.fuso from membros_conversa m join usuarios u on u.id=m.usuario_id and u.ativo left join preferencias_comunicador p on p.usuario_id=m.usuario_id where m.conversa_id=$1 and m.usuario_id<>$2",
    [c.id, u.id],
  );
  for (const m of rows) {
    const ativas = [...presencas.values()].filter(
      (p) => p.usuario === m.usuario_id && p.conversa === c.id,
    );
    const lendo = ativas.some((p) => p.lendo && Date.now() - p.em < 25000),
      aqui = ativas.some((p) => Date.now() - p.em < 180000);
    const mencionado = segmentos.some(
      (s) =>
        s.tipo === "todos" ||
        (s.tipo === "aqui" && aqui) ||
        (s.tipo === "usuario" && s.id === m.usuario_id),
    );
    if (
      notificar({
        tipo: c.tipo,
        modo: m.notificacao,
        mencionado,
        lendo,
        urgente,
        agora,
        dndInicio: m.dnd_inicio,
        dndFim: m.dnd_fim,
        fuso: m.fuso,
      })
    )
      await tx.query(
        `insert into notificacoes(usuario_id,titulo,texto,url,chave,criada_em) values($1,$2,$3,$4,$5,$6) on conflict do nothing`,
        [
          m.usuario_id,
          c.nome,
          u.nome,
          `/?conversa=${c.id}&mensagem=${mensagemId}`,
          `mensagem:${mensagemId}`,
          agora,
        ],
      );
  }
}
export function limparPresencasDeTeste() {
  if (process.env.TEST_MODE === "1") presencas.clear();
}

export function leituraAtual(usuarioId: number, conversaIds: number[]) {
  return [...presencas.values()].some(
    (p) =>
      p.usuario === usuarioId &&
      conversaIds.includes(p.conversa) &&
      p.lendo &&
      Date.now() - p.em < 25000,
  );
}
