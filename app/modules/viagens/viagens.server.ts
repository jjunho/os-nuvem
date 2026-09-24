import { registrarFato } from "./etapas.server";
import {
  criarTarefaAutomatica,
  concluirAutomaticas,
  transferirAutomaticas,
  cancelarAutomaticas,
  tarefasDaViagem,
  proximasTarefas,
} from "~/modules/tarefas/tarefas.server";
import {
  criarViajantes,
  listarViajantes,
  resumirViajantes,
} from "./viajantes.server";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  cadeiaComercial,
  contatos,
  intermediarios,
  notas,
  responsaveis,
  usuarios,
  viagemContatos,
  viagens,
} from "~/db/schema";
import {
  ETAPAS_ABERTAS,
  codigoDaViagem,
  podeDescartar,
  prazoPrimeiraResposta,
  semRespostaHumana,
  type CanalComercial,
  type Etapa,
} from "./regras";

export type ContatoInput = {
  contatoId?: number;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  papeis: ("solicitante" | "viajante")[];
};

export type NovaViagem = {
  responsavelId: number;
  canalComercial: CanalComercial;
  categoria: string;
  marca: string;
  origem: string;
  indicadoPor?: string | null;
  idiomaCliente: string;
  idiomaGuiamento: string;
  meiosContato: string[];
  dataInicio?: string | null;
  dataFim?: string | null;
  pagantes?: number | null;
  gratuidades?: number;
  adultos?: number | null;
  idadesCriancas?: number[];
  bebes?: number;
  cidades?: string[];
  cadeia: { intermediarioId: number; especificou?: string | null }[];
  contatos: ContatoInput[];
  nota?: string | null;
};

export class RegraViolada extends Error {}

const normalizaTelefone = (t?: string | null) =>
  t ? t.replace(/\D/g, "") || null : null;
const normalizaEmail = (e?: string | null) =>
  e ? e.trim().toLowerCase() || null : null;

export async function criarViagem(
  input: NovaViagem,
  autorId: number,
  agora: Date,
) {
  if (!input.responsavelId)
    throw new RegraViolada("Toda Viagem nasce com um Responsável.");
  if (input.contatos.length === 0)
    throw new RegraViolada("Informe ao menos um Contato.");

  return db.transaction(async (tx) => {
    const ano = agora.getFullYear();
    const sequencia = await tx.execute(
      sql`select proximo_identificador(${`viagem:${ano}`}) as numero`,
    );
    const codigo = codigoDaViagem(ano, Number(sequencia.rows[0].numero));

    const [viagem] = await tx
      .insert(viagens)
      .values({
        codigo,
        canalComercial: input.canalComercial,
        categoria: input.categoria,
        marca: input.marca,
        origem: input.origem,
        indicadoPor: input.indicadoPor || null,
        idiomaCliente: input.idiomaCliente,
        idiomaGuiamento: input.idiomaGuiamento,
        meiosContato: input.meiosContato,
        dataInicio: input.dataInicio || null,
        dataFim: input.dataFim || null,
        cidades: input.cidades ?? [],
        criadaEm: agora,
      })
      .returning();

    const contatoIdsViajantes: number[] = [];
    for (const c of input.contatos) {
      const telefone = normalizaTelefone(c.telefone);
      const email = normalizaEmail(c.email);
      let contatoId: number | undefined;
      if (c.contatoId) {
        const [existente] = await tx
          .select()
          .from(contatos)
          .where(eq(contatos.id, c.contatoId));
        if (!existente) throw new RegraViolada("Contato não encontrado.");
        contatoId = existente.id;
      }
      if (!contatoId && (telefone || email)) {
        const existentes = await tx
          .select({ id: contatos.id })
          .from(contatos)
          .where(
            or(
              telefone ? eq(contatos.telefone, telefone) : undefined,
              email ? eq(contatos.email, email) : undefined,
            ),
          )
          .limit(1);
        contatoId = existentes[0]?.id;
      }
      if (!contatoId) {
        const conhecidos = await tx
          .select({ id: contatos.id })
          .from(contatos)
          .where(sql`lower(trim(${contatos.nome}))=lower(trim(${c.nome}))`)
          .limit(2);
        if (conhecidos.length > 1)
          throw new RegraViolada("Selecione o contato na lista.");
        contatoId = conhecidos[0]?.id;
      }
      if (!contatoId) {
        const [novo] = await tx
          .insert(contatos)
          .values({ nome: c.nome, telefone, email })
          .returning({ id: contatos.id });
        contatoId = novo.id;
      }
      if (c.papeis.includes("viajante")) contatoIdsViajantes.push(contatoId);
      for (const papel of new Set(c.papeis)) {
        await tx
          .insert(viagemContatos)
          .values({ viagemId: viagem.id, contatoId, papel })
          .onConflictDoNothing();
      }
    }

    await criarViajantes(tx, viagem.id, input, contatoIdsViajantes);

    for (const [i, elo] of input.cadeia.entries()) {
      await tx.insert(cadeiaComercial).values({
        viagemId: viagem.id,
        ordem: i + 1,
        intermediarioId: elo.intermediarioId,
        especificou: elo.especificou || null,
      });
    }

    await tx
      .insert(responsaveis)
      .values({
        viagemId: viagem.id,
        usuarioId: input.responsavelId,
        desde: agora,
      });
    await criarTarefaAutomatica(tx, {
      viagemId: viagem.id,
      tipo: "responder",
      titulo: "Responder o primeiro contato",
      autorId,
      agora,
      chave: "responder:inicial",
      responsavelId: input.responsavelId,
      prazo: prazoPrimeiraResposta(input.canalComercial, agora),
    });
    if (input.nota?.trim()) {
      await tx
        .insert(notas)
        .values({
          viagemId: viagem.id,
          autorId,
          texto: input.nota.trim(),
          criadaEm: agora,
        });
    }

    return { id: viagem.id, codigo };
  });
}

