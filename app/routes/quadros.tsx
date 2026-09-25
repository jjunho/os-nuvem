import { useIdioma } from "~/modules/idiomas/idioma";
import { useActionData, useNavigation } from "react-router";
import { erroDeFormulario } from "~/modules/interface/erro-formulario.server";
import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/quadros";
import { exigirUsuario } from "~/session.server";
import { listarQuadros, criarQuadro } from "~/modules/quadros/quadros.server";
import { useQuadrosTexto } from "~/modules/quadros/textos";
export async function loader({ request }: Route.LoaderArgs) {
  const u = await exigirUsuario(request);
  return { quadros: await listarQuadros(u), usuario: u };
}
export async function action({ request }: Route.ActionArgs) {
  try {
    const q = await criarQuadro(
      await exigirUsuario(request),
      await request.formData(),
    );
    return redirect(`/quadros/${q.id}`);
  } catch (erro) {
    return erroDeFormulario(erro);
  }
}
export default function Quadros({ loaderData: d }: Route.ComponentProps) {
  const t = useQuadrosTexto();
  const resultado = useActionData<typeof action>();
  const pendente = useNavigation().state !== "idle";
  const { mensagem: mensagemErro } = useIdioma();
  return (
    <>
      {resultado && "erro" in resultado && resultado.erro && (
        <p role="alert">{mensagemErro(resultado.erro)}</p>
      )}
      <h1>{t("Quadros")}</h1>
      <ul>
        {d.quadros.map((q) => (
          <li key={q.id}>
            <Link to={`/quadros/${q.id}`}>
              {t(q.nome)}
              {q.pessoal && q.criador_id !== d.usuario.id
                ? ` · ${q.criador_id}`
                : ""}
            </Link>
            {q.arquivado && ` · ${t("Arquivado")}`}
          </li>
        ))}
      </ul>
      <Form method="post">
        <label>
          {t("Nome")}
          <input name="nome" required />
        </label>
        <button disabled={pendente}>{t("Criar Quadro")}</button>
      </Form>
      {d.usuario.papel === "admin" && (
        <Link to="/modelos-etapa">{t("Modelos de etapa")}</Link>
      )}
    </>
  );
}
