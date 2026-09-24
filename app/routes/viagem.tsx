import { aceiteDaViagem } from "~/modules/orcamentos/aceite.server";
import { atualizarFollowups } from "~/modules/orcamentos/followups.server";
import { listarEnvios } from "~/modules/orcamentos/envios.server";
import { impactosRemocao } from "~/modules/orcamentos/impactos.server";
import { Link, redirect } from "react-router";
import {
  criarOrcamento,
  listarOrcamentos,
} from "~/modules/orcamentos/orcamentos.server";
import { Etapas } from "~/modules/viagens/HistoricoEtapas";
import {
  historicoEtapas,
  registrarRespostaCliente,
  corrigirFato,
} from "~/modules/viagens/etapas.server";
import { ColaboracaoViagem } from "~/modules/viagens/ColaboracaoViagem";
import {
  colaboracaoDaViagem,
  alterarColaboracao,
} from "~/modules/viagens/colaboracao.server";
import { PerfilCliente } from "~/modules/viagens/PerfilCliente";
import { perfisDaViagem, salvarPerfil } from "~/modules/viagens/perfil.server";
import {
  listarAnexosPlanejamento,
  guardarRespostasRecebidas,
  listarRespostasConflitantes,
  resolverResposta,
  gerarFormulario,
  revogarFormularios,
} from "~/modules/viagens/formulario.server";
import { FormularioPlanejamento } from "~/modules/viagens/FormularioPlanejamento";
import { obterModeloResposta } from "~/modules/viagens/modelos-resposta.server";
import { Briefing } from "~/modules/viagens/Planejamento";
import { salvarPlanejamento } from "~/modules/viagens/briefing.server";
import { Viajantes } from "~/modules/viagens/Viajantes";
import { alterarViajante } from "~/modules/viagens/viajantes.server";
import { listarCatalogo, nomeOpcao } from "~/modules/opcoes/opcoes.server";
import { useIdioma } from "~/modules/idiomas/idioma";
import { useFetcher } from "react-router";
import type { Route } from "./+types/viagem";
import { now } from "~/clock.server";
import { exigirUsuario } from "~/session.server";
import {
  RegraViolada,
  adicionarNota,
  descartar,
  detalhe,
  listarUsuarios,
  listarContatos,
  registrarResposta,
  trocarResponsavel,
} from "~/modules/viagens/viagens.server";
import { semRespostaHumana, type Etapa } from "~/modules/viagens/regras";
import {
  rotuloCanal,
  rotuloCategoria,
  rotuloEtapa,
  rotuloIdioma,
  rotuloMarca,
  rotuloOrigem,
} from "~/modules/viagens/rotulos";

