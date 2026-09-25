import { useActionData, useNavigation } from "react-router";
import { erroDeFormulario } from "~/modules/interface/erro-formulario.server";
import { Form } from "react-router";
import type { Route } from "./+types/modelos-resposta";
import { exigirUsuario } from "~/session.server";
import {
  listarModelosResposta,
  salvarModeloResposta,
} from "~/modules/viagens/modelos-resposta.server";
import { useIdioma } from "~/modules/idiomas/idioma";
import { rotuloIdioma } from "~/modules/viagens/rotulos";
export async function loader({ request }: Route.LoaderArgs) {
  const usuario = await exigirUsuario(request);
  if (usuario.papel !== "admin")
    throw new Response("Acesso restrito", { status: 403 });
  return { modelos: await listarModelosResposta() };
}
export async function action({ request }: Route.ActionArgs) {
  try {
    const usuario = await exigirUsuario(request);
    const f = await request.formData();
    await salvarModeloResposta(
      usuario,
      String(f.get("idioma")),
      String(f.get("texto") ?? ""),
    );
    return { ok: true };
  } catch (erro) {
    return erroDeFormulario(erro);
  }
}
export default function Modelos({ loaderData }: Route.ComponentProps) {
  const { t } = useIdioma();
  const resultado = useActionData<typeof action>();
  const pendente = useNavigation().state !== "idle";
  const { mensagem: mensagemErro } = useIdioma();
  return (
    <>
      {resultado && "erro" in resultado && resultado.erro && (
        <p role="alert">{mensagemErro(resultado.erro)}</p>
      )}
      <h1>{t("Modelos de primeira resposta")}</h1>
      <p>{t("Use {dados_faltantes} para pedir apenas o que ainda falta.")}</p>
      {loaderData.modelos.map((m) => (
        <Form method="post" key={m.idioma} className="lista-botoes">
          <input type="hidden" name="idioma" value={m.idioma} />
          <label>
            {t("Modelo")} {t(rotuloIdioma[m.idioma])}
            <textarea rows={5} name="texto" defaultValue={m.texto} />
          </label>
          <button disabled={pendente}>
            {t("Salvar")} {t(rotuloIdioma[m.idioma])}
          </button>
        </Form>
      ))}
    </>
  );
}
