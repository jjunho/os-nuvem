import { Form, data, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/entrar";
import { entrar } from "~/modules/acesso/acesso.server";
import { cookieDeSessao, destinoSeguro } from "~/session.server";
import { now } from "~/clock.server";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const resultado = await entrar(String(form.get("email") ?? ""), String(form.get("senha") ?? ""), now(request));
  if (!resultado.sessao) return data({ erro: resultado.erro }, { status: 400 });
  return redirect(destinoSeguro(new URL(request.url).searchParams.get("destino")), {
    headers: { "Set-Cookie": await cookieDeSessao(request, resultado.sessao) },
  });
}

export default function Entrar({ actionData }: Route.ComponentProps) {
  const enviando = useNavigation().state !== "idle";
  return (
    <main className="pagina estreita">
      <h1>Corealux OS</h1>
      <Form method="post" className="lista-botoes">
        <label>E-mail<input name="email" type="email" autoComplete="username" required /></label>
        <label>Senha<input name="senha" type="password" autoComplete="current-password" required /></label>
        {actionData?.erro && <p role="alert">{actionData.erro}</p>}
        <button disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
      </Form>
    </main>
  );
}
