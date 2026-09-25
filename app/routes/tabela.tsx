import { idOpcional } from "~/modules/validacao/entrada";
import { useActionData, useNavigation } from "react-router";
import { erroDeFormulario } from "~/modules/interface/erro-formulario.server";
import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/tabela";
import { exigirUsuario } from "~/session.server";
import { now } from "~/clock.server";
import {
  historicoTabela,
  lerTabela,
  salvarTabela,
} from "~/modules/tabelas/tabelas.server";
import { useIdioma } from "~/modules/idiomas/idioma";
export async function loader({ request, params }: Route.LoaderArgs) {
  const usuario = await exigirUsuario(request);
  const n = new URL(request.url).searchParams.get("versao");
  const [tabela, historico] = await Promise.all([
    lerTabela(params.codigo, idOpcional(n)),
    historicoTabela(params.codigo),
  ]);
  return { tabela, historico, editavel: usuario.papel === "admin" && !n };
}
export async function action({ request, params }: Route.ActionArgs) {
  try {
    const usuario = await exigirUsuario(request);
    await salvarTabela(
      params.codigo,
      usuario,
      await request.formData(),
      now(request),
    );
    return redirect(`/tabelas/${params.codigo}`);
  } catch (erro) {
    return erroDeFormulario(erro);
  }
}
export default function Tabela({ loaderData: d }: Route.ComponentProps) {
  const { t, mensagem, idioma } = useIdioma();
  const resultado = useActionData<typeof action>();
  const pendente = useNavigation().state !== "idle";
  const { mensagem: mensagemErro } = useIdioma();
  return (
    <>
      {resultado && "erro" in resultado && resultado.erro && (
        <p role="alert">{mensagemErro(resultado.erro)}</p>
      )}
      <Link to="/tabelas">{t("Tabelas de referência")}</Link>
      <h1>{mensagem(d.tabela.titulo)}</h1>
      <p data-testid="versao-tabela">
        {t("Versão")} {d.tabela.versao}
      </p>
      <p>{t("Valores vazios: a informar ou serviço não oferecido.")}</p>
      <Form key={`${d.tabela.codigo}:${d.tabela.versao}`} method="post">
        <input type="hidden" name="versao" value={d.tabela.versao} />
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>{t("Nome")}</th>
                {d.tabela.dados.colunas.map((c) => (
                  <th key={c.chave}>{mensagem(c.nome)}</th>
                ))}
                <th>{t("Referência")}</th>
              </tr>
            </thead>
            <tbody>
              {d.tabela.dados.linhas.map((l) => (
                <tr key={l.id}>
                  <td>
                    <input
                      aria-label={`${t("Nome")} — ${l.nome}`}
                      name={`${l.id}.nome`}
                      defaultValue={l.nome}
                      readOnly={!d.editavel}
                    />
                  </td>
                  {d.tabela.dados.colunas.map((c) => (
                    <td key={c.chave}>
                      <input
                        aria-label={`${mensagem(c.nome)} — ${l.nome}`}
                        type={
                          c.tipo === "numero"
                            ? "number"
                            : c.tipo === "data"
                              ? "date"
                              : "text"
                        }
                        step="any"
                        name={`${l.id}.${c.chave}`}
                        defaultValue={l[c.chave] ?? ""}
                        readOnly={!d.editavel}
                      />
                    </td>
                  ))}
                  <td>
                    {l.provisorio ? t("Padrão provisório") : "negocio/05"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {d.editavel && (
          <>
            <fieldset>
              <legend>{t("Adicionar referência")}</legend>
              <label>
                {t("Nome da nova referência")}
                <input name="nova.nome" />
              </label>
              {d.tabela.dados.colunas.map((c) => (
                <label key={c.chave}>
                  {mensagem(c.nome)}
                  <input
                    name={`nova.${c.chave}`}
                    type={
                      c.tipo === "numero"
                        ? "number"
                        : c.tipo === "data"
                          ? "date"
                          : "text"
                    }
                    step="any"
                  />
                </label>
              ))}
            </fieldset>
            <button disabled={pendente}>{t("Salvar nova versão")}</button>
          </>
        )}
      </Form>
      <section aria-label={t("Histórico de versões")}>
        <h2>{t("Histórico de versões")}</h2>
        <ul>
          {d.historico.map((v) => (
            <li key={v.versao}>
              <Link to={`?versao=${v.versao}`}>
                {t("Versão")} {v.versao}
              </Link>{" "}
              · {v.autor ?? t("Referência inicial")} ·{" "}
              {v.criadaEm.toLocaleString(idioma === "ko" ? "ko-KR" : "pt-BR")}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
