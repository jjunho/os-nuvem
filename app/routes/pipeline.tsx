import { useFiltrosURL } from "~/modules/interface/filtros-url";
import { inteiroEntrada, idOpcional } from "~/modules/validacao/entrada";
import { atualizarFollowups } from "~/modules/orcamentos/followups.server";
import { Form, Link, useRevalidator, useSearchParams } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/pipeline";
import { now } from "~/clock.server";
import { listarUsuarios, pipeline } from "~/modules/viagens/viagens.server";
import { listarOpcoes } from "~/modules/opcoes/opcoes.server";
import { cartoesViagem } from "~/modules/viagens/cartoes.server";
import { exigirUsuario } from "~/session.server";
import { rotuloCanal, rotuloEtapa } from "~/modules/viagens/rotulos";
import { useIdioma } from "~/modules/idiomas/idioma";
import "./pipeline.css";

export async function loader({ request }: Route.LoaderArgs) {
  const usuario = await exigirUsuario(request);
  if (usuario.papel === "guiamento")
    throw new Response("Acesso restrito", { status: 403 });
  await atualizarFollowups(now(request));
  const params = new URL(request.url).searchParams;
  const pagina = inteiroEntrada(params.get("pagina") ?? "1", {
    mensagem: "Página inválida",
  });
  const [resultado, usuarios, canais] = await Promise.all([
    pipeline(now(request), pagina, usuario, {
      responsavelId: idOpcional(params.get("responsavel")),
      canalComercial: params.get("canal") || undefined,
      atrasada: params.get("atrasada") === "1",
    }),
    listarUsuarios(),
    listarOpcoes("canalComercial", usuario.idiomaInterface),
  ]);
  const viagens = resultado.slice(0, 50);
  const cartoes = await cartoesViagem(
    viagens.map((v) => v.id),
    usuario,
  );
  return {
    viagens,
    cartoes,
    usuarios,
    canais,
    pagina,
    temProxima: resultado.length > 50,
  };
}