/** Open Viagens that share a Contato with this one but come through a different Cadeia comercial. */
export async function conflitosDeCanal(viagemId: number) {
  const meus = db
    .select({ contatoId: viagemContatos.contatoId })
    .from(viagemContatos)
    .where(eq(viagemContatos.viagemId, viagemId));
  const outras = await db
    .selectDistinct({ id: viagens.id, codigo: viagens.codigo })
    .from(viagens)
    .innerJoin(viagemContatos, eq(viagemContatos.viagemId, viagens.id))
    .where(
      and(
        ne(viagens.id, viagemId),
        inArray(viagens.etapa, [...ETAPAS_ABERTAS]),
        inArray(viagemContatos.contatoId, meus),
      ),
    );
  if (outras.length === 0) return [];
  const cadeiaDe = async (id: number) =>
    (
      await db
        .select({ i: cadeiaComercial.intermediarioId })
        .from(cadeiaComercial)
        .where(eq(cadeiaComercial.viagemId, id))
        .orderBy(asc(cadeiaComercial.ordem))
    )
      .map((r) => r.i)
      .join(">");
  const minha = await cadeiaDe(viagemId);
  const conflitos = [];
  for (const o of outras)
    if ((await cadeiaDe(o.id)) !== minha) conflitos.push(o);
  return conflitos;
}

export async function registrarResposta(
  viagemId: number,
  agora: Date,
  autorId: number | null = null,
) {
  await db.transaction(async (tx) => {
    await tx
      .update(viagens)
      .set({ primeiraRespostaEm: agora })
      .where(and(eq(viagens.id, viagemId), isNull(viagens.primeiraRespostaEm)));
    await concluirAutomaticas(tx, viagemId, "responder", autorId, agora);
  });
}

export async function trocarResponsavel(
  viagemId: number,
  novoId: number,
  agora: Date,
  autorId: number | null = null,
) {
  await db.transaction(async (tx) => {
    const [atual] = await tx
      .select()
      .from(responsaveis)
      .where(
        and(eq(responsaveis.viagemId, viagemId), isNull(responsaveis.ate)),
      );
    if (atual?.usuarioId === novoId) return;
    if (atual)
      await tx
        .update(responsaveis)
        .set({ ate: agora })
        .where(eq(responsaveis.id, atual.id));
    await tx
      .insert(responsaveis)
      .values({ viagemId, usuarioId: novoId, desde: agora });
    await transferirAutomaticas(tx, viagemId, novoId, autorId, agora);
  });
}

export async function descartar(
  viagemId: number,
  motivo: string,
  agora: Date,
  autorId: number | null = null,
) {
  if (!motivo.trim()) throw new RegraViolada("Informe o motivo.");
  await db.transaction((tx) =>
    registrarFato(tx, viagemId, "descarte", autorId, agora, motivo),
  );
}

export async function adicionarNota(
  viagemId: number,
  autorId: number,
  texto: string,
  agora: Date,
) {
  if (!texto.trim()) return;
  await db
    .insert(notas)
    .values({ viagemId, autorId, texto: texto.trim(), criadaEm: agora });
}

