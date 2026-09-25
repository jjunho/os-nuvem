import { exigirUsuario } from "~/session.server";
import { baixarMidia } from "~/modules/comunicador/midia.server";
export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { id?: string };
}) {
  return baixarMidia(await exigirUsuario(request), params.id ?? "");
}
