import { redirect } from "react-router";
import type { Route } from "./+types/sair";
import { sair } from "~/modules/acesso/acesso.server";
import { apagarCookie, lerToken } from "~/session.server";

export async function action({ request }: Route.ActionArgs) {
  await sair(await lerToken(request));
  return redirect("/entrar", { headers: { "Set-Cookie": await apagarCookie(request) } });
}

export function loader() {
  return redirect("/entrar");
}
