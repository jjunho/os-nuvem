import { useEffect, useRef } from "react";
import { Form, data, useNavigation } from "react-router";
import type { Route } from "./+types/profissionais";
import { exigirUsuario } from "~/session.server";
import {
  listarDisponibilidade,
  salvarProfissional,
  alocarProfissional,
} from "~/modules/profissionais/profissionais.server";
import { useIdioma } from "~/modules/idiomas/idioma";
export async function loader({ request }: Route.LoaderArgs) {
  const u = await exigirUsuario(request);
  return { ...(await listarDisponibilidade()), admin: u.papel === "admin" };
}
export async function action({ request }: Route.ActionArgs) {
  const u = await exigirUsuario(request);
  if (u.papel !== "admin")
    throw new Response("Acesso restrito", { status: 403 });
  const f = await request.formData();
  try {
    if (f.get("intent") === "alocar") await alocarProfissional(f, u.id);
    else if (f.get("intent") === null) await salvarProfissional(f);
    else throw new Response("Ação inválida", { status: 400 });
    return { erro: null };
  } catch (e) {
    if (e instanceof Response && e.status === 400)
      return data({ erro: await e.text() }, { status: 400 });
    throw e;
  }
}
export default function Profissionais({
  loaderData: d,
  actionData,
}: Route.ComponentProps) {
  const { t, mensagem } = useIdioma();
  const navigation = useNavigation();
  const emVoo = useRef(false);
  useEffect(() => {
    if (navigation.state === "idle") emVoo.current = false;
  }, [navigation.state]);
  function submeter(evento: React.FormEvent<HTMLFormElement>) {
    if (emVoo.current || navigation.state !== "idle") {
      evento.preventDefault();
      return;
    }
    emVoo.current = true;
  }
  return (
    <>
      <h1>{t("Profissionais e disponibilidade")}</h1>
      {actionData?.erro && <p role="alert">{mensagem(actionData.erro)}</p>}
      <table>
        <tbody>
          {d.profissionais.map((p) => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td>{p.papel}</td>
              <td>{p.idiomas.join(", ")}</td>
              <td>{p.especialidades.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {d.admin && (
        <>
          <Form method="post" onSubmit={submeter}>
            <label>
              {t("Nome")}
              <input name="nome" required />
            </label>
            <label>
              {t("Papel")}
              <select name="papel">
                <option value="guia">{t("Guia")}</option>
                <option value="assistente">{t("Assistente")}</option>
              </select>
            </label>
            <label>
              {t("Idiomas (códigos)")}
              <input name="idiomas" placeholder="pt, en, ko" required />
            </label>
            <label>
              {t("Especialidades")}
              <input name="especialidades" />
            </label>
            <button disabled={navigation.state !== "idle"}>
              {t("Salvar profissional")}
            </button>
          </Form>
          <Form method="post" onSubmit={submeter}>
            <input type="hidden" name="intent" value="alocar" />
            <label>
              {t("Profissional")}
              <select aria-label={t("Profissional")} name="profissionalId">
                {d.profissionais.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("Viagem ID")}
              <input name="viagemId" type="number" min="1" required />
            </label>
            <label>
              {t("Início")}
              <input name="inicio" type="date" required />
            </label>
            <label>
              {t("Fim")}
              <input name="fim" type="date" required />
            </label>
            <label>
              {t("Período")}
              <select name="periodo">
                <option value="inteiro">{t("Dia completo")}</option>
                <option value="manha">{t("Manhã")}</option>
                <option value="tarde">{t("Tarde")}</option>
              </select>
            </label>
            <button disabled={navigation.state !== "idle"}>
              {t("Confirmar alocação")}
            </button>
          </Form>
        </>
      )}
      <ul data-testid="alocacoes">
        {d.alocacoes.map((a) => (
          <li key={a.id}>
            {d.profissionais.find((p) => p.id === a.profissionalId)?.nome} ·{" "}
            {a.inicio} — {a.fim} · {a.periodo}
          </li>
        ))}
      </ul>
    </>
  );
}
