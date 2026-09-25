import { inteiroEntrada } from "~/modules/validacao/entrada";
import { origensTarefasViagem } from "~/modules/viagens/tarefas-etapa.server";
import { aceiteDaViagem } from "~/modules/orcamentos/aceite.server";
import { atualizarFollowups } from "~/modules/orcamentos/followups.server";
import { listarEnvios } from "~/modules/orcamentos/envios.server";
import { impactosRemocao } from "~/modules/orcamentos/impactos.server";
import { Link, redirect, data } from "react-router";
import { useEffect, useRef } from "react";
import { erroDeFormulario } from "~/modules/interface/erro-formulario.server";
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
  await atualizarFollowups(now(request), inteiroEntrada(params.id));
  const [d, usuarios] = await Promise.all([
    detalhe(inteiroEntrada(params.id), usuario),
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
    origensTarefas: await origensTarefasViagem(d.viagem.id),
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
  const id = inteiroEntrada(params.id);
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
        if (!f.get("tentativaId"))
          throw new Response("Tentativa inválida", { status: 400 });
        await guardarRespostasRecebidas(id, usuario.id, f, agora);
        break;
      case "resolver-resposta":
        await resolverResposta(
          id,
          inteiroEntrada(f.get("respostaId")),
          f.get("escolha") === "usar",
          String(f.get("atual") ?? ""),
          agora,
        );
        break;
      case "gerar-formulario":
        if (!f.get("tentativaId"))
          throw new Response("Tentativa inválida", { status: 400 });
        return {
          ok: true as const,
          link: await gerarFormulario(
            id,
            agora,
            usuario.id,
            f.get("tentativaId"),
          ),
        };
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
        await registrarResposta(id, agora, usuario.id, {
          meio: String(f.get("meioContato") ?? ""),
          ocorreu: String(f.get("ocorreuContato") ?? ""),
          motivo: String(f.get("motivoContato") ?? ""),
        });
        break;
      case "trocar-responsavel":
        await trocarResponsavel(
          id,
          inteiroEntrada(f.get("usuarioId")),
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
      default:
        throw new Response("Ação inválida", { status: 400 });
    }
    return { ok: true as const };
  } catch (e) {
    if (e instanceof RegraViolada)
      return data({ erro: e.message }, { status: 400 });
    return erroDeFormulario(e);
  }
}

export default function Viagem(props: Route.ComponentProps) {
  return <PaginaViagem key={props.loaderData.viagem.id} {...props} />;
}

