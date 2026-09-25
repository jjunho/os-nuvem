import { and, desc, eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  contatos,
  enviosProposta,
  orcamentos,
  usuarios,
  viagemContatos,
  viagens,
} from "~/db/schema";
import { registrarFato } from "~/modules/viagens/etapas.server";
import { avisar, entregarPush } from "~/modules/notificacoes/push.server";
import { calcularOpcao } from "./calculo";
import { lerOrcamento } from "./orcamentos.server";
import {
  condicoesPadrao,
  localizarCondicoes,
  type MemoriaOrcamento,
} from "./versoes";
export async function destinatarioDaViagem(viagemId: number) {
  const pessoas = await db
    .select({ nome: contatos.nome, papel: viagemContatos.papel })
    .from(viagemContatos)
    .innerJoin(contatos, eq(contatos.id, viagemContatos.contatoId))
    .where(eq(viagemContatos.viagemId, viagemId));
  return (
    pessoas.find((p) => p.papel === "solicitante")?.nome ??
    pessoas[0]?.nome ??
    ""
  );
}
export async function listarEnvios(viagemId: number) {
  return db
    .select({
      id: enviosProposta.id,
      orcamentoId: orcamentos.id,
      versao: orcamentos.versao,
      destinatario: enviosProposta.destinatario,
      canal: enviosProposta.canal,
      enviadoEm: enviosProposta.enviadoEm,
      autor: usuarios.nome,
    })
    .from(enviosProposta)
    .innerJoin(orcamentos, eq(orcamentos.id, enviosProposta.orcamentoId))
    .innerJoin(usuarios, eq(usuarios.id, enviosProposta.autorId))
    .where(eq(orcamentos.viagemId, viagemId))
    .orderBy(desc(enviosProposta.id));
}
export async function enviarOrcamento(
  id: number,
  autorId: number,
  destinatario: string,
  canal: string,
  agora: Date,
  revisao: number,
) {
  if (!destinatario.trim() || !canal.trim())
    throw new Response("Informe destinatário e canal", { status: 400 });
  await db.transaction(async (tx) => {
    const [atual] = await tx
      .select()
      .from(orcamentos)
      .where(eq(orcamentos.id, id))
      .for("update");
    if (!atual) throw new Response("Orçamento não encontrado", { status: 404 });
    if (atual.revisao !== revisao)
      throw new Response(
        "O orçamento mudou ou já foi enviado. Recarregue antes de editar.",
        { status: 409 },
      );
    const d = await lerOrcamento(id);
    if (atual.estado === "aceito")
      throw new Response("Proposta já aceita", { status: 400 });
    let memoria = atual.memoria;
    if (!memoria) {
      const calculos = atual.dados.opcoes.map((o) =>
        calcularOpcao(o, {
          canal: atual.dados.canal,
          categoria: o.categoria ?? atual.dados.categoria,
          referencias: d.referencias,
          viajantes: d.pessoas,
          malasPorPessoa: d.pessoas.length
            ? d.pessoas.reduce((s, p) => s + p.malas, 0) / d.pessoas.length
            : 2,
        }),
      );
      for (const c of calculos) {
        if (c.porPessoa === null)
          throw new Response("Informe os pagantes antes de enviar", {
            status: 400,
          });
        for (const l of c.linhas) {
          if (l.terceiro || l.quantidade === 0) continue;
          if (l.total === null)
            throw new Response(`${l.nome}: a informar; registre o custo real`, {
              status: 400,
            });
          if (
            l.total > 0 &&
            !l.regra &&
            !l.item &&
            l.custoRealUSD === undefined
          )
            throw new Response(
              `${l.nome}: informe o custo real antes de enviar`,
              { status: 400 },
            );
          if (l.hotel && l.total > 0 && (!l.hotel.fonte || !l.hotel.dataFonte))
            throw new Response(`${l.nome}: informe fonte e data da cotação`, {
              status: 400,
            });
        }
      }
      const condicoes = localizarCondicoes(
        atual.dados.condicoes ?? condicoesPadrao,
        d.viagem.idiomaCliente,
      );
      memoria = {
        numero: `P${String(agora.getUTCFullYear()).slice(-2)}-${String(atual.id).padStart(6, "0")}`,
        versao: atual.versao,
        enviadaEm: agora.toISOString(),
        validadeAte: new Date(
          agora.getTime() + condicoes.validadeDias * 86400000,
        ).toISOString(),
        cliente: await destinatarioDaViagem(atual.viagemId),
        idioma: d.viagem.idiomaCliente,
        marca: d.viagem.marca,
        viagemCodigo: d.viagem.codigo,
        dados: atual.dados,
        referencias: d.referencias,
        versoesTabelas: atual.referencias,
        pessoas: d.pessoas.map((p) => ({
          id: p.id,
          nome: p.nome,
          idade: p.idade,
          pagante: p.pagante,
        })),
        calculos,
        condicoes,
      };
    }
    // Each recorded delivery consumes the expected revision, including resends.
    // A retry after a lost acknowledgement cannot record the same delivery twice.
    await tx
      .update(orcamentos)
      .set({ memoria, estado: "enviado", revisao: atual.revisao + 1 })
      .where(eq(orcamentos.id, id));
    await tx
      .update(viagens)
      .set({ semRespostaDesde: null })
      .where(eq(viagens.id, atual.viagemId));
    await tx
      .insert(enviosProposta)
      .values({
        orcamentoId: id,
        destinatario: destinatario.trim(),
        canal: canal.trim(),
        enviadoEm: agora,
        autorId,
      })
      .returning();
    await registrarFato(
      tx,
      atual.viagemId,
      "envio",
      autorId,
      agora,
      memoria.numero,
    );
    for (const [i, c] of memoria.calculos.entries())
      if (c.margemReal !== null && c.margemReal < (c.pisoMargem ?? 0.1)) {
        const admins = await tx
          .select({ id: usuarios.id })
          .from(usuarios)
          .where(and(eq(usuarios.papel, "admin"), eq(usuarios.ativo, true)));
        await avisar(
          tx,
          admins.map((u) => u.id),
          {
            titulo: `Proposta com margem abaixo de ${(c.pisoMargem ?? 0.1) * 100}%`,
            texto: `${memoria.numero} · ${memoria.dados.opcoes[i].motivoMargem ?? "Motivo não informado"}`,
            url: `/orcamentos/${id}`,
            chave: `margem:${id}:${i}`,
            criadaEm: agora,
          },
        );
      }
  });
  await entregarPush();
}
export async function iniciarNovaVersao(
  id: number,
  autorId: number,
  agora: Date,
) {
  return db.transaction(async (tx) => {
    const [base] = await tx
      .select()
      .from(orcamentos)
      .where(eq(orcamentos.id, id));
    if (!base?.memoria)
      throw new Response("Envie a versão atual primeiro", { status: 400 });
    await tx
      .select()
      .from(viagens)
      .where(eq(viagens.id, base.viagemId))
      .for("update");
    const [ultima] = await tx
      .select()
      .from(orcamentos)
      .where(eq(orcamentos.viagemId, base.viagemId))
      .orderBy(desc(orcamentos.versao))
      .limit(1);
    if (ultima.estado === "rascunho") return ultima;
    const [nova] = await tx
      .insert(orcamentos)
      .values({
        viagemId: base.viagemId,
        versao: ultima.versao + 1,
        dados: base.memoria.dados,
        referencias: base.referencias,
        criadaPor: autorId,
        criadaEm: agora,
      })
      .returning();
    await registrarFato(tx, base.viagemId, "nova_versao", autorId, agora);
    return nova;
  });
}
