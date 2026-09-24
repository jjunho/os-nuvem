import { atualizarFollowups } from "~/modules/orcamentos/followups.server";
import { Link } from "react-router";
import type { Route } from "./+types/pipeline";
import { now } from "~/clock.server";
import { pipeline } from "~/modules/viagens/viagens.server";
import { exigirUsuario } from "~/session.server";
import { rotuloCanal, rotuloEtapa } from "~/modules/viagens/rotulos";
import { useIdioma } from "~/modules/idiomas/idioma";

export async function loader({ request }: Route.LoaderArgs) {
  const usuario = await exigirUsuario(request);
  await atualizarFollowups(now(request));
  const pedida = Number(new URL(request.url).searchParams.get("pagina") ?? 1);
  const pagina = Number.isSafeInteger(pedida) && pedida > 0 ? pedida : 1;
  const viagens = await pipeline(now(request), pagina, usuario);
  return {
    viagens: viagens.slice(0, 50),
    pagina,
    temProxima: viagens.length > 50,
  };
}

export default function Pipeline({ loaderData }: Route.ComponentProps) {
  const { idioma, t, mensagem } = useIdioma();
  const { viagens } = loaderData;
  const semResposta = viagens.filter((v) => v.semResposta24h);
  return (
    <>
      <h1>{t("Pipeline")}</h1>
      {semResposta.length > 0 && (
        <p className="alerta" role="alert">
          {semResposta.length}{" "}
          {t(semResposta.length === 1 ? "viagem" : "viagens")}{" "}
          {t("sem resposta há mais de 24h")}
        </p>
      )}
      <table className="tabela">
        <thead>
          <tr>
            <th>{t("Código")}</th>
            <th>{t("Contato")}</th>
            <th>{t("Etapa")}</th>
            <th>{t("Canal")}</th>
            <th>{t("Responsável")}</th>
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
              </td>
              <td>{v.contato}</td>
              <td>
                {t(rotuloEtapa[v.etapa])}
                {v.semRespostaDesde && <strong> · {t("Sem resposta")}</strong>}
              </td>
              <td>
                {rotuloCanal[v.canalComercial]
                  ? t(rotuloCanal[v.canalComercial])
                  : v.canalComercial}
              </td>
              <td>{v.responsavel}</td>
              <td>{v.acao ? mensagem(v.acao) : "—"}</td>
              <td>
                {v.prazo
                  ? new Date(v.prazo).toLocaleString(
                      idioma === "ko" ? "ko-KR" : "pt-BR",
                      { dateStyle: "short", timeStyle: "short" },
                    )
                  : "—"}
              </td>
            </tr>
          ))}
          {viagens.length === 0 && (
            <tr>
              <td colSpan={7}>{t("Nenhuma viagem aberta.")}</td>
            </tr>
          )}
        </tbody>
      </table>
      <nav aria-label={t("Páginas")} className="linha">
        {loaderData.pagina > 1 && (
          <Link to={`?pagina=${loaderData.pagina - 1}`}>
            {t("Página anterior")}
          </Link>
        )}
        {loaderData.temProxima && (
          <Link to={`?pagina=${loaderData.pagina + 1}`}>
            {t("Próxima página")}
          </Link>
        )}
      </nav>
    </>
  );
}
