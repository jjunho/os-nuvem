import type { Route } from "./+types/anexo-planejamento";
import { exigirUsuario } from "~/session.server";
import { lerAnexoPlanejamento } from "~/modules/viagens/formulario.server";
export async function loader({ request, params }: Route.LoaderArgs) {
  await exigirUsuario(request);
  const anexo = await lerAnexoPlanejamento(
    Number(params.id),
    Number(params.anexoId),
  );
  return new Response(new Uint8Array(anexo.conteudo), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(anexo.nome)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
