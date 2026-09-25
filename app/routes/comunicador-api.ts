import {
  consultarComunicador,
  executarComando,
} from "~/modules/comunicador/api.server";
import { exigirUsuario } from "~/session.server";
import { now } from "~/clock.server";
import { invalido } from "~/modules/comunicador/acesso.server";
export async function loader({ request }: { request: Request }) {
  const u = await exigirUsuario(request);
  const url = new URL(request.url);
  return consultarComunicador(
    u,
    url.searchParams,
    now(request),
    url.origin,
  );
}
export async function action({ request }: { request: Request }) {
  const u = await exigirUsuario(request),
    dados: unknown = await request.json().catch(() => invalido());
  return executarComando(
    u,
    dados,
    now(request),
    new URL(request.url).origin,
  );
}
