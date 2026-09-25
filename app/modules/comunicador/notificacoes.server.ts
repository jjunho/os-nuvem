import type { PoolClient } from "pg";
import { pool } from "~/db/client.server";
import { notificar, type Segmento } from "./leitura";
import { resumoPresenca } from "./presenca.server";
import type { Usuario, Conversa } from "./tipos";
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
    const { lendo, aqui } = resumoPresenca(m.usuario_id, c.id, Date.now());
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
