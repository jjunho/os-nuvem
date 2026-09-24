import type { Route } from "./+types/buscar";
import { buscar } from "~/modules/viagens/viagens.server";
import { exigirUsuario } from "~/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  await exigirUsuario(request);
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return { resultados: await buscar(q) };
}
