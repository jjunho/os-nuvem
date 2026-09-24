import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  anexosPlanejamento,
  contatos,
  respostasConflitantes,
  formulariosPlanejamento,
  viagemContatos,
  viagens,
  viajantes,
} from "~/db/schema";
import { criarViajantes, listarViajantes } from "./viajantes.server";
import { listarOpcoes, registrarOpcao } from "~/modules/opcoes/opcoes.server";
const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function gerarFormulario(viagemId: number, agora: Date) {
  const token = randomBytes(32).toString("hex");
  await db
    .insert(formulariosPlanejamento)
    .values({ viagemId, tokenHash: hash(token), criadoEm: agora });
  return `/planejamento/${token}`;
}
export async function revogarFormularios(viagemId: number, agora: Date) {
  await db
    .update(formulariosPlanejamento)
    .set({ revogadoEm: agora })
    .where(eq(formulariosPlanejamento.viagemId, viagemId));
}
async function formularioValido(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token))
    throw new Response("Não encontrado", { status: 404 });
  const [link] = await db
    .select()
    .from(formulariosPlanejamento)
    .where(
      and(
        eq(formulariosPlanejamento.tokenHash, hash(token)),
        isNull(formulariosPlanejamento.revogadoEm),
      ),
    );
  if (!link) throw new Response("Não encontrado", { status: 404 });
  return link;
}
export async function lerFormulario(token: string) {
  const link = await formularioValido(token);
  const [v] = await db
    .select()
    .from(viagens)
    .where(eq(viagens.id, link.viagemId));
  const pessoas = await listarViajantes(link.viagemId);
  return {
    idioma: v.idiomaCliente,
    viagem: {
      dataInicio: v.dataInicio,
      dataFim: v.dataFim,
      hotelNome: v.hotelNome,
      hotelEndereco: v.hotelEndereco,
      nivelRestaurante: v.nivelRestaurante,
      ritmo: v.ritmo,
      interesses: v.interesses,
      pontosDesejados: v.pontosDesejados,
    },
    pessoas: pessoas.map(({ id, nome, idade, mobilidade, alimentacao }) => ({
      id,
      nome,
      idade,
      mobilidade,
      alimentacao,
    })),
    hoteis: await listarOpcoes("hotelNome", "pt"),
  };
}
export async function receberFormulario(token: string, form: FormData) {
  const link = await formularioValido(token);
  await db.transaction(async (tx) => {
    const [ativo] = await tx
      .select()
      .from(formulariosPlanejamento)
      .where(
        and(
          eq(formulariosPlanejamento.id, link.id),
          isNull(formulariosPlanejamento.revogadoEm),
        ),
      )
      .for("update");
    if (!ativo) throw new Response("Não encontrado", { status: 404 });
    await aplicarRespostas(tx, link.viagemId, form);
  });
}

