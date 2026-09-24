import { Link } from "react-router";
import type { Route } from "./+types/pipeline";
import { now } from "~/clock.server";
import { pipeline } from "~/modules/viagens/viagens.server";
import { exigirUsuario } from "~/session.server";
import { rotuloCanal, rotuloEtapa } from "~/modules/viagens/rotulos";

export async function loader({ request }: Route.LoaderArgs) {
  await exigirUsuario(request);
  return { viagens: await pipeline(now(request)) };
}

export default function Pipeline({ loaderData }: Route.ComponentProps) {
  const { viagens } = loaderData;
  const semResposta = viagens.filter((v) => v.semResposta24h);
  return (
    <>
      <h1>Pipeline</h1>
      {semResposta.length > 0 && (
        <p className="alerta" role="alert">
          {semResposta.length} {semResposta.length === 1 ? "viagem" : "viagens"} sem resposta há mais de 24h
        </p>
      )}
      <table className="tabela">
        <thead>
          <tr>
            <th>Código</th>
            <th>Contato</th>
            <th>Etapa</th>
            <th>Canal</th>
            <th>Responsável</th>
            <th>Próxima ação</th>
            <th>Prazo</th>
          </tr>
        </thead>
        <tbody>
          {viagens.map((v) => (
            <tr key={v.id} className={v.semResposta24h ? "linha-alerta" : v.atrasada ? "linha-atrasada" : ""}>
              <td>
                <Link to={`/viagens/${v.id}`} prefetch="intent">
                  {v.codigo}
                </Link>
              </td>
              <td>{v.contato}</td>
              <td>{rotuloEtapa[v.etapa]}</td>
              <td>{rotuloCanal[v.canalComercial]}</td>
              <td>{v.responsavel}</td>
              <td>{v.acao ?? "—"}</td>
              <td>{v.prazo ? new Date(v.prazo).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—"}</td>
            </tr>
          ))}
          {viagens.length === 0 && (
            <tr>
              <td colSpan={7}>Nenhuma viagem aberta.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