function PaginaViagem({ loaderData, actionData }: Route.ComponentProps) {
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
  const formularioNota = useRef<HTMLFormElement>(null);
  const notaEnviada = useRef<string | null>(null);
  useEffect(() => {
    if (nota.state !== "idle" || !nota.data || notaEnviada.current === null)
      return;
    if ("ok" in nota.data && nota.data.ok && formularioNota.current) {
      const atual = new FormData(formularioNota.current).get("texto");
      if (atual === notaEnviada.current) formularioNota.current.reset();
    }
    notaEnviada.current = null;
  }, [nota.state, nota.data]);

  // Optimistic state: reflect the change before the server answers.
  const respondida =
    !!v.primeiraRespostaEm ||
    (resposta.state !== "idle" &&
      resposta.formData?.get("intent") === "responder");
  const responsavelAtual = historico.find((h) => !h.ate);
  const responsavelId =
    troca.state !== "idle" && troca.formData
      ? Number(troca.formData.get("usuarioId"))
      : responsavelAtual?.usuarioId;
  const etapa =
    descarte.state !== "idle" && descarte.formData ? "descartada" : v.etapa;
  const notaPendente =
    nota.state !== "idle" ? nota.formData?.get("texto") : null;

  return (
    <>
      {actionData && "erro" in actionData && actionData.erro && (
        <p role="alert">{mensagem(actionData.erro)}</p>
      )}
      <div className="cabecalho">
        <h1>{v.codigo}</h1>
        {loaderData.usuario.papel !== "guiamento" && (
          <Link to={`?interna=${v.id}`}>{t("Conversa interna")}</Link>
        )}
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
        podeVerDocumentos={loaderData.usuario.papel !== "guiamento"}
        impactos={loaderData.impactosViajantes}
        lista={loaderData.viajantes}
        contatos={loaderData.contatosConhecidos}
      />
      <section>
        <h2>{t("Tarefas")}</h2>
        {Array.from(
          new Set(
            acoes.map(
              (a) =>
                loaderData.origensTarefas.find((o) => o.tarefaId === a.id)
                  ?.etapa ?? "pessoal",
            ),
          ),
        ).map((grupo) => (
          <div key={grupo}>
            <h3>
              {grupo === "pessoal"
                ? t("Tarefas pessoais")
                : t(rotuloEtapa[grupo as Etapa])}
            </h3>
            <ul className="acoes">
              {acoes
                .filter(
                  (a) =>
                    (loaderData.origensTarefas.find((o) => o.tarefaId === a.id)
                      ?.etapa ?? "pessoal") === grupo,
                )
                .map((a) => {
                  const origem = loaderData.origensTarefas.find(
                    (o) => o.tarefaId === a.id,
                  );
                  return (
                    <li
                      key={a.id}
                      className={a.estado === "concluida" ? "feita" : ""}
                    >
                      <Link to={`/tarefas/${a.id}`}>{mensagem(a.titulo)}</Link>{" "}
                      — {a.responsavel} — {t("prazo")} {quando(a.prazo)} ·{" "}
                      {a.estado === "concluida"
                        ? t("Concluída")
                        : a.estado === "cancelada"
                          ? t("Cancelada")
                          : t("Aberta")}
                      {origem?.fatoId && (
                        <>
                          {" "}
                          ·{" "}
                          <a href={`#fato-${origem.fatoId}`}>
                            {t("Fato conclusivo")} #{origem.fatoId}
                          </a>
                        </>
                      )}
                      {origem?.motivo && (
                        <>
                          {" "}
                          ·{" "}
                          {origem.motivo.startsWith("Etapa passou para ")
                            ? `${t("Etapa passou para")} ${mensagem(origem.motivo.slice(17))}`
                            : mensagem(origem.motivo)}
                        </>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
        {!["descartada", "perdida", "cancelada", "concluida"].includes(
          v.etapa,
        ) && (
          <resposta.Form method="post" id="registrar-contato">
            <label>
              {t("Meio de contato")}
              <select
                name="meioContato"
                defaultValue={
                  v.meiosContato[0] ??
                  loaderData.opcoes.meiosContato?.[0]?.valor
                }
              >
                {loaderData.opcoes.meiosContato?.map((m) => (
                  <option key={m.valor} value={m.valor}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("O que ocorreu")}
              <input name="ocorreuContato" required />
            </label>
            <label>
              {t("Por quê")}
              <input name="motivoContato" required />
            </label>
            <button
              disabled={resposta.state !== "idle"}
              name="intent"
              value="responder"
            >
              {!respondida && etapa === "lead"
                ? t("Respondi o contato")
                : t("Registrar contato")}
            </button>
          </resposta.Form>
        )}
        {resposta.data && "erro" in resposta.data && resposta.data.erro && (
          <p role="alert">{mensagem(resposta.data.erro)}</p>
        )}
        {loaderData.usuario.papel === "admin" && (
          <Link to="/modelos-etapa">{t("Modelos de etapa")}</Link>
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
          {troca.data && "erro" in troca.data && troca.data.erro && (
            <p role="alert">{mensagem(troca.data.erro)}</p>
          )}
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
        ].includes(v.etapa) && (
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
              <button
                disabled={descarte.state !== "idle"}
                className="secundario"
              >
                {t("Descartar")}
              </button>
            </descarte.Form>
            {descarte.data && "erro" in descarte.data && descarte.data.erro && (
              <p role="alert" className="alerta">
                {mensagem(descarte.data.erro)}
              </p>
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
            <button
              disabled={resposta.state !== "idle"}
              name="intent"
              value="criar-orcamento"
            >
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
          ref={formularioNota}
          method="post"
          className="linha"
          onSubmit={(e) => {
            if (notaEnviada.current !== null || nota.state !== "idle") {
              e.preventDefault();
              return;
            }
            notaEnviada.current = String(
              new FormData(e.currentTarget).get("texto") ?? "",
            );
          }}
        >
          <input type="hidden" name="intent" value="nota" />
          <input
            name="texto"
            className="larga"
            aria-label={t("Nova nota")}
            placeholder={t("Negociação, pedidos, valores falados…")}
          />
          <button disabled={nota.state !== "idle"}>{t("Adicionar")}</button>
        </nota.Form>
        {nota.data && "erro" in nota.data && nota.data.erro && (
          <p role="alert">{mensagem(nota.data.erro)}</p>
        )}
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