type Transacao = Parameters<Parameters<typeof db.transaction>[0]>[0];
async function guardarConflito(
  tx: Transacao,
  viagemId: number,
  viajanteId: number | null,
  campo: string,
  anterior: string,
  recebido: string,
) {
  const [existente] = await tx
    .select()
    .from(respostasConflitantes)
    .where(
      and(
        eq(respostasConflitantes.viagemId, viagemId),
        viajanteId === null
          ? isNull(respostasConflitantes.viajanteId)
          : eq(respostasConflitantes.viajanteId, viajanteId),
        eq(respostasConflitantes.campo, campo),
        eq(respostasConflitantes.recebido, recebido),
        isNull(respostasConflitantes.resolvidaEm),
      ),
    );
  if (!existente)
    await tx
      .insert(respostasConflitantes)
      .values({ viagemId, viajanteId, campo, anterior, recebido });
}
const camposViagem = [
  "dataInicio",
  "dataFim",
  "hotelNome",
  "hotelEndereco",
  "nivelRestaurante",
  "ritmo",
  "interesses",
  "pontosDesejados",
] as const;
async function valorAtual(
  conexao: Pick<typeof db, "select">,
  c: typeof respostasConflitantes.$inferSelect,
) {
  if (!c.viajanteId) {
    const [v] = await conexao
      .select()
      .from(viagens)
      .where(eq(viagens.id, c.viagemId));
    const campo = camposViagem.find((campo) => campo === c.campo);
    if (!v || !campo) throw new Response("Campo inválido", { status: 400 });
    return String(v[campo] ?? "");
  }
  const [p] = await conexao
    .select()
    .from(viajantes)
    .where(
      and(eq(viajantes.id, c.viajanteId), eq(viajantes.viagemId, c.viagemId)),
    );
  if (!p) throw new Response("Viajante não encontrado", { status: 404 });
  if (c.campo === "idade") return String(p.idade ?? "");
  const [contato] = p.contatoId
    ? await conexao.select().from(contatos).where(eq(contatos.id, p.contatoId))
    : [];
  const campo = (["nome", "mobilidade", "alimentacao"] as const).find(
    (campo) => campo === c.campo,
  );
  if (!campo) throw new Response("Campo inválido", { status: 400 });
  return String(contato?.[campo] ?? "");
}
export async function listarRespostasConflitantes(viagemId: number) {
  const conflitos = await db
    .select()
    .from(respostasConflitantes)
    .where(
      and(
        eq(respostasConflitantes.viagemId, viagemId),
        isNull(respostasConflitantes.resolvidaEm),
      ),
    );
  return Promise.all(
    conflitos.map(async (c) => ({ ...c, atual: await valorAtual(db, c) })),
  );
}
export async function resolverResposta(
  viagemId: number,
  id: number,
  usar: boolean,
  esperado: string,
  agora: Date,
) {
  await db.transaction(async (tx) => {
    await tx
      .select()
      .from(viagens)
      .where(eq(viagens.id, viagemId))
      .for("update");
    const [c] = await tx
      .select()
      .from(respostasConflitantes)
      .where(
        and(
          eq(respostasConflitantes.id, id),
          eq(respostasConflitantes.viagemId, viagemId),
          isNull(respostasConflitantes.resolvidaEm),
        ),
      )
      .for("update");
    if (!c) throw new Response("Resposta não encontrada", { status: 404 });
    if (usar) {
      if ((await valorAtual(tx, c)) !== esperado)
        throw new Response("Os dados mudaram. Recarregue antes de escolher.", {
          status: 409,
        });
      if (!c.viajanteId) {
        const campo = camposViagem.find((campo) => campo === c.campo)!;
        const valor = ["hotelNome", "nivelRestaurante", "ritmo"].includes(campo)
          ? await registrarOpcao(campo, c.recebido)
          : c.recebido;
        await tx
          .update(viagens)
          .set({ [campo]: valor })
          .where(eq(viagens.id, viagemId));
      } else if (c.campo === "idade")
        await tx
          .update(viajantes)
          .set({ idade: Number(c.recebido) })
          .where(eq(viajantes.id, c.viajanteId));
      else {
        const [p] = await tx
          .select()
          .from(viajantes)
          .where(eq(viajantes.id, c.viajanteId));
        if (!p.contatoId)
          throw new Response("Contato não encontrado", { status: 404 });
        await tx
          .update(contatos)
          .set({ [c.campo]: c.recebido })
          .where(eq(contatos.id, p.contatoId));
      }
    }
    await tx
      .update(respostasConflitantes)
      .set({ resolvidaEm: agora })
      .where(eq(respostasConflitantes.id, id));
  });
}

