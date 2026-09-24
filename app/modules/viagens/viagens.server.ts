import { and, asc, desc, eq, ilike, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  cadeiaComercial,
  contatos,
  intermediarios,
  notas,
  proximasAcoes,
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
  nome: string;
  telefone?: string | null;
  email?: string | null;
  papeis: ("solicitante" | "viajante")[];
};

export type NovaViagem = {
  responsavelId: number;
  canalComercial: CanalComercial;
  categoria: "economico" | "padrao" | "premium" | "vip";
  marca: "corealux" | "guia_na_coreia";
  origem: "instagram" | "site" | "indicacao" | "agencia" | "operadora" | "influenciador" | "outra";
  indicadoPor?: string | null;
  idiomaCliente: "pt" | "es" | "en" | "fr";
  idiomaGuiamento: "pt" | "es" | "en" | "fr";
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

const normalizaTelefone = (t?: string | null) => (t ? t.replace(/\D/g, "") || null : null);
const normalizaEmail = (e?: string | null) => (e ? e.trim().toLowerCase() || null : null);

export async function criarViagem(input: NovaViagem, autorId: number, agora: Date) {
  if (!input.responsavelId) throw new RegraViolada("Toda Viagem nasce com um Responsável.");
  if (input.contatos.length === 0) throw new RegraViolada("Informe ao menos um Contato.");

  return db.transaction(async (tx) => {
    const ano = agora.getFullYear();
    // Serialize code generation per year.
    await tx.execute(sql`select pg_advisory_xact_lock(${ano})`);
    const [{ n }] = await tx
      .select({ n: sql<number>`count(*)::int` })
      .from(viagens)
      .where(sql`${viagens.codigo} like ${`V${String(ano % 100).padStart(2, "0")}-%`}`);
    const codigo = codigoDaViagem(ano, n + 1);

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
        pagantes: input.pagantes ?? null,
        gratuidades: input.gratuidades ?? 0,
        adultos: input.adultos ?? null,
        idadesCriancas: input.idadesCriancas ?? [],
        bebes: input.bebes ?? 0,
        cidades: input.cidades ?? [],
        criadaEm: agora,
      })
      .returning();

    for (const c of input.contatos) {
      const telefone = normalizaTelefone(c.telefone);
      const email = normalizaEmail(c.email);
      let contatoId: number | undefined;
      if (telefone || email) {
        const existentes = await tx
          .select({ id: contatos.id })
          .from(contatos)
          .where(or(telefone ? eq(contatos.telefone, telefone) : undefined, email ? eq(contatos.email, email) : undefined))
          .limit(1);
        contatoId = existentes[0]?.id;
      }
      if (!contatoId) {
        const [novo] = await tx.insert(contatos).values({ nome: c.nome, telefone, email }).returning({ id: contatos.id });
        contatoId = novo.id;
      }
      for (const papel of new Set(c.papeis)) {
        await tx.insert(viagemContatos).values({ viagemId: viagem.id, contatoId, papel }).onConflictDoNothing();
      }
    }

    for (const [i, elo] of input.cadeia.entries()) {
      await tx.insert(cadeiaComercial).values({
        viagemId: viagem.id,
        ordem: i + 1,
        intermediarioId: elo.intermediarioId,
        especificou: elo.especificou || null,
      });
    }

    await tx.insert(responsaveis).values({ viagemId: viagem.id, usuarioId: input.responsavelId, desde: agora });
    await tx.insert(proximasAcoes).values({
      viagemId: viagem.id,
      tipo: "responder",
      descricao: "Responder o primeiro contato",
      responsavelId: input.responsavelId,
      prazo: prazoPrimeiraResposta(input.canalComercial, agora),
    });
    if (input.nota?.trim()) {
      await tx.insert(notas).values({ viagemId: viagem.id, autorId, texto: input.nota.trim(), criadaEm: agora });
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
  for (const o of outras) if ((await cadeiaDe(o.id)) !== minha) conflitos.push(o);
  return conflitos;
}

export async function registrarResposta(viagemId: number, agora: Date) {
  await db.transaction(async (tx) => {
    await tx
      .update(viagens)
      .set({ primeiraRespostaEm: agora })
      .where(and(eq(viagens.id, viagemId), isNull(viagens.primeiraRespostaEm)));
    await tx
      .update(proximasAcoes)
      .set({ concluidaEm: agora })
      .where(and(eq(proximasAcoes.viagemId, viagemId), eq(proximasAcoes.tipo, "responder"), isNull(proximasAcoes.concluidaEm)));
  });
}

export async function trocarResponsavel(viagemId: number, novoId: number, agora: Date) {
  await db.transaction(async (tx) => {
    const [atual] = await tx
      .select()
      .from(responsaveis)
      .where(and(eq(responsaveis.viagemId, viagemId), isNull(responsaveis.ate)));
    if (atual?.usuarioId === novoId) return;
    if (atual) await tx.update(responsaveis).set({ ate: agora }).where(eq(responsaveis.id, atual.id));
    await tx.insert(responsaveis).values({ viagemId, usuarioId: novoId, desde: agora });
    await tx
      .update(proximasAcoes)
      .set({ responsavelId: novoId })
      .where(and(eq(proximasAcoes.viagemId, viagemId), isNull(proximasAcoes.concluidaEm)));
  });
}

export async function descartar(viagemId: number, motivo: string, agora: Date) {
  const [v] = await db.select({ etapa: viagens.etapa }).from(viagens).where(eq(viagens.id, viagemId));
  if (!v) throw new RegraViolada("Viagem não encontrada.");
  if (!podeDescartar(v.etapa)) throw new RegraViolada("Só um lead pode ser descartado.");
  if (!motivo.trim()) throw new RegraViolada("Informe o motivo.");
  await db.transaction(async (tx) => {
    await tx.update(viagens).set({ etapa: "descartada", motivoEncerramento: motivo.trim() }).where(eq(viagens.id, viagemId));
    await tx
      .update(proximasAcoes)
      .set({ concluidaEm: agora })
      .where(and(eq(proximasAcoes.viagemId, viagemId), isNull(proximasAcoes.concluidaEm)));
  });
}

export async function adicionarNota(viagemId: number, autorId: number, texto: string, agora: Date) {
  if (!texto.trim()) return;
  await db.insert(notas).values({ viagemId, autorId, texto: texto.trim(), criadaEm: agora });
}

export async function pipeline(agora: Date) {
  const rows = await db
    .select({
      id: viagens.id,
      codigo: viagens.codigo,
      etapa: viagens.etapa,
      canalComercial: viagens.canalComercial,
      criadaEm: viagens.criadaEm,
      primeiraRespostaEm: viagens.primeiraRespostaEm,
      dataInicio: viagens.dataInicio,
      responsavel: usuarios.nome,
      contato: sql<string | null>`(select c.nome from viagem_contatos vc join contatos c on c.id = vc.contato_id where vc.viagem_id = ${viagens.id} order by vc.papel limit 1)`,
      acao: sql<string | null>`(select pa.descricao from proximas_acoes pa where pa.viagem_id = ${viagens.id} and pa.concluida_em is null order by pa.prazo limit 1)`,
      prazo: sql<Date | null>`(select min(pa.prazo) from proximas_acoes pa where pa.viagem_id = ${viagens.id} and pa.concluida_em is null)`,
    })
    .from(viagens)
    .innerJoin(responsaveis, and(eq(responsaveis.viagemId, viagens.id), isNull(responsaveis.ate)))
    .innerJoin(usuarios, eq(usuarios.id, responsaveis.usuarioId))
    .where(inArray(viagens.etapa, [...ETAPAS_ABERTAS]))
    .orderBy(desc(viagens.criadaEm))
    .limit(500);

  return rows.map((r) => {
    const prazo = r.prazo ? new Date(r.prazo) : null;
    return {
      ...r,
      prazo,
      atrasada: prazo ? prazo.getTime() < agora.getTime() : false,
      semResposta24h: semRespostaHumana(
        { etapa: r.etapa as Etapa, criadaEm: r.criadaEm, primeiraRespostaEm: r.primeiraRespostaEm },
        agora,
      ),
    };
  });
}

export async function detalhe(id: number) {
  const [v] = await db.select().from(viagens).where(eq(viagens.id, id));
  if (!v) return null;
  const [pessoas, cadeia, historico, acoes, notasDaViagem, conflitos] = await Promise.all([
    db
      .select({ id: contatos.id, nome: contatos.nome, telefone: contatos.telefone, email: contatos.email, papel: viagemContatos.papel })
      .from(viagemContatos)
      .innerJoin(contatos, eq(contatos.id, viagemContatos.contatoId))
      .where(eq(viagemContatos.viagemId, id)),
    db
      .select({ ordem: cadeiaComercial.ordem, nome: intermediarios.nome, tipo: intermediarios.tipo, especificou: cadeiaComercial.especificou })
      .from(cadeiaComercial)
      .innerJoin(intermediarios, eq(intermediarios.id, cadeiaComercial.intermediarioId))
      .where(eq(cadeiaComercial.viagemId, id))
      .orderBy(asc(cadeiaComercial.ordem)),
    db
      .select({ nome: usuarios.nome, usuarioId: responsaveis.usuarioId, desde: responsaveis.desde, ate: responsaveis.ate })
      .from(responsaveis)
      .innerJoin(usuarios, eq(usuarios.id, responsaveis.usuarioId))
      .where(eq(responsaveis.viagemId, id))
      .orderBy(asc(responsaveis.desde)),
    db
      .select({ id: proximasAcoes.id, descricao: proximasAcoes.descricao, prazo: proximasAcoes.prazo, concluidaEm: proximasAcoes.concluidaEm, responsavel: usuarios.nome })
      .from(proximasAcoes)
      .innerJoin(usuarios, eq(usuarios.id, proximasAcoes.responsavelId))
      .where(eq(proximasAcoes.viagemId, id))
      .orderBy(asc(proximasAcoes.prazo)),
    db
      .select({ texto: notas.texto, criadaEm: notas.criadaEm, autor: usuarios.nome })
      .from(notas)
      .innerJoin(usuarios, eq(usuarios.id, notas.autorId))
      .where(eq(notas.viagemId, id))
      .orderBy(desc(notas.criadaEm)),
    conflitosDeCanal(id),
  ]);
  return { viagem: v, pessoas, cadeia, historico, acoes, notas: notasDaViagem, conflitos };
}

export async function buscar(q: string) {
  const termo = q.trim();
  if (termo.length < 2) return [];
  const like = `%${termo}%`;
  return db
    .selectDistinct({ id: viagens.id, codigo: viagens.codigo, etapa: viagens.etapa, contato: contatos.nome })
    .from(viagens)
    .leftJoin(viagemContatos, eq(viagemContatos.viagemId, viagens.id))
    .leftJoin(contatos, eq(contatos.id, viagemContatos.contatoId))
    .leftJoin(cadeiaComercial, eq(cadeiaComercial.viagemId, viagens.id))
    .leftJoin(intermediarios, eq(intermediarios.id, cadeiaComercial.intermediarioId))
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
  return db.select({ id: usuarios.id, nome: usuarios.nome }).from(usuarios).where(eq(usuarios.ativo, true)).orderBy(asc(usuarios.nome));
}

export async function listarIntermediarios() {
  return db.select().from(intermediarios).orderBy(asc(intermediarios.nome));
}
