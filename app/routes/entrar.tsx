import { Form, redirect } from "react-router";
import type { Route } from "./+types/entrar";
import { listarUsuarios } from "~/modules/viagens/viagens.server";
import { cookieDeUsuario } from "~/session.server";

export async function loader() {
  return { usuarios: await listarUsuarios() };
}

export async function action({ request }: Route.ActionArgs) {
  const id = Number((await request.formData()).get("usuarioId"));
  return redirect("/", { headers: { "Set-Cookie": cookieDeUsuario(id) } });
}

export default function Entrar({ loaderData }: Route.ComponentProps) {
  return (
    <main className="pagina estreita">
      <h1>Corealux OS</h1>
      <p>Quem é você?</p>
      <Form method="post" className="lista-botoes">
        {loaderData.usuarios.map((u) => (
          <button key={u.id} name="usuarioId" value={u.id}>
            {u.nome}
          </button>
        ))}
      </Form>
    </main>
  );
}