async function aplicarRespostas(
  tx: Transacao,
  viagemId: number,
  form: FormData,
) {
  const [v] = await tx
    .select()
    .from(viagens)
    .where(eq(viagens.id, viagemId))
    .for("update");
  const novos: Partial<typeof viagens.$inferInsert> = {};
  for (const campo of [
    "dataInicio",
    "dataFim",
    "hotelNome",
    "hotelEndereco",
    "nivelRestaurante",
    "ritmo",
    "interesses",
    "pontosDesejados",
  ] as const) {
    if (!form.has(campo)) continue;
    let valor = String(form.get(campo) ?? "").trim();
    if (!valor || valor === v[campo]) continue;
    if (v[campo]) {
      await guardarConflito(tx, v.id, null, campo, v[campo]!, valor);
      continue;
    }
    if (["hotelNome", "nivelRestaurante", "ritmo"].includes(campo))
      valor = await registrarOpcao(campo, valor);
    novos[campo] = valor;
  }
  for (const campo of ["dataInicio", "dataFim"] as const)
    if (novos[campo] && !/^\d{4}-\d{2}-\d{2}$/.test(novos[campo]!))
      throw new Response("Data inválida", { status: 400 });
  const inicio = novos.dataInicio ?? v.dataInicio,
    fim = novos.dataFim ?? v.dataFim;
  if (inicio && fim && inicio > fim)
    throw new Response("Datas inválidas", { status: 400 });
  if (Object.keys(novos).length)
    await tx.update(viagens).set(novos).where(eq(viagens.id, v.id));
  const pessoas = await tx
    .select()
    .from(viajantes)
    .where(eq(viajantes.viagemId, v.id))
    .for("update");
  if (!pessoas.length && form.has("pagantes"))
    await criarViajantes(
      tx,
      v.id,
      {
        pagantes: Number(form.get("pagantes")),
        gratuidades: Number(form.get("gratuidades")),
      },
      [],
    );
  for (const pessoa of pessoas) {
    const prefixo = `pessoas.${pessoa.id}.`;
    const [contato] = pessoa.contatoId
      ? await tx
          .select()
          .from(contatos)
          .where(eq(contatos.id, pessoa.contatoId))
          .for("update")
      : [];
    const dados: { nome?: string; mobilidade?: string; alimentacao?: string } =
      {};
    for (const campo of ["nome", "mobilidade", "alimentacao"] as const) {
      const valor = String(form.get(prefixo + campo) ?? "").trim();
      if (!valor || valor === contato?.[campo]) continue;
      if (contato?.[campo]) {
        await guardarConflito(
          tx,
          v.id,
          pessoa.id,
          campo,
          contato[campo]!,
          valor,
        );
        continue;
      }
      dados[campo] = valor;
    }
    if (Object.keys(dados).length) {
      if (contato)
        await tx.update(contatos).set(dados).where(eq(contatos.id, contato.id));
      else {
        const [novo] = await tx
          .insert(contatos)
          .values({ nome: "", ...dados })
          .returning();
        await tx
          .update(viajantes)
          .set({ contatoId: novo.id })
          .where(eq(viajantes.id, pessoa.id));
        await tx
          .insert(viagemContatos)
          .values({ viagemId: v.id, contatoId: novo.id, papel: "viajante" })
          .onConflictDoNothing();
      }
    }
    const idade = form.get(prefixo + "idade");
    if (idade !== null && idade !== "") {
      const valor = Number(idade);
      if (!Number.isInteger(valor) || valor < 0 || valor > 120)
        throw new Response("Idade inválida", { status: 400 });
      if (pessoa.idade !== null && pessoa.idade !== valor) {
        await guardarConflito(
          tx,
          v.id,
          pessoa.id,
          "idade",
          String(pessoa.idade),
          String(valor),
        );
        continue;
      }
      await tx
        .update(viajantes)
        .set({ idade: valor })
        .where(eq(viajantes.id, pessoa.id));
    }
  }
}

export async function guardarRespostasRecebidas(
  viagemId: number,
  autorId: number,
  form: FormData,
  agora: Date,
) {
  const texto = String(form.get("textoRecebido") ?? "").trim();
  const arquivo = form.get("arquivo");
  const arquivos: { nome: string; tipo: string; conteudo: Buffer }[] = [];
  if (texto)
    arquivos.push({
      nome: "Respostas coladas.txt",
      tipo: "text/plain",
      conteudo: Buffer.from(texto),
    });
  if (arquivo instanceof File && arquivo.size) {
    if (arquivo.size > 10 * 1024 * 1024)
      throw new Response("Arquivo maior que 10 MB", { status: 400 });
    arquivos.push({
      nome: arquivo.name,
      tipo: arquivo.type || "application/octet-stream",
      conteudo: Buffer.from(await arquivo.arrayBuffer()),
    });
  }
  const campos: Record<string, string> = {
    hotel: "hotelNome",
    chegada: "dataInicio",
    partida: "dataFim",
    "endereco do hotel": "hotelEndereco",
    "nivel de restaurante": "nivelRestaurante",
    ritmo: "ritmo",
    interesses: "interesses",
    "pontos que gostaria": "pontosDesejados",
  };
  const respostas = new FormData();
  for (const linha of texto.split(/\r?\n/)) {
    const partes = /^([^:]+):\s*(.+)$/.exec(linha);
    if (!partes) continue;
    const campo =
      campos[
        partes[1]
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLocaleLowerCase()
      ];
    if (campo) respostas.set(campo, partes[2].trim());
  }
  await db.transaction(async (tx) => {
    await aplicarRespostas(tx, viagemId, respostas);
    if (arquivos.length)
      await tx
        .insert(anexosPlanejamento)
        .values(
          arquivos.map((a) => ({ ...a, viagemId, autorId, criadoEm: agora })),
        );
  });
}
export async function listarAnexosPlanejamento(viagemId: number) {
  return db
    .select({ id: anexosPlanejamento.id, nome: anexosPlanejamento.nome })
    .from(anexosPlanejamento)
    .where(eq(anexosPlanejamento.viagemId, viagemId));
}
export async function lerAnexoPlanejamento(viagemId: number, id: number) {
  const [anexo] = await db
    .select()
    .from(anexosPlanejamento)
    .where(
      and(
        eq(anexosPlanejamento.id, id),
        eq(anexosPlanejamento.viagemId, viagemId),
      ),
    );
  if (!anexo) throw new Response("Anexo não encontrado", { status: 404 });
  return anexo;
}