export async function loader({ request, params }: Route.LoaderArgs) {
  const usuario = await exigirUsuario(request);
  await atualizarFollowups(now(request), Number(params.id));
  const [d, usuarios] = await Promise.all([
    detalhe(Number(params.id), usuario),
    listarUsuarios(),
  ]);
  if (!d) throw new Response("Viagem não encontrada", { status: 404 });
  const agora = now(request);
  return {
    ...d,
    colaboracao: await colaboracaoDaViagem(d.viagem.id),
    perfis: await perfisDaViagem(d.viagem.id),
    usuario,
    impactosViajantes: await impactosRemocao(
      d.viagem.id,
      d.viajantes.map((v) => v.id),
    ),
    aceite: await aceiteDaViagem(d.viagem.id),
    envios: await listarEnvios(d.viagem.id),
    orcamentos: await listarOrcamentos(d.viagem.id),
    historicoEtapas: await historicoEtapas(d.viagem.id),
    anexosPlanejamento: await listarAnexosPlanejamento(d.viagem.id),
    respostasConflitantes: await listarRespostasConflitantes(d.viagem.id),
    modeloResposta: await obterModeloResposta(d.viagem.idiomaCliente),
    contatosConhecidos: await listarContatos(),
    opcoes: await listarCatalogo(usuario.idiomaInterface),
    canalNome: await nomeOpcao(
      "canalComercial",
      d.viagem.canalComercial,
      usuario.idiomaInterface,
    ),
    origemNome: await nomeOpcao(
      "origem",
      d.viagem.origem,
      usuario.idiomaInterface,
    ),
    usuarios,
    semResposta24h: semRespostaHumana(
      {
        etapa: d.viagem.etapa as Etapa,
        criadaEm: d.viagem.criadaEm,
        primeiraRespostaEm: d.viagem.primeiraRespostaEm,
      },
      agora,
    ),
    agora: agora.toISOString(),
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const usuario = await exigirUsuario(request);
  const id = Number(params.id);
  const agora = now(request);
  const f = await request.formData();
  try {
    switch (f.get("intent")) {
      case "criar-orcamento": {
        const o = await criarOrcamento(id, usuario.id, agora);
        return redirect(`/orcamentos/${o.id}`);
      }
      case "resposta-cliente":
        if (f.get("resposta") === "aceitou")
          return redirect(`/viagens/${id}/aceite`);
        await registrarRespostaCliente(id, usuario, f, agora);
        break;
      case "corrigir-etapa":
        await corrigirFato(id, usuario, f, agora);
        break;
      case "participante-adicionar":
      case "participante-remover":
      case "relacionar":
      case "desvincular":
      case "desejo-adicionar":
      case "desejo-aprovar":
      case "desejo-descartar":
        await alterarColaboracao(id, usuario.id, f, agora);
        break;
      case "perfil":
        await salvarPerfil(id, usuario.id, f, agora);
        break;
      case "anexar-respostas":
        await guardarRespostasRecebidas(id, usuario.id, f, agora);
        break;
      case "resolver-resposta":
        await resolverResposta(
          id,
          Number(f.get("respostaId")),
          f.get("escolha") === "usar",
          String(f.get("atual") ?? ""),
          agora,
        );
        break;
      case "gerar-formulario":
        return { ok: true as const, link: await gerarFormulario(id, agora) };
      case "revogar-formulario":
        await revogarFormularios(id, agora);
        return { ok: true as const, revogado: true };
      case "planejamento":
        await salvarPlanejamento(id, f);
        break;
      case "viajante-adicionar":
      case "viajante-salvar":
      case "viajante-remover":
        await alterarViajante(id, f);
        break;
      case "responder":
        await registrarResposta(id, agora, usuario.id);
        break;
      case "trocar-responsavel":
        await trocarResponsavel(
          id,
          Number(f.get("usuarioId")),
          agora,
          usuario.id,
        );
        break;
      case "descartar":
        await descartar(id, String(f.get("motivo") ?? ""), agora, usuario.id);
        break;
      case "nota":
        await adicionarNota(
          id,
          usuario.id,
          String(f.get("texto") ?? ""),
          agora,
        );
        break;
    }
    return { ok: true as const };
  } catch (e) {
    if (e instanceof RegraViolada) return { erro: e.message };
    throw e;
  }
}

export default function Viagem({ loaderData }: Route.ComponentProps) {
  const { idioma, t, mensagem } = useIdioma();
  const quando = (d: Date | string | null) =>
    d
      ? new Date(d).toLocaleString(idioma === "ko" ? "ko-KR" : "pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "—";
  const {
    viagem: v,
    pessoas,
    cadeia,
    historico,
    acoes,
    notas,
    conflitos,
    usuarios,
  } = loaderData;
  const nomeConhecido = (campo: string, valor: string) =>
    loaderData.opcoes[campo]?.find((o) => o.valor === valor)?.nome ?? valor;
  const resposta = useFetcher<typeof action>();
  const troca = useFetcher<typeof action>();
  const descarte = useFetcher<typeof action>();
  const nota = useFetcher<typeof action>();

  // Optimistic state: reflect the change before the server answers.
  const respondida = !!v.primeiraRespostaEm || resposta.state !== "idle";
  const responsavelAtual = historico.find((h) => !h.ate);
  const responsavelId = troca.formData
    ? Number(troca.formData.get("usuarioId"))
    : responsavelAtual?.usuarioId;
  const etapa =
    descarte.formData && !descarte.data?.erro ? "descartada" : v.etapa;
  const notaPendente = nota.formData?.get("texto");

  return (
    <>
      <div className="cabecalho">
        <h1>{v.codigo}</h1>
        <span className="etapa grande" data-testid="etapa">
          {t(rotuloEtapa[etapa])}
        </span>
      </div>

      {loaderData.semResposta24h && !respondida && (
        <p className="alerta" role="alert">
          {t("Sem resposta há mais de 24h")}
        </p>
      )}
      {conflitos.length > 0 && (
        <p className="aviso" role="status">
          {t("Atenção:")} {conflitos.map((c) => c.codigo).join(", ")}{" "}
          {t("já está aberta com o mesmo contato por outra cadeia comercial.")}
        </p>
      )}

      <section className="grade">
        <div>
          <h2>{t("Contatos")}</h2>
          <ul>
            {pessoas.map((p) => (
              <li key={`${p.id}-${t(p.papel)}`}>
                {p.nome} <span className="rotulo">{t(p.papel)}</span>{" "}
                {p.telefone} {p.email}
              </li>
            ))}
          </ul>
          {cadeia.length > 0 && (
            <>
              <h2>{t("Cadeia comercial")}</h2>
              <ol>
                {cadeia.map((c) => (
                  <li key={c.ordem}>
                    {c.nome} ({t(c.tipo)})
                    {c.especificou ? ` — ${c.especificou}` : ""}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
        <dl>
          <dt>{t("Canal comercial")}</dt>
          <dd>{loaderData.canalNome}</dd>
          <dt>{t("Marca")}</dt>
          <dd>{nomeConhecido("marca", v.marca)}</dd>
          <dt>{t("Origem")}</dt>
          <dd>
            {loaderData.origemNome}
            {v.indicadoPor ? ` — ${v.indicadoPor}` : ""}
          </dd>
          <dt>{t("Categoria")}</dt>
          <dd>{nomeConhecido("categoria", v.categoria)}</dd>
          <dt>{t("Idiomas")}</dt>
          <dd>
            {t("Cliente:")} {nomeConhecido("idiomaCliente", v.idiomaCliente)}{" "}
            {t("· Guiamento:")}{" "}
            {nomeConhecido("idiomaGuiamento", v.idiomaGuiamento)}
          </dd>
          <dt>{t("Cidades")}</dt>
          <dd>
            {v.cidades.map((v) => nomeConhecido("cidades", v)).join(", ") ||
              "—"}
          </dd>
          <dt>{t("Datas")}</dt>
          <dd>
            {v.dataInicio ?? "?"} → {v.dataFim ?? "?"}
          </dd>
          <dt>{t("Pessoas")}</dt>
          <dd data-testid="total-viajantes">
            {v.pagantes ?? "?"} {t("pagantes,")} {v.gratuidades}{" "}
            {t("gratuidades ·")} {v.adultos ?? "?"} {t("adultos")}
            {v.idadesCriancas.length
              ? `, ${t("crianças de")} ${v.idadesCriancas.join(", ")} ${t("anos")}`
              : ""}
            {v.bebes ? `, ${v.bebes} ${t("bebê(s)")}` : ""}
          </dd>
          <dt>{t("Meios de contato")}</dt>
          <dd>
            {v.meiosContato
              .map((v) => nomeConhecido("meiosContato", v))
              .join(", ") || "—"}
          </dd>
        </dl>
      </section>

      <ColaboracaoViagem dados={loaderData.colaboracao} usuarios={usuarios} />
      <PerfilCliente perfis={loaderData.perfis} />
      <FormularioPlanejamento
        viagemId={v.id}
        anexos={loaderData.anexosPlanejamento}
        conflitos={loaderData.respostasConflitantes}
      />
      <Briefing
        modelo={loaderData.modeloResposta}
        viagem={v}
        pessoas={loaderData.viajantes}
        opcoes={loaderData.opcoes}
      />
      <Viajantes
        impactos={loaderData.impactosViajantes}
        lista={loaderData.viajantes}
        contatos={loaderData.contatosConhecidos}
      />
      <section>
        <h2>{t("Tarefas")}</h2>
        <ul className="acoes">
          {acoes.map((a) => {
            const feita =
              !!a.concluidaEm ||
              (respondida && a.titulo.startsWith("Responder"));
            return (
              <li key={a.id} className={feita ? "feita" : ""}>
                {a.titulo === "Responder o primeiro contato"
                  ? t("Responder o primeiro contato")
                  : a.titulo}{" "}
                — {a.responsavel} — {t("prazo")} {quando(a.prazo)}
                {feita ? " ✓" : ""}
              </li>
            );
          })}
        </ul>
        {!respondida && etapa === "lead" && (
          <resposta.Form method="post">
            <button name="intent" value="responder">
              {t("Respondi o contato")}
            </button>
          </resposta.Form>
        )}
      </section>

      <section className="grade">
        <div>
          <h2>{t("Responsável")}</h2>
          <troca.Form method="post" className="linha">
            <input type="hidden" name="intent" value="trocar-responsavel" />
            <select
              name="usuarioId"
              aria-label="Responsável"
              value={responsavelId}
              onChange={(e) => troca.submit(e.currentTarget.form)}
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </troca.Form>
          <ul className="historico">
            {historico.map((h, i) => (
              <li key={i}>
                {h.nome}: {quando(h.desde)} →{" "}
                {h.ate ? quando(h.ate) : t("agora")}
              </li>
            ))}
          </ul>
        </div>
        {[
          "lead",
          "em_orcamento",
          "proposta_enviada",
          "em_negociacao",
          "confirmada",
          "em_viagem",
        ].includes(etapa) && (
          <div>
            <h2>{t("Descartar")}</h2>
            <descarte.Form method="post" className="linha">
              <input type="hidden" name="intent" value="descartar" />
              <input
                name="motivo"
                placeholder={t("Imprensa, spam, parceria…")}
                aria-label={t("Motivo do descarte")}
                required
              />
              <button className="secundario">{t("Descartar")}</button>
            </descarte.Form>
            {descarte.data?.erro && (
              <p className="alerta">{mensagem(descarte.data.erro)}</p>
            )}
          </div>
        )}
      </section>

      <section>
        <h2>{t("Orçamentos")}</h2>
        {loaderData.orcamentos.map((o) => (
          <p key={o.id}>
            <Link to={`/orcamentos/${o.id}`}>
              {t("Orçamento")} · {t("Versão")} {o.versao}
            </Link>
            {o.generica && <span> · {t("Proposta genérica")}</span>}
          </p>
        ))}
        {!loaderData.orcamentos.length && (
          <resposta.Form method="post">
            <button name="intent" value="criar-orcamento">
              {t("Criar orçamento")}
            </button>
          </resposta.Form>
        )}
      </section>
      {!!loaderData.aceite?.descontoElaboracao && (
        <p data-testid="desconto-elaboracao">
          {t("Desconto da elaboração")}:{" "}
          {new Intl.NumberFormat(idioma === "ko" ? "ko-KR" : "pt-BR", {
            style: "currency",
            currency: "USD",
          }).format(loaderData.aceite.descontoElaboracao / 100)}
        </p>
      )}
      {loaderData.aceite && (
        <p data-testid="preco-acordado">
          {t("Preço acordado")}:{" "}
          {new Intl.NumberFormat(idioma === "ko" ? "ko-KR" : "pt-BR", {
            style: "currency",
            currency: "USD",
          }).format(loaderData.aceite.precoAcordado / 100)}
        </p>
      )}
      <section>
        <h2>{t("Envios de proposta")}</h2>
        <ul>
          {loaderData.envios.map((e) => (
            <li key={e.id}>
              <Link to={`/orcamentos/${e.orcamentoId}`}>
                {t("Versão")} {e.versao}
              </Link>{" "}
              · {e.destinatario} · {e.canal} · {quando(e.enviadoEm)} · {e.autor}
            </li>
          ))}
        </ul>
      </section>
      <Etapas
        historico={loaderData.historicoEtapas}
        etapa={v.etapa}
        podeCorrigir={
          loaderData.usuario.papel === "admin" ||
          historico.some((h) => !h.ate && h.usuarioId === loaderData.usuario.id)
        }
      />
      <section>
        <h2>{t("Notas")}</h2>
        <nota.Form
          method="post"
          className="linha"
          onSubmit={(e) => {
            const form = e.currentTarget;
            requestAnimationFrame(() => form.reset());
          }}
        >
          <input type="hidden" name="intent" value="nota" />
          <input
            name="texto"
            className="larga"
            aria-label={t("Nova nota")}
            placeholder={t("Negociação, pedidos, valores falados…")}
          />
          <button>{t("Adicionar")}</button>
        </nota.Form>
        <ul className="notas">
          {notaPendente && <li className="pendente">{String(notaPendente)}</li>}
          {notas.map((n, i) => (
            <li key={i}>
              <span className="rotulo">
                {n.autor} · {quando(n.criadaEm)}
              </span>{" "}
              {n.texto}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
