import { Form, data, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/entrar";
import { entrar, usuarioDaSessao } from "~/modules/acesso/acesso.server";
import { cookieDeSessao, destinoSeguro } from "~/session.server";
import { now } from "~/clock.server";
import { useIdioma } from "~/modules/idiomas/idioma";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const resultado = await entrar(
    String(form.get("email") ?? ""),
    String(form.get("senha") ?? ""),
    now(request),
  );
  if ("erro" in resultado) return data({ erro: resultado.erro }, { status: 400 });
  const destinoPedido = new URL(request.url).searchParams.get("destino");
  const usuario = await usuarioDaSessao(resultado.sessao.token, now(request));
  return redirect(
    destinoPedido === null && usuario?.papel === "guiamento"
      ? "/tarefas"
      : destinoSeguro(destinoPedido),
    {
      headers: {
        "Set-Cookie": await cookieDeSessao(request, resultado.sessao),
      },
    },
  );
}

export default function Entrar({ actionData }: Route.ComponentProps) {
  const { t, mensagem } = useIdioma();
  const enviando = useNavigation().state !== "idle";
  return (
    <main className="pagina estreita">
      <h1>Corealux OS</h1>
      <Form method="post" className="lista-botoes">
        <label>
          {t("E-mail")}
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          {t("Senha")}
          <input
            name="senha"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {actionData?.erro && <p role="alert">{mensagem(actionData.erro)}</p>}
        <button disabled={enviando}>
          {t(enviando ? "Entrando…" : "Entrar")}
        </button>
      </Form>
    </main>
  );
}
