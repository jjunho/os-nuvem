import { inteiroEntrada, idOpcional } from "~/modules/validacao/entrada";
import { acaoDaTarefaEtapa } from "~/modules/viagens/tarefas-etapa.server";
import { redirect } from "react-router";
import { projetarTarefa } from "~/modules/tarefas/cartao";
import { cartoesViagem } from "~/modules/viagens/cartoes.server";
import { pool } from "~/db/client.server";
import type { PoolClient } from "pg";
import { publicar } from "~/modules/notificacoes/eventos.server";
import { criarTarefa, detalheTarefa } from "~/modules/tarefas/tarefas.server";
import { notificar } from "~/modules/comunicador/leitura";
import { leituraAtual } from "~/modules/comunicador/presenca.server";
import { decidirAdministracao, decidirMovimento } from "./decisoes";
export type Leitor = { id: number; papel: string };
export type Quadro = {
  id: number;
  nome: string;
  pessoal: boolean;
  arquivado: boolean;
  criador_id: number;
};
export type Lista = {
  id: number;
  nome: string;
  posicao: string;
  conclusao: boolean;
  arquivada: boolean;
  quadro_id: number;
};
const erro = (mensagem = "Acesso restrito", status = 403): never => {
  throw new Response(mensagem, { status });
};
const numero = (f: FormData, n: string) => idOpcional(f.get(n)) ?? 0;
const texto = (f: FormData, n: string) => String(f.get(n) ?? "").trim();
export async function exigirQuadro(
  u: Leitor,
  id: number,
  escrita = false,
  c: Pick<PoolClient, "query"> = pool,
): Promise<Quadro> {
  const q = (
    await c.query<Quadro>(
      "select * from quadros where id=$1 and quadro_visivel(id,$2,$3)",
      [id, u.id, u.papel],
    )
  ).rows[0];
  if (!q) erro();
  if (escrita && q.arquivado) erro("Quadro arquivado", 400);
  return q;
}
export async function listarQuadros(u: Leitor) {
  return (
    await pool.query<Quadro>(
      "select * from quadros where quadro_visivel(id,$1,$2) order by (pessoal and criador_id=$1) desc,id",
      [u.id, u.papel],
    )
  ).rows;
}
export async function lerQuadro(
  u: Leitor,
  id: number,
  f: URLSearchParams,
  agora: Date,
) {
  const quadro = await exigirQuadro(u, id);
  const pagina = inteiroEntrada(f.get("pagina") ?? "0", {
    min: 0,
    mensagem: "Página inválida",
  });
  const [listas, rows, etiquetas, membros, usuarios, quadros] =
    await Promise.all([
      pool.query<Lista>(
        "select * from quadros_listas where quadro_id=$1 order by posicao,id",
        [id],
      ),
      pool.query<{
        id: number;
        lista_id: number;
        posicao: string;
        titulo: string;
        codigo: string;
        estado: string;
        prazo: Date | null;
        responsavel: string;
        responsavel_id: number;
        viagem_id: number | null;
        capa: string | null;
        etiquetas: string[];
      }>(
        `select t.id,p.lista_id,p.posicao,t.titulo,t.codigo,t.estado,t.prazo,u.nome as responsavel,t.responsavel_id,t.viagem_id,
      (select a.id::text from tarefas_anexos a where a.tarefa_id=t.id and a.capa) as capa,
      array(select e.nome from tarefas_etiquetas te join quadros_etiquetas e on e.id=te.etiqueta_id where te.tarefa_id=t.id and e.quadro_id=p.quadro_id) as etiquetas
      from tarefas_posicoes p join tarefas t on t.id=p.tarefa_id join usuarios u on u.id=t.responsavel_id
      where p.quadro_id=$1 and not p.arquivada and tarefa_visivel(t.id,$2,$3)
      and ($4='' or t.titulo ilike '%'||$4||'%' or t.codigo ilike '%'||$4||'%')
      and ($5=0 or t.responsavel_id=$5) and ($6=0 or t.viagem_id=$6)
      and ($7=0 or exists(select 1 from tarefas_etiquetas te join quadros_etiquetas e on e.id=te.etiqueta_id where te.tarefa_id=t.id and e.quadro_id=$1 and e.id=$7))
      and (not $8 or t.estado<>'concluida') and ($9='' or ($9='atrasadas' and t.prazo<$10 and t.estado='aberta') or ($9='sem' and t.prazo is null) or ($9='hoje' and t.prazo::date=$10::timestamptz::date))
      order by p.lista_id,p.posicao,t.id limit 1001 offset $11`,
        [
          id,
          u.id,
          u.papel,
          f.get("q") ?? "",
          idOpcional(f.get("responsavel")) ?? 0,
          idOpcional(f.get("viagem")) ?? 0,
          idOpcional(f.get("etiqueta")) ?? 0,
          f.has("ocultarConcluidas"),
          f.get("prazo") ?? "",
          agora,
          pagina * 1000,
        ],
      ),
      pool.query<{ id: number; nome: string }>(
        "select id,nome from quadros_etiquetas where quadro_id=$1 order by nome",
        [id],
      ),
      pool.query<{ id: number; nome: string }>(
        "select u.id,u.nome from usuarios u where u.id=(select criador_id from quadros where id=$1) or exists(select 1 from quadros_membros m where m.quadro_id=$1 and m.usuario_id=u.id)",
        [id],
      ),
      pool.query<{ id: number; nome: string }>(
        "select id,nome from usuarios where ativo order by nome",
      ),
      listarQuadros(u),
    ]);
  const viagens = await cartoesViagem(
    [...new Set(rows.rows.flatMap((t) => (t.viagem_id ? [t.viagem_id] : [])))],
    u,
  );
  const tarefas = rows.rows.slice(0, 1000).map((t) => ({
    ...t,
    cartao: projetarTarefa({
      ...t,
      preco: viagens.find((v) => v.url === `/viagens/${t.viagem_id}`)?.preco,
    }),
  }));
  const destinos = (
    await pool.query<Lista>(
      `select l.* from quadros_listas l join quadros q on q.id=l.quadro_id where not l.arquivada and not q.arquivado and quadro_visivel(q.id,$1,$2) order by q.id,l.posicao`,
      [u.id, u.papel],
    )
  ).rows;
  return {
    quadro,
    pagina,
    mais: rows.rows.length > 1000,
    destinos,
    listas: listas.rows,
    tarefas,
    etiquetas: etiquetas.rows,
    membros: membros.rows,
    usuarios: usuarios.rows,
    quadros,
    filtros: Object.fromEntries(f),
  };
}
async function historico(
  c: PoolClient,
  id: number,
  tipo: string,
  u: Leitor,
  agora: Date,
  motivo = "",
) {
  await c.query(
    "insert into tarefas_historico(tarefa_id,tipo,autor_id,criada_em,motivo) values($1,$2,$3,$4,$5)",
    [id, tipo, u.id, agora, motivo],
  );
}
export async function criarQuadro(u: Leitor, f: FormData) {
  const nome = texto(f, "nome");
  if (!nome) erro("Informe o nome", 400);
  const c = await pool.connect();
  try {
    await c.query("begin");
    const q = (
      await c.query<Quadro>(
        "insert into quadros(nome,criador_id) values($1,$2) returning *",
        [nome, u.id],
      )
    ).rows[0];
    await c.query(
      "insert into quadros_listas(quadro_id,nome,posicao) values($1,'Novo',1)",
      [q.id],
    );
    await c.query("commit");
    return q;
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
}
export async function acaoQuadro(
  u: Leitor,
  id: number,
  f: FormData,
  agora: Date,
) {
  const intent = texto(f, "intent");
  await exigirQuadro(u, id, true);
  if (intent === "criar-tarefa") {
    f.set("responsavelId", String(u.id));
    const lid = numero(f, "listaId");
    const l = (
      await pool.query<Lista>(
        "select * from quadros_listas where id=$1 and quadro_id=$2 and not arquivada",
        [lid, id],
      )
    ).rows[0];
    if (!l) erro();
    await criarTarefa(u, f, agora, undefined, undefined, {
      quadroId: id,
      listaId: lid,
    });
    publicar(0);
    return;
  }
  const c = await pool.connect();
  try {
    await c.query("begin");
    const q = await exigirQuadro(u, id, true, c);
    if (
      ["compartilhar", "remover-membro", "arquivar-quadro"].includes(intent)
    ) {
      const decisao = decidirAdministracao(intent, q, u);
      if (decisao) erro(decisao.texto, decisao.status);
      const uid = numero(f, "usuarioId");
      if (intent === "compartilhar")
        await c.query(
          "insert into quadros_membros(quadro_id,usuario_id) select $1,id from usuarios where id=$2 and ativo on conflict do nothing",
          [id, uid],
        );
      if (intent === "remover-membro")
        await c.query(
          "delete from quadros_membros where quadro_id=$1 and usuario_id=$2",
          [id, uid],
        );
      if (intent === "arquivar-quadro")
        await c.query("update quadros set arquivado=true where id=$1", [id]);
    } else if (intent === "renomear-quadro") {
      if (!texto(f, "nome")) erro("Informe o nome", 400);
      await c.query("update quadros set nome=$2 where id=$1", [
        id,
        texto(f, "nome"),
      ]);
    } else if (intent === "criar-lista") {
      if (!texto(f, "nome")) erro("Informe o nome", 400);
      await c.query(
        "insert into quadros_listas(quadro_id,nome,posicao) select $1,$2,coalesce(max(posicao),0)+1 from quadros_listas where quadro_id=$1",
        [id, texto(f, "nome")],
      );
    } else if (
      [
        "renomear-lista",
        "arquivar-lista",
        "ordenar-lista",
        "conclusao",
      ].includes(intent)
    ) {
      const lid = numero(f, "listaId");
      const l = (
        await c.query<Lista>(
          "select * from quadros_listas where id=$1 and quadro_id=$2 for update",
          [lid, id],
        )
      ).rows[0];
      if (!l) erro();
      if (intent === "renomear-lista") {
        if (!texto(f, "nome")) erro("Informe o nome", 400);
        await c.query("update quadros_listas set nome=$2 where id=$1", [
          lid,
          texto(f, "nome"),
        ]);
      }
      if (intent === "arquivar-lista") {
        const decisao = decidirAdministracao(intent, q, u);
        if (decisao) erro(decisao.texto, decisao.status);
        await c.query(
          "update quadros_listas set arquivada=true,conclusao=false where id=$1",
          [lid],
        );
      }
      if (intent === "ordenar-lista") {
        const pos = Number(f.get("posicao"));
        if (!Number.isFinite(pos)) erro("Posição inválida", 400);
        await c.query("update quadros_listas set posicao=$2 where id=$1", [
          lid,
          pos,
        ]);
      }
      if (intent === "conclusao") {
        await c.query(
          "update quadros_listas set conclusao=false where quadro_id=$1",
          [id],
        );
        if (!f.has("semConclusao"))
          await c.query(
            "update quadros_listas set conclusao=true where id=$1 and not arquivada",
            [lid],
          );
      }
    } else if (intent === "mover") {
      const tid = numero(f, "tarefaId"),
        lid = numero(f, "listaId");
      const t = (
        await c.query<{
          id: number;
          tipo: string;
          estado: string;
          viagem_id: number | null;
          lista_id: number;
          quadro_id: number;
          posicao: string;
        }>(
          "select t.id,t.tipo,t.estado,t.viagem_id,p.lista_id,p.quadro_id,p.posicao from tarefas t join tarefas_posicoes p on p.tarefa_id=t.id where t.id=$1 and tarefa_visivel(t.id,$2,$3) for update of t,p",
          [tid, u.id, u.papel],
        )
      ).rows[0];
      if (!t) erro();
      await exigirQuadro(u, t.quadro_id, true, c);
      const l = (
        await c.query<Lista>(
          "select * from quadros_listas where id=$1 and quadro_id=$2 and not arquivada for update",
          [lid, id],
        )
      ).rows[0];
      if (!l) erro();
      const decisao = decidirMovimento(t, { id: l.id, quadroId: l.quadro_id, conclusao: l.conclusao });
      if (decisao.exigeFato) {
        if (t.viagem_id)
          throw redirect(await acaoDaTarefaEtapa(t.id, t.viagem_id));
        erro("Registre o fato na Viagem para concluir esta Tarefa", 400);
      }
      const antes = numero(f, "antesId");
      const limite = antes
        ? (
            await c.query<{ posicao: string }>(
              "select posicao from tarefas_posicoes where tarefa_id=$1 and lista_id=$2",
              [antes, lid],
            )
          ).rows[0]
        : null;
      if (antes && !limite) erro("Posição inválida", 400);
      const anterior = (
        await c.query<{ posicao: string }>(
          "select coalesce(max(posicao),0)::text as posicao from tarefas_posicoes where lista_id=$1 and tarefa_id<>$2 and ($3::numeric is null or posicao<$3)",
          [lid, tid, limite?.posicao ?? null],
        )
      ).rows[0].posicao;
      // PostgreSQL numeric keeps fractional ordering exact instead of rounding through JS.
      const pos = (
        await c.query<{ p: string }>(
          "select case when $2::numeric is null then $1::numeric+1 else ($1::numeric+$2::numeric)/2 end as p",
          [anterior, limite?.posicao ?? null],
        )
      ).rows[0].p;
      if (t.lista_id !== lid || t.posicao !== pos) {
        await c.query(
          "update tarefas_posicoes set quadro_id=$2,lista_id=$3,posicao=$4,lista_anterior_id=case when $5 then lista_id else lista_anterior_id end where tarefa_id=$1",
          [tid, id, lid, pos, decisao.guardarListaAnterior],
        );
        await c.query(
          "delete from tarefas_etiquetas te using quadros_etiquetas e where te.tarefa_id=$1 and te.etiqueta_id=e.id and e.quadro_id<>$2",
          [tid, id],
        );
        if (decisao.estado === "concluida") {
          await c.query(
            "update tarefas set estado='concluida',concluida_em=$2,cancelada_em=null,motivo_cancelamento=null where id=$1",
            [tid, agora],
          );
          await historico(c, tid, "concluida", u, agora);
        }
        if (decisao.estado === "aberta") {
          await c.query(
            "update tarefas set estado='aberta',concluida_em=null where id=$1",
            [tid],
          );
          await c.query(
            "update tarefas_posicoes set lista_id=$2,posicao=$3 where tarefa_id=$1",
            [tid, lid, pos],
          );
          await historico(c, tid, "reaberta", u, agora);
        }
        await historico(c, tid, "movida", u, agora, l.nome);
      }
    } else erro("Ação inválida", 400);
    await c.query("commit");
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
  publicar(0);
}
export async function extrasTarefa(u: Leitor, id: number) {
  await detalheTarefa(u, id);
  const [pos, check, etiquetas, anexos, usuarios, conversa] = await Promise.all(
    [
      pool.query<{ quadro_id: number; lista_id: number; arquivada: boolean }>(
        "select * from tarefas_posicoes where tarefa_id=$1",
        [id],
      ),
      pool.query<{
        id: number;
        titulo: string;
        concluido: boolean;
        promovida_id: number | null;
      }>("select * from tarefas_checklist where tarefa_id=$1 order by id", [
        id,
      ]),
      pool.query<{ id: number; nome: string; atribuida: boolean }>(
        "select e.id,e.nome,exists(select 1 from tarefas_etiquetas t where t.tarefa_id=$1 and t.etiqueta_id=e.id) as atribuida from quadros_etiquetas e join tarefas_posicoes p on p.quadro_id=e.quadro_id where p.tarefa_id=$1",
        [id],
      ),
      pool.query<{ id: string; nome: string; mime: string; capa: boolean }>(
        "select id,nome,mime,capa from tarefas_anexos where tarefa_id=$1 order by criada_em",
        [id],
      ),
      pool.query<{ id: number; nome: string; em_copia: boolean }>(
        "select u.id,u.nome,exists(select 1 from tarefas_copias c where c.tarefa_id=$1 and c.usuario_id=u.id) as em_copia from usuarios u where ativo order by nome",
        [id],
      ),
      pool.query<{ id: number }>(
        "select id from conversas where chave='tarefa:'||$1::text",
        [id],
      ),
    ],
  );
  return {
    posicao: pos.rows[0],
    checklist: check.rows,
    etiquetas: etiquetas.rows,
    anexos: anexos.rows,
    usuarios: usuarios.rows,
    conversaId: conversa.rows[0]?.id,
  };
}
export async function acaoTarefa(
  u: Leitor,
  id: number,
  f: FormData,
  agora: Date,
) {
  await detalheTarefa(u, id);
  const intent = texto(f, "intent");
  const c = await pool.connect();
  try {
    await c.query("begin");
    const t = (
      await c.query<{
        titulo: string;
        prazo: Date | null;
        viagem_id: number | null;
        responsavel_id: number;
        quadro_id: number;
        nome: string;
        tipo: string;
      }>(
        "select t.*,p.quadro_id,u.nome from tarefas t join tarefas_posicoes p on p.tarefa_id=t.id join usuarios u on u.id=t.responsavel_id where t.id=$1 and tarefa_visivel(t.id,$2,$3) for update of t",
        [id, u.id, u.papel],
      )
    ).rows[0];
    if (!t) erro();
    if (intent === "enviar") {
      const uid = numero(f, "responsavelId");
      const novo = (
        await c.query<{ nome: string }>(
          "select nome from usuarios where id=$1 and ativo",
          [uid],
        )
      ).rows[0];
      if (!novo) erro("Usuário inválido", 400);
      if (uid !== t.responsavel_id) {
        await c.query(
          "insert into tarefas_copias(tarefa_id,usuario_id) values($1,$2) on conflict do nothing",
          [id, u.id],
        );
        await c.query("update tarefas set responsavel_id=$2 where id=$1", [
          id,
          uid,
        ]);
        await historico(
          c,
          id,
          "transferida",
          u,
          agora,
          `${t.nome} → ${novo.nome}`,
        );
        const conversa = (
          await c.query<{ id: number }>(
            "select id from conversas where chave='tarefa:'||$1::text",
            [id],
          )
        ).rows[0];
        for (const destino of new Set([uid, u.id])) {
          const pref = (
            await c.query<{
              dnd_inicio: string;
              dnd_fim: string;
              fuso: string;
            }>("select * from preferencias_comunicador where usuario_id=$1", [
              destino,
            ])
          ).rows[0];
          if (
            notificar({
              tipo: "tarefa",
              modo: "mencoes",
              mencionado: true,
              lendo: leituraAtual(destino, conversa ? [conversa.id] : []),
              urgente: false,
              agora,
              dndInicio: pref?.dnd_inicio,
              dndFim: pref?.dnd_fim,
              fuso: pref?.fuso,
            })
          )
            await c.query(
              "insert into notificacoes(usuario_id,titulo,texto,url,chave,criada_em) values($1,$2,$3,$4,$5,$6) on conflict do nothing",
              [
                destino,
                t.titulo,
                t.titulo,
                `/tarefas/${id}`,
                `tarefa:${id}:envio:${uid}:${agora.toISOString()}`,
                agora,
              ],
            );
        }
      }
    } else if (intent === "copiar" || intent === "remover-copia") {
      const uid = numero(f, "usuarioId");
      const ativo = await c.query(
        "select id from usuarios where id=$1 and ativo",
        [uid],
      );
      if (!ativo.rowCount) erro("Usuário inválido", 400);
      if (intent === "remover-copia")
        await c.query(
          "delete from tarefas_copias where tarefa_id=$1 and usuario_id=$2",
          [id, uid],
        );
      else {
        const incluida = await c.query(
          "insert into tarefas_copias(tarefa_id,usuario_id) values($1,$2) on conflict do nothing returning usuario_id",
          [id, uid],
        );
        if (incluida.rowCount) {
          const pref = (
            await c.query<{
              dnd_inicio: string;
              dnd_fim: string;
              fuso: string;
            }>("select * from preferencias_comunicador where usuario_id=$1", [
              uid,
            ])
          ).rows[0];
          const conversa = (
            await c.query<{ id: number }>(
              "select id from conversas where chave='tarefa:'||$1::text",
              [id],
            )
          ).rows[0];
          if (
            notificar({
              tipo: "tarefa",
              modo: "mencoes",
              mencionado: true,
              urgente: false,
              lendo: leituraAtual(uid, conversa ? [conversa.id] : []),
              agora,
              dndInicio: pref?.dnd_inicio,
              dndFim: pref?.dnd_fim,
              fuso: pref?.fuso,
            })
          )
            await c.query(
              "insert into notificacoes(usuario_id,titulo,texto,url,chave,criada_em) values($1,$2,$2,$3,$4,$5) on conflict do nothing",
              [
                uid,
                t.titulo,
                `/tarefas/${id}`,
                `tarefa:${id}:copia:${uid}:${agora.toISOString()}`,
                agora,
              ],
            );
        }
      }
    } else if (intent === "arquivar") {
      const r = await c.query(
        "update tarefas_posicoes set arquivada=true where tarefa_id=$1 and not arquivada returning tarefa_id",
        [id],
      );
      if (r.rowCount) await historico(c, id, "arquivada", u, agora);
    } else if (intent === "checklist-adicionar") {
      if (!texto(f, "titulo")) erro("Informe o título", 400);
      await c.query(
        "insert into tarefas_checklist(tarefa_id,titulo) values($1,$2)",
        [id, texto(f, "titulo")],
      );
    } else if (
      intent === "checklist-marcar" ||
      intent === "checklist-promover"
    ) {
      const item = (
        await c.query<{
          id: number;
          titulo: string;
          concluido: boolean;
          promovida_id: number | null;
        }>(
          "select * from tarefas_checklist where id=$1 and tarefa_id=$2 for update",
          [numero(f, "itemId"), id],
        )
      ).rows[0];
      if (!item) erro();
      if (intent === "checklist-marcar") {
        const feito = f.get("concluido") === "true";
        if (feito !== item.concluido) {
          await c.query(
            "update tarefas_checklist set concluido=$2 where id=$1",
            [item.id, feito],
          );
          await historico(c, id, "checklist", u, agora, item.titulo);
        }
      } else if (!item.promovida_id) {
        const uid = numero(f, "responsavelId") || t.responsavel_id;
        const prazo = texto(f, "prazo") ? new Date(texto(f, "prazo")) : t.prazo;
        if (prazo && !Number.isFinite(prazo.getTime()))
          erro("Prazo inválido", 400);
        const nova = (
          await c.query<{ id: number }>(
            "insert into tarefas(titulo,descricao,responsavel_id,prazo,viagem_id,criada_por,criada_em) select $1,$2,id,$4,$5,$6,$7 from usuarios where id=$3 and ativo returning id",
            [
              item.titulo,
              `/tarefas/${id}`,
              uid,
              prazo,
              t.viagem_id,
              u.id,
              agora,
            ],
          )
        ).rows[0];
        if (!nova) erro("Usuário inválido", 400);
        if (uid !== u.id)
          await c.query(
            "insert into tarefas_copias(tarefa_id,usuario_id) values($1,$2) on conflict do nothing",
            [nova.id, u.id],
          );
        const pref = (
          await c.query<{ dnd_inicio: string; dnd_fim: string; fuso: string }>(
            "select * from preferencias_comunicador where usuario_id=$1",
            [uid],
          )
        ).rows[0];
        if (
          notificar({
            tipo: "tarefa",
            modo: "mencoes",
            mencionado: true,
            urgente: false,
            lendo: false,
            agora,
            dndInicio: pref?.dnd_inicio,
            dndFim: pref?.dnd_fim,
            fuso: pref?.fuso,
          })
        )
          await c.query(
            "insert into notificacoes(usuario_id,titulo,texto,url,chave,criada_em) values($1,$2,$2,$3,$4,$5) on conflict do nothing",
            [
              uid,
              item.titulo,
              `/tarefas/${nova.id}`,
              `tarefa:${nova.id}:atribuida`,
              agora,
            ],
          );
        await c.query(
          "update tarefas_checklist set promovida_id=$2 where id=$1",
          [item.id, nova.id],
        );
        await historico(c, nova.id, "criada", u, agora, `/tarefas/${id}`);
      }
    } else if (intent === "etiqueta-criar") {
      await exigirQuadro(u, t.quadro_id, true, c);
      if (!texto(f, "nome")) erro("Informe o nome", 400);
      await c.query(
        "insert into quadros_etiquetas(quadro_id,nome) values($1,$2) on conflict do nothing",
        [t.quadro_id, texto(f, "nome")],
      );
    } else if (intent === "etiqueta-atribuir") {
      const eid = numero(f, "etiquetaId");
      const e = await c.query(
        "select id from quadros_etiquetas where id=$1 and quadro_id=$2",
        [eid, t.quadro_id],
      );
      if (!e.rowCount) erro();
      if (f.get("atribuir") === "true")
        await c.query(
          "insert into tarefas_etiquetas values($1,$2) on conflict do nothing",
          [id, eid],
        );
      else
        await c.query(
          "delete from tarefas_etiquetas where tarefa_id=$1 and etiqueta_id=$2",
          [id, eid],
        );
    } else if (intent === "capa") {
      const aid = texto(f, "anexoId");
      const a = await c.query(
        "select id from tarefas_anexos where id::text=$1 and tarefa_id=$2 and mime in ('image/png','image/jpeg','image/webp')",
        [aid, id],
      );
      if (!a.rowCount) erro("Capa inválida", 400);
      await c.query("update tarefas_anexos set capa=false where tarefa_id=$1", [
        id,
      ]);
      await c.query("update tarefas_anexos set capa=true where id::text=$1", [
        aid,
      ]);
    } else erro("Ação inválida", 400);
    await c.query("commit");
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
  publicar(0);
}
