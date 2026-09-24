import { Form, Link } from "react-router";
import type { Route } from "./+types/tarefa";
import { exigirUsuario } from "~/session.server";
import { now } from "~/clock.server";
import {
  detalheTarefa,
  mudarEstadoTarefa,
} from "~/modules/tarefas/tarefas.server";
import { useIdioma } from "~/modules/idiomas/idioma";
export async function loader({ request, params }: Route.LoaderArgs) {
  return detalheTarefa(await exigirUsuario(request), Number(params.id));
}
export async function action({ request, params }: Route.ActionArgs) {
  const usuario = await exigirUsuario(request);
  const f = await request.formData();
  await mudarEstadoTarefa(
    usuario,
    Number(params.id),
    String(f.get("intent")),
    String(f.get("motivo") ?? ""),
    now(request),
  );
  return { ok: true };
}
export default function Tarefa({ loaderData: d }: Route.ComponentProps) {
  const { t } = useIdioma();
  const estados = {
    aberta: "Aberta",
    concluida: "Concluída",
    cancelada: "Cancelada",
  } as const;
  const eventos = {
    criada: "Criada",
    reaberta: "Reaberta",
    transferida: "Transferida",
    concluida: "Concluída",
    cancelada: "Cancelada",
  } as const;
  return (
    <>
      <p data-testid="codigo-tarefa">{d.tarefa.codigo}</p>
      <h1>{d.tarefa.titulo}</h1>
      <p>{d.tarefa.descricao}</p>
      <p data-testid="estado-tarefa">{t(estados[d.tarefa.estado])}</p>
      <p>
        {d.responsavel} · {d.tarefa.prazo.toLocaleString()}
      </p>
      <ul>
        {d.copias.map((c) => (
          <li key={c.id}>{c.nome}</li>
        ))}
      </ul>
      {d.tarefa.viagemId && (
        <Link to={`/viagens/${d.tarefa.viagemId}`}>
          {t("Viagem relacionada")}
        </Link>
      )}
      {d.tarefa.tipo === "manual" && (
        <Form method="post" className="lista-botoes">
          {d.tarefa.estado === "aberta" ? (
            <button name="intent" value="concluir">
              {t("Concluir tarefa")}
            </button>
          ) : (
            <button name="intent" value="reabrir">
              {t("Reabrir")}
            </button>
          )}
          {d.tarefa.estado !== "cancelada" && (
            <>
              <label>
                {t("Motivo do cancelamento")}
                <input name="motivo" />
              </label>
              <button name="intent" value="cancelar">
                {t("Cancelar tarefa")}
              </button>
            </>
          )}
        </Form>
      )}
      <section aria-label={t("Histórico da tarefa")}>
        <h2>{t("Histórico da tarefa")}</h2>
        <ul>
          {d.historico.map((e) => (
            <li key={e.id}>
              {t(eventos[e.tipo as keyof typeof eventos] ?? e.tipo)} · {e.autor}{" "}
              · {e.criadaEm.toLocaleString()} {e.motivo}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