export default function Pipeline({ loaderData }: Route.ComponentProps) {
  const { idioma, t, mensagem } = useIdioma();
  const { viagens } = loaderData;
  const [params] = useSearchParams();
  const filtro = useFiltrosURL(Object.fromEntries(params));
  const { revalidate } = useRevalidator();
  useEffect(() => {
    const eventos = new EventSource("/comunicador/eventos");
    eventos.onmessage = (e) => {
      let evento: unknown;
      try {
        evento = JSON.parse(e.data);
      } catch {
        return;
      }
      if (
        !evento ||
        typeof evento !== "object" ||
        !("id" in evento) ||
        !("tipo" in evento)
      )
        return;
      if (
        evento.id === 0 ||
        ["pipeline", "viagem", "reconectar"].includes(String(evento.tipo))
      )
        void revalidate();
    };
    return () => eventos.close();
  }, [revalidate]);
  const texto = (pt: string, ko: string) => (idioma === "ko" ? ko : pt);
  const kanban = params.get("visualizacao") === "kanban";
  const url = (nome: string, valor: string) => {
    const novos = new URLSearchParams(params);
    novos.set(nome, valor);
    return `?${novos}`;
  };
  const semResposta = viagens.filter((v) => v.semResposta24h);
  const localidade = idioma === "ko" ? "ko-KR" : "pt-BR";
  const formatarData = new Intl.DateTimeFormat(localidade);
  const formatarPrazo = new Intl.DateTimeFormat(localidade, {
    dateStyle: "short",
    timeStyle: "short",
  });
  const formatarPreco = new Intl.NumberFormat(localidade, {
    style: "currency",
    currency: "USD",
  });
  const data = (valor: string | null) =>
    valor ? formatarData.format(new Date(`${valor}T12:00:00`)) : "—";
  const prazo = (v: (typeof viagens)[number]) =>
    v.prazo ? formatarPrazo.format(new Date(v.prazo)) : "—";
  const datas = (v: (typeof viagens)[number]) =>
    `${data(v.dataInicio)} → ${data(v.dataFim)}`;
  const preco = (v: (typeof viagens)[number]) => {
    const cartao = loaderData.cartoes.find((c) => c.url === `/viagens/${v.id}`);
    return cartao?.preco != null
      ? formatarPreco.format(Number(cartao.preco) / 100)
      : null;
  };
  return (
    <>
      <h1>{t("Pipeline")}</h1>
      <nav
        className="linha"
        aria-label={texto("Visualização do Pipeline", "파이프라인 보기")}
      >
        <Link
          to={url("visualizacao", "lista")}
          aria-current={!kanban ? "page" : undefined}
        >
          {texto("Lista", "목록")}
        </Link>
        <Link
          to={url("visualizacao", "kanban")}
          aria-current={kanban ? "page" : undefined}
        >
          {texto("Kanban", "칸반")}
        </Link>
      </nav>
      <Form method="get" className="linha pipeline-filtros">
        <input
          type="hidden"
          name="visualizacao"
          value={kanban ? "kanban" : "lista"}
        />
        <label>
          {t("Responsável")}
          <select
            name="responsavel"
            aria-label={t("Responsável")}
            value={filtro.valores.responsavel ?? ""}
            onChange={(e) => filtro.alterar("responsavel", e.target.value)}
          >
            <option value="">{texto("Todos", "전체")}</option>
            {loaderData.usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          {texto("Canal comercial", "판매 채널")}
          <select
            aria-label={texto("Canal comercial", "판매 채널")}
            name="canal"
            value={filtro.valores.canal ?? ""}
            onChange={(e) => filtro.alterar("canal", e.target.value)}
          >
            <option value="">{texto("Todos", "전체")}</option>
            {loaderData.canais.map(({ valor, nome }) => (
              <option key={valor} value={valor}>
                {nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            name="atrasada"
            value="1"
            checked={filtro.valores.atrasada === "1"}
            onChange={(e) =>
              filtro.alterar("atrasada", e.target.checked ? "1" : undefined)
            }
          />
          {texto("Próxima ação atrasada", "다음 작업 기한 초과")}
        </label>
        <button type="submit">{texto("Filtrar", "필터 적용")}</button>
      </Form>
      {semResposta.length > 0 && (
        <p className="alerta" role="alert">
          {semResposta.length}{" "}
          {t(semResposta.length === 1 ? "viagem" : "viagens")}{" "}
          {t("sem resposta há mais de 24h")}
        </p>
      )}
      {kanban ? (
        <>
          <p>{texto("Etapas encerradas ocultas", "종료된 단계 숨김")}</p>
          <div className="pipeline-kanban" data-testid="pipeline-kanban">
            {[
              "lead",
              "em_orcamento",
              "proposta_enviada",
              "em_negociacao",
              "confirmada",
              "em_viagem",
            ].map((etapa) => (
              <section
                className="pipeline-coluna"
                key={etapa}
                aria-label={t(rotuloEtapa[etapa])}
              >
                <h2>
                  {t(rotuloEtapa[etapa])}{" "}
                  <small>
                    ({viagens.filter((v) => v.etapa === etapa).length})
                  </small>
                </h2>
                {viagens
                  .filter((v) => v.etapa === etapa)
                  .map((v) => {
                    const cartao = loaderData.cartoes.find(
                      (c) => c.url === `/viagens/${v.id}`,
                    );
                    if (!cartao?.url) return null;
                    return (
                      <Link
                        className="pipeline-cartao"
                        data-testid="pipeline-cartao"
                        draggable={false}
                        key={v.id}
                        to={cartao.url}
                        prefetch="intent"
                      >
                        <strong>{cartao.titulo}</strong>
                        <span>
                          {texto("Datas", "날짜")}: {datas(v)}
                        </span>
                        <span>
                          {texto("Pax", "인원")}: {v.pax} · {t("Responsável")}:{" "}
                          {v.responsavel}
                        </span>
                        <span>
                          {t("Canal")}:{" "}
                          {rotuloCanal[v.canalComercial]
                            ? t(rotuloCanal[v.canalComercial])
                            : v.canalComercial}
                        </span>
                        <span>
                          {t("Próxima ação")}: {v.acao ? mensagem(v.acao) : "—"}
                        </span>
                        <span
                          className={
                            v.atrasada ? "pipeline-atrasada" : undefined
                          }
                        >
                          {t("Prazo")}: {prazo(v)}
                        </span>
                        {(v.semRespostaDesde || v.semResposta24h) && (
                          <strong>{t("Sem resposta")}</strong>
                        )}
                        {preco(v) !== null && (
                          <span>
                            {texto("Preço acordado", "합의 가격")}: {preco(v)}
                          </span>
                        )}
                      </Link>
                    );
                  })}
              </section>
            ))}
          </div>
        </>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>{t("Código")}</th>
              <th>{t("Contato")}</th>
              <th>{t("Etapa")}</th>
              <th>{t("Canal")}</th>
              <th>{t("Responsável")}</th>
              <th>{texto("Datas", "날짜")}</th>
              <th>{texto("Pax", "인원")}</th>
              <th>{t("Próxima ação")}</th>
              <th>{t("Prazo")}</th>
            </tr>
          </thead>
          <tbody>
            {viagens.map((v) => (
              <tr
                key={v.id}
                className={
                  v.semResposta24h
                    ? "linha-alerta"
                    : v.atrasada
                      ? "linha-atrasada"
                      : ""
                }
              >
                <td>
                  <Link to={`/viagens/${v.id}`} prefetch="intent">
                    {v.codigo}
                  </Link>
                  {preco(v) !== null && <small> · {preco(v)}</small>}
                </td>
                <td>{v.contato}</td>
                <td>
                  {t(rotuloEtapa[v.etapa])}
                  {v.semRespostaDesde && (
                    <strong> · {t("Sem resposta")}</strong>
                  )}
                </td>
                <td>
                  {rotuloCanal[v.canalComercial]
                    ? t(rotuloCanal[v.canalComercial])
                    : v.canalComercial}
                </td>
                <td>{v.responsavel}</td>
                <td>{datas(v)}</td>
                <td>{v.pax}</td>
                <td>{v.acao ? mensagem(v.acao) : "—"}</td>
                <td className={v.atrasada ? "pipeline-atrasada" : undefined}>
                  {prazo(v)}
                </td>
              </tr>
            ))}
            {viagens.length === 0 && (
              <tr>
                <td colSpan={9}>{t("Nenhuma viagem aberta.")}</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <nav aria-label={t("Páginas")} className="linha">
        {loaderData.pagina > 1 && (
          <Link to={url("pagina", String(loaderData.pagina - 1))}>
            {t("Página anterior")}
          </Link>
        )}
        {loaderData.temProxima && (
          <Link to={url("pagina", String(loaderData.pagina + 1))}>
            {t("Próxima página")}
          </Link>
        )}
      </nav>
    </>
  );
}
