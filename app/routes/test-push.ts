import { lerEntregasDeTeste } from "~/modules/notificacoes/leituras.server";
export async function loader() {
  return { pushes: await lerEntregasDeTeste() };
}
