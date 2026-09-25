import { useFiltrosURL } from "~/modules/interface/filtros-url";
import { useActionData, useNavigation } from "react-router";
import { erroDeFormulario } from "~/modules/interface/erro-formulario.server";
import { atualizarFollowups } from "~/modules/orcamentos/followups.server";
import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/tarefas";
import { exigirUsuario } from "~/session.server";
import { now } from "~/clock.server";
import { criarTarefa, listarTarefas } from "~/modules/tarefas/tarefas.server";
import { listarUsuarios } from "~/modules/viagens/viagens.server";
import { useIdioma } from "~/modules/idiomas/idioma";
export async function loader({ request }: Route.LoaderArgs) {
  const usuario = await exigirUsuario(request);
  await atualizarFollowups(now(request));
  const filtros = new URL(request.url).searchParams;
  const [tarefas, usuarios] = await Promise.all([
    listarTarefas(usuario, filtros, now(request)),
    listarUsuarios(),
  ]);
  return { tarefas, usuarios, usuario, filtros: Object.fromEntries(filtros) };
}
export async function action({ request }: Route.ActionArgs) {
  try {
    const usuario = await exigirUsuario(request);
    const tarefa = await criarTarefa(
      usuario,
      await request.formData(),
      now(request),
    );
    return redirect(`/tarefas/${tarefa.id}`);
  } catch (erro) {
    return erroDeFormulario(erro);
  }
}
export default function Tarefas({ loaderData: d }: Route.ComponentProps) {
  const { t } = useIdioma();
  const filtro = useFiltrosURL(d.filtros);
  const resultado = useActionData<typeof action>();
  const pendente = useNavigation().state !== "idle";
  const { mensagem: mensagemErro } = useIdioma();
  return (
    <>
      {resultado && "erro" in resultado && resultado.erro && (
        <p role="alert">{mensagemErro(resultado.erro)}</p>
      )}
      <h1>{t("Minhas Tarefas")}</h1>
      <Form method="get" className="linha">
        <label>
          {t("Responsável")}
          <select
            name="responsavel"
            value={filtro.valores.responsavel ?? d.usuario.id}
            onChange={(e) => filtro.alterar("responsavel", e.target.value)}
          >
            <option value="todos">{t("Todas")}</option>
            {d.usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Cópias")}
          <select
            name="copia"
            value={filtro.valores.copia ?? ""}
            onChange={(e) => filtro.alterar("copia", e.target.value)}
          >
            <option value="">{t("Todas")}</option>
            {d.usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Viagem relacionada")}
          <input
            name="viagem"
            type="number"
            value={filtro.valores.viagem ?? ""}
            onChange={(e) => filtro.alterar("viagem", e.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            name="atrasadas"
            checked={filtro.valores.atrasadas !== undefined}
            onChange={(e) =>
              filtro.alterar("atrasadas", e.target.checked ? "on" : undefined)
            }
          />
          {t("Atrasadas")}
        </label>
        <button disabled={pendente}>{t("Filtrar")}</button>
      </Form>
      <ul>
        {d.tarefas.map((tarefa) => (
          <li key={tarefa.id}>
            <Link to={`/tarefas/${tarefa.id}`}>
              {tarefa.codigo} — {tarefa.titulo}
            </Link>{" "}
            · {tarefa.responsavel} · {tarefa.prazo?.toLocaleString()} ·{" "}
            {t(
              (
                {
                  aberta: "Aberta",
                  concluida: "Concluída",
                  cancelada: "Cancelada",
                } as const
              )[tarefa.estado],
            )}
          </li>
        ))}
      </ul>
      <Form method="post" className="lista-botoes">
        <h2>{t("Criar tarefa")}</h2>
        <label>
          {t("Título")}
          <input name="titulo" required />
        </label>
        <label>
          {t("Descrição")}
          <textarea name="descricao" />
        </label>
        <label>
          {t("Responsável da tarefa")}
          <select
            aria-label={t("Responsável da tarefa")}
            name="responsavelId"
            defaultValue={d.usuario.id}
          >
            {d.usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>{t("Cópias")}</legend>
          {d.usuarios.map((u) => (
            <label key={u.id}>
              <input type="checkbox" name="copias" value={u.id} />
              {u.nome}
            </label>
          ))}
        </fieldset>
        <label>
          {t("Prazo da tarefa")}
          <input type="datetime-local" name="prazo" />
        </label>
        <label>
          {t("Viagem relacionada")}
          <input type="number" name="viagemId" />
        </label>
        <button disabled={pendente}>{t("Criar tarefa")}</button>
      </Form>
    </>
  );
}
