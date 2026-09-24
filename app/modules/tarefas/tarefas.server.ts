import { and, asc, eq, exists, inArray, lt, ne, or, sql } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  tarefas,
  tarefasCopias,
  tarefasHistorico,
  usuarios,
} from "~/db/schema";
type Usuario = { id: number; papel: string };
type Transacao = Parameters<Parameters<typeof db.transaction>[0]>[0];
function visibilidade(usuario: Usuario) {
  return usuario.papel === "guiamento"
    ? or(
        eq(tarefas.responsavelId, usuario.id),
        exists(
          db
            .select()
            .from(tarefasCopias)
            .where(
              and(
                eq(tarefasCopias.tarefaId, tarefas.id),
                eq(tarefasCopias.usuarioId, usuario.id),
              ),
            ),
        ),
      )
    : undefined;
}
async function evento(
  tx: Transacao,
  ids: number[],
  tipo: string,
  autorId: number | null,
  agora: Date,
  motivo?: string,
) {
  if (ids.length)
    await tx
      .insert(tarefasHistorico)
      .values(
        ids.map((tarefaId) => ({
          tarefaId,
          tipo,
          autorId,
          criadaEm: agora,
          motivo,
        })),
      );
}
export async function criarTarefaAutomatica(
  tx: Transacao,
  dados: {
    viagemId: number;
    tipo: string;
    titulo: string;
    responsavelId: number;
    prazo: Date;
    autorId: number | null;
    agora: Date;
    chave: string;
  },
) {
  const [criada] = await tx
    .insert(tarefas)
    .values({
      ...dados,
      criadaEm: dados.agora,
      criadaPor: dados.autorId,
      chaveAutomatica: `${dados.viagemId}:${dados.chave}`,
    })
    .onConflictDoNothing()
    .returning();
  if (criada)
    await evento(tx, [criada.id], "criada", dados.autorId, dados.agora);
  return criada;
}
export async function concluirAutomaticas(
  tx: Transacao,
  viagemId: number,
  tipo: string,
  autorId: number | null,
  agora: Date,
) {
  const alteradas = await tx
    .update(tarefas)
    .set({ estado: "concluida", concluidaEm: agora })
    .where(
      and(
        eq(tarefas.viagemId, viagemId),
        eq(tarefas.tipo, tipo),
        eq(tarefas.estado, "aberta"),
      ),
    )
    .returning({ id: tarefas.id });
  await evento(
    tx,
    alteradas.map((t) => t.id),
    "concluida",
    autorId,
    agora,
  );
}
export async function transferirAutomaticas(
  tx: Transacao,
  viagemId: number,
  responsavelId: number,
  autorId: number | null,
  agora: Date,
) {
  const alteradas = await tx
    .update(tarefas)
    .set({ responsavelId })
    .where(
      and(
        eq(tarefas.viagemId, viagemId),
        ne(tarefas.tipo, "manual"),
        eq(tarefas.estado, "aberta"),
      ),
    )
    .returning({ id: tarefas.id });
  await evento(
    tx,
    alteradas.map((t) => t.id),
    "transferida",
    autorId,
    agora,
  );
}
export async function cancelarAutomaticas(
  tx: Transacao,
  viagemId: number,
  autorId: number | null,
  motivo: string,
  agora: Date,
) {
  const alteradas = await tx
    .update(tarefas)
    .set({
      estado: "cancelada",
      canceladaEm: agora,
      motivoCancelamento: motivo,
    })
    .where(
      and(
        eq(tarefas.viagemId, viagemId),
        ne(tarefas.tipo, "manual"),
        eq(tarefas.estado, "aberta"),
      ),
    )
    .returning({ id: tarefas.id });
  await evento(
    tx,
    alteradas.map((t) => t.id),
    "cancelada",
    autorId,
    agora,
    motivo,
  );
}
export async function criarTarefa(
  usuario: Usuario,
  form: FormData,
  agora: Date,
) {
  const titulo = String(form.get("titulo") ?? "").trim();
  const prazo = new Date(String(form.get("prazo")));
  const responsavelId = Number(form.get("responsavelId"));
  const copias = [...new Set(form.getAll("copias").map(Number))];
  if (!titulo || !Number.isFinite(prazo.getTime()))
    throw new Response("Informe título e prazo", { status: 400 });
  if (
    usuario.papel === "guiamento" &&
    responsavelId !== usuario.id &&
    !copias.includes(usuario.id)
  )
    throw new Response("Acesso restrito", { status: 403 });
  return db.transaction(async (tx) => {
    const ids = [...new Set([responsavelId, ...copias])];
    const ativos = await tx
      .select()
      .from(usuarios)
      .where(and(inArray(usuarios.id, ids), eq(usuarios.ativo, true)));
    if (ativos.length !== ids.length)
      throw new Response("Usuário inválido", { status: 400 });
    const [tarefa] = await tx
      .insert(tarefas)
      .values({
        titulo,
        descricao: String(form.get("descricao") ?? ""),
        responsavelId,
        prazo,
        viagemId: Number(form.get("viagemId")) || null,
        criadaPor: usuario.id,
        criadaEm: agora,
        tipo: "manual",
      })
      .returning();
    if (copias.length)
      await tx
        .insert(tarefasCopias)
        .values(
          copias.map((usuarioId) => ({ tarefaId: tarefa.id, usuarioId })),
        );
    await evento(tx, [tarefa.id], "criada", usuario.id, agora);
    return tarefa;
  });
}
export async function listarTarefas(
  usuario: Usuario,
  filtros: URLSearchParams,
  agora: Date,
) {
  const responsavel = filtros.get("responsavel") ?? String(usuario.id);
  const copia = filtros.get("copia");
  return db
    .select({
      id: tarefas.id,
      codigo: tarefas.codigo,
      titulo: tarefas.titulo,
      tipo: tarefas.tipo,
      estado: tarefas.estado,
      prazo: tarefas.prazo,
      viagemId: tarefas.viagemId,
      responsavel: usuarios.nome,
    })
    .from(tarefas)
    .innerJoin(usuarios, eq(usuarios.id, tarefas.responsavelId))
    .where(
      and(
        visibilidade(usuario),
        responsavel !== "todos"
          ? eq(tarefas.responsavelId, Number(responsavel))
          : undefined,
        copia
          ? exists(
              db
                .select()
                .from(tarefasCopias)
                .where(
                  and(
                    eq(tarefasCopias.tarefaId, tarefas.id),
                    eq(tarefasCopias.usuarioId, Number(copia)),
                  ),
                ),
            )
          : undefined,
        filtros.get("viagem")
          ? eq(tarefas.viagemId, Number(filtros.get("viagem")))
          : undefined,
        filtros.has("atrasadas")
          ? and(eq(tarefas.estado, "aberta"), lt(tarefas.prazo, agora))
          : undefined,
      ),
    )
    .orderBy(asc(tarefas.prazo), asc(tarefas.id))
    .limit(200);
}
export async function detalheTarefa(usuario: Usuario, id: number) {
  const [tarefa] = await db
    .select()
    .from(tarefas)
    .where(and(eq(tarefas.id, id), visibilidade(usuario)));
  if (!tarefa) throw new Response("Acesso restrito", { status: 403 });
  const [responsavel, copias, historico] = await Promise.all([
    db
      .select({ nome: usuarios.nome })
      .from(usuarios)
      .where(eq(usuarios.id, tarefa.responsavelId)),
    db
      .select({ id: usuarios.id, nome: usuarios.nome })
      .from(tarefasCopias)
      .innerJoin(usuarios, eq(usuarios.id, tarefasCopias.usuarioId))
      .where(eq(tarefasCopias.tarefaId, id)),
    db
      .select({
        id: tarefasHistorico.id,
        tipo: tarefasHistorico.tipo,
        motivo: tarefasHistorico.motivo,
        autor: usuarios.nome,
        criadaEm: tarefasHistorico.criadaEm,
      })
      .from(tarefasHistorico)
      .leftJoin(usuarios, eq(usuarios.id, tarefasHistorico.autorId))
      .where(eq(tarefasHistorico.tarefaId, id))
      .orderBy(asc(tarefasHistorico.id)),
  ]);
  return { tarefa, responsavel: responsavel[0].nome, copias, historico };
}
export async function mudarEstadoTarefa(
  usuario: Usuario,
  id: number,
  intent: string,
  motivo: string,
  agora: Date,
) {
  await db.transaction(async (tx) => {
    const [tarefa] = await tx
      .select()
      .from(tarefas)
      .where(and(eq(tarefas.id, id), visibilidade(usuario)))
      .for("update");
    if (!tarefa) throw new Response("Acesso restrito", { status: 403 });
    if (tarefa.tipo !== "manual")
      throw new Response(
        "Registre o fato na Viagem para concluir esta Tarefa",
        { status: 400 },
      );
    const estado =
      intent === "concluir"
        ? "concluida"
        : intent === "reabrir"
          ? "aberta"
          : intent === "cancelar"
            ? "cancelada"
            : null;
    if (!estado || (estado === "cancelada" && !motivo.trim()))
      throw new Response("Informe o motivo", { status: 400 });
    if (estado === tarefa.estado) return;
    await tx
      .update(tarefas)
      .set({
        estado,
        concluidaEm: estado === "concluida" ? agora : null,
        canceladaEm: estado === "cancelada" ? agora : null,
        motivoCancelamento: estado === "cancelada" ? motivo.trim() : null,
      })
      .where(eq(tarefas.id, id));
    await evento(
      tx,
      [id],
      estado === "aberta" ? "reaberta" : estado,
      usuario.id,
      agora,
      motivo.trim(),
    );
  });
}
export async function tarefasDaViagem(viagemId: number, usuario: Usuario) {
  return db
    .select({
      id: tarefas.id,
      codigo: tarefas.codigo,
      titulo: tarefas.titulo,
      tipo: tarefas.tipo,
      prazo: tarefas.prazo,
      concluidaEm: tarefas.concluidaEm,
      estado: tarefas.estado,
      responsavel: usuarios.nome,
    })
    .from(tarefas)
    .innerJoin(usuarios, eq(usuarios.id, tarefas.responsavelId))
    .where(and(eq(tarefas.viagemId, viagemId), visibilidade(usuario)))
    .orderBy(asc(tarefas.prazo));
}
export async function proximasTarefas(ids: number[], usuario: Usuario) {
  if (!ids.length) return [];
  return db
    .selectDistinctOn([tarefas.viagemId], {
      viagemId: tarefas.viagemId,
      titulo: tarefas.titulo,
      prazo: tarefas.prazo,
    })
    .from(tarefas)
    .where(
      and(
        inArray(tarefas.viagemId, ids),
        eq(tarefas.estado, "aberta"),
        visibilidade(usuario),
      ),
    )
    .orderBy(asc(tarefas.viagemId), asc(tarefas.prazo), asc(tarefas.id));
}