export async function pipeline(
  agora: Date,
  pagina: number,
  usuario: { id: number; papel: string },
) {
  const rows = await db
    .select({
      id: viagens.id,
      codigo: viagens.codigo,
      etapa: viagens.etapa,
      canalComercial: viagens.canalComercial,
      criadaEm: viagens.criadaEm,
      primeiraRespostaEm: viagens.primeiraRespostaEm,
      semRespostaDesde: viagens.semRespostaDesde,
      dataInicio: viagens.dataInicio,
      responsavel: usuarios.nome,
      contato: sql<
        string | null
      >`(select c.nome from viagem_contatos vc join contatos c on c.id = vc.contato_id where vc.viagem_id = ${viagens.id} order by vc.papel limit 1)`,
    })
    .from(viagens)
    .innerJoin(
      responsaveis,
      and(eq(responsaveis.viagemId, viagens.id), isNull(responsaveis.ate)),
    )
    .innerJoin(usuarios, eq(usuarios.id, responsaveis.usuarioId))
    .where(inArray(viagens.etapa, [...ETAPAS_ABERTAS]))
    .orderBy(desc(viagens.criadaEm), desc(viagens.id))
    .limit(51)
    .offset((pagina - 1) * 50);

  const proximas = await proximasTarefas(
    rows.map((r) => r.id),
    usuario,
  );
  return rows.map((r) => {
    const proxima = proximas.find((t) => t.viagemId === r.id);
    const prazo = proxima?.prazo ?? null;
    return {
      ...r,
      acao: proxima?.titulo ?? null,
      prazo,
      atrasada: prazo ? prazo.getTime() < agora.getTime() : false,
      semResposta24h: semRespostaHumana(
        {
          etapa: r.etapa as Etapa,
          criadaEm: r.criadaEm,
          primeiraRespostaEm: r.primeiraRespostaEm,
        },
        agora,
      ),
    };
  });
}

export async function detalhe(
  id: number,
  usuario: { id: number; papel: string },
) {
  const [v] = await db.select().from(viagens).where(eq(viagens.id, id));
  if (!v) return null;
  const [
    pessoas,
    cadeia,
    historico,
    acoes,
    notasDaViagem,
    conflitos,
    listaViajantes,
  ] = await Promise.all([
    db
      .select({
        id: contatos.id,
        nome: contatos.nome,
        numero: contatos.numero,
        telefone: contatos.telefone,
        email: contatos.email,
        papel: viagemContatos.papel,
      })
      .from(viagemContatos)
      .innerJoin(contatos, eq(contatos.id, viagemContatos.contatoId))
      .where(eq(viagemContatos.viagemId, id)),
    db
      .select({
        ordem: cadeiaComercial.ordem,
        nome: intermediarios.nome,
        tipo: intermediarios.tipo,
        especificou: cadeiaComercial.especificou,
      })
      .from(cadeiaComercial)
      .innerJoin(
        intermediarios,
        eq(intermediarios.id, cadeiaComercial.intermediarioId),
      )
      .where(eq(cadeiaComercial.viagemId, id))
      .orderBy(asc(cadeiaComercial.ordem)),
    db
      .select({
        nome: usuarios.nome,
        usuarioId: responsaveis.usuarioId,
        desde: responsaveis.desde,
        ate: responsaveis.ate,
      })
      .from(responsaveis)
      .innerJoin(usuarios, eq(usuarios.id, responsaveis.usuarioId))
      .where(eq(responsaveis.viagemId, id))
      .orderBy(asc(responsaveis.desde)),
    tarefasDaViagem(id, usuario),
    db
      .select({
        texto: notas.texto,
        criadaEm: notas.criadaEm,
        autor: usuarios.nome,
      })
      .from(notas)
      .innerJoin(usuarios, eq(usuarios.id, notas.autorId))
      .where(eq(notas.viagemId, id))
      .orderBy(desc(notas.criadaEm)),
    conflitosDeCanal(id),
    listarViajantes(id),
  ]);
  return {
    viagem: { ...v, ...resumirViajantes(listaViajantes) },
    viajantes: listaViajantes,
    pessoas,
    cadeia,
    historico,
    acoes,
    notas: notasDaViagem,
    conflitos,
  };
}

export async function buscar(q: string) {
  const termo = q.trim();
  if (termo.length < 2) return [];
  const like = `%${termo}%`;
  return db
    .selectDistinct({
      id: viagens.id,
      codigo: viagens.codigo,
      etapa: viagens.etapa,
      contato: contatos.nome,
    })
    .from(viagens)
    .leftJoin(viagemContatos, eq(viagemContatos.viagemId, viagens.id))
    .leftJoin(contatos, eq(contatos.id, viagemContatos.contatoId))
    .leftJoin(cadeiaComercial, eq(cadeiaComercial.viagemId, viagens.id))
    .leftJoin(
      intermediarios,
      eq(intermediarios.id, cadeiaComercial.intermediarioId),
    )
    .where(
      or(
        ilike(viagens.codigo, like),
        ilike(contatos.nome, like),
        ilike(contatos.telefone, `%${termo.replace(/\D/g, "") || termo}%`),
        ilike(contatos.email, like),
        ilike(intermediarios.nome, like),
      ),
    )
    .limit(10);
}

export async function listarUsuarios() {
  return db
    .select({ id: usuarios.id, nome: usuarios.nome })
    .from(usuarios)
    .where(eq(usuarios.ativo, true))
    .orderBy(asc(usuarios.nome));
}

export async function listarIntermediarios() {
  return db.select().from(intermediarios).orderBy(asc(intermediarios.nome));
}

export async function listarContatos() {
  return db
    .select()
    .from(contatos)
    .where(ne(contatos.nome, ""))
    .orderBy(asc(contatos.nome));
}
