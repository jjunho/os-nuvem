import { useActionData, useNavigation } from "react-router";
import { erroDeFormulario } from "~/modules/interface/erro-formulario.server";
import { Form } from "react-router";
import type { Route } from "./+types/opcoes";
import { exigirUsuario } from "~/session.server";
import {
  administrarOpcoes,
  opcoesParaAdministrar,
} from "~/modules/opcoes/opcoes.server";
import type { ChaveTraducao } from "~/modules/idiomas/catalogo";
import { useIdioma } from "~/modules/idiomas/idioma";
export async function loader({ request }: Route.LoaderArgs) {
  return { opcoes: await opcoesParaAdministrar(await exigirUsuario(request)) };
}
export async function action({ request }: Route.ActionArgs) {
  try {
    const usuario = await exigirUsuario(request);
    const f = await request.formData();
    await administrarOpcoes(
      usuario,
      String(f.get("intent")),
      Number(f.get("id")),
      String(f.get("nome") ?? ""),
      Number(f.get("destino")),
    );
    return { ok: true };
  } catch (erro) {
    return erroDeFormulario(erro);
  }
}
export default function Opcoes({
  loaderData: { opcoes },
}: Route.ComponentProps) {
  const { idioma, t } = useIdioma();
  const campos: Record<string, ChaveTraducao> = {
    hotelNome: "Hotel",
    nivelRestaurante: "Nível de restaurante",
    ritmo: "Ritmo",
    origem: "Origem",
    canalComercial: "Canal comercial",
    categoria: "Categoria",
    idiomaCliente: "Idioma do cliente",
    idiomaGuiamento: "Idioma de guiamento",
    marca: "Marca",
    cidades: "Cidades",
    meiosContato: "Meios de contato",
  };
  const resultado = useActionData<typeof action>();
  const pendente = useNavigation().state !== "idle";
  const { mensagem: mensagemErro } = useIdioma();
  return (
    <>
      {resultado && "erro" in resultado && resultado.erro && (
        <p role="alert">{mensagemErro(resultado.erro)}</p>
      )}
      <h1>{t("Opções conhecidas")}</h1>
      <table className="tabela">
        <thead>
          <tr>
            <th>{t("Campo")}</th>
            <th>{t("Nome")}</th>
            <th>{t("Tipo")}</th>
            <th>{t("Alterar")}</th>
          </tr>
        </thead>
        <tbody>
          {opcoes.map((o) => (
            <tr key={o.id}>
              <td>{campos[o.campo] ? t(campos[o.campo]) : o.campo}</td>
              <td>{idioma === "ko" ? o.nomeKo : o.nomePt}</td>
              <td>{t(o.regular ? "Regular" : "Exceção")}</td>
              <td>
                <Form method="post" className="linha">
                  <input type="hidden" name="id" value={o.id} />
                  <input
                    name="nome"
                    aria-label={t("Nome")}
                    defaultValue={idioma === "ko" ? o.nomeKo : o.nomePt}
                  />
                  <button disabled={pendente} name="intent" value="renomear">
                    {t("Renomear")}
                  </button>
                  {!o.regular && (
                    <button
                      disabled={pendente}
                      name="intent"
                      value="regularizar"
                    >
                      {t("Tornar regular")}
                    </button>
                  )}
                  <select
                    name="destino"
                    aria-label={t("Mesclar com")}
                    defaultValue=""
                  >
                    <option value="">—</option>
                    {opcoes
                      .filter((d) => d.campo === o.campo && d.id !== o.id)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {idioma === "ko" ? d.nomeKo : d.nomePt}
                        </option>
                      ))}
                  </select>
                  <button disabled={pendente} name="intent" value="mesclar">
                    {t("Mesclar")}
                  </button>
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
