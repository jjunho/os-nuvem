import { Link } from "react-router";
import type { Route } from "./+types/tabelas";
import { exigirUsuario } from "~/session.server";
import { listarTabelas } from "~/modules/tabelas/tabelas.server";
import { useIdioma } from "~/modules/idiomas/idioma";
export async function loader({ request }: Route.LoaderArgs) {
  await exigirUsuario(request);
  return { tabelas: await listarTabelas() };
}
export default function Tabelas({ loaderData }: Route.ComponentProps) {
  const { t, mensagem } = useIdioma();
  return (
    <>
      <h1>{t("Tabelas de referência")}</h1>
      <ul>
        {loaderData.tabelas.map((t) => (
          <li key={t.codigo}>
            <Link to={`/tabelas/${t.codigo}`}>{mensagem(t.titulo)}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
