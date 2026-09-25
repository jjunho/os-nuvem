import { exigirUsuario } from "~/session.server";
import { baixar } from "~/modules/quadros/arquivos.server";
export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { id?: string; anexoId?: string };
}) {
  return baixar(
    await exigirUsuario(request),
    Number(params.id),
    params.anexoId ?? "",
  );
}
