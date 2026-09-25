import { inteiroEntrada } from "~/modules/validacao/entrada";
import { useActionData, useNavigation } from "react-router";
import { erroDeFormulario } from "~/modules/interface/erro-formulario.server";
import { useQuadrosTexto } from "~/modules/quadros/textos";
import { acaoDaTarefaEtapa } from "~/modules/viagens/tarefas-etapa.server";
import { extrasTarefa, acaoTarefa } from "~/modules/quadros/quadros.server";
import { anexar } from "~/modules/quadros/arquivos.server";
import { Detalhes } from "~/modules/quadros/Detalhes";
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
  const u = await exigirUsuario(request),
    id = inteiroEntrada(params.id);
  const d = await detalheTarefa(u, id);
  return {
    ...d,
    extras: await extrasTarefa(u, id),
    acaoEtapa:
      d.tarefa.tipo !== "manual" && d.tarefa.viagemId
        ? await acaoDaTarefaEtapa(id, d.tarefa.viagemId)
        : null,
  };
}
export async function action({ request, params }: Route.ActionArgs) {
  try {
    const usuario = await exigirUsuario(request);
    if (Number(request.headers.get("content-length")) > 13 * 1024 * 1024)
      throw new Response("Arquivo muito grande", { status: 413 });
    const f = await request.formData();
    if (f.get("intent") === "anexar") {
      await anexar(usuario, inteiroEntrada(params.id), f);
      return { ok: true };
    }
    if (
      !["concluir", "reabrir", "cancelar"].includes(String(f.get("intent")))
    ) {
      await acaoTarefa(usuario, inteiroEntrada(params.id), f, now(request));
      return { ok: true };
    }
    await mudarEstadoTarefa(
      usuario,
      inteiroEntrada(params.id),
      String(f.get("intent")),
      String(f.get("motivo") ?? ""),
      now(request),
    );
    return { ok: true };
  } catch (erro) {
    return erroDeFormulario(erro);
  }
}
export default function Tarefa({ loaderData: d }: Route.ComponentProps) {
  const { t } = useIdioma();
  const qt = useQuadrosTexto();
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
  const resultado = useActionData<typeof action>();
  const pendente = useNavigation().state !== "idle";
  const { mensagem: mensagemErro } = useIdioma();
  return (
    <>
      {resultado && "erro" in resultado && resultado.erro && (
        <p role="alert">{mensagemErro(resultado.erro)}</p>
      )}
      <p data-testid="codigo-tarefa">{d.tarefa.codigo}</p>
      <h1>{d.tarefa.titulo}</h1>
      <p>
        {/^\/tarefas\/\d+$/.test(d.tarefa.descricao) ? (
          <Link to={d.tarefa.descricao}>{d.tarefa.descricao}</Link>
        ) : (
          d.tarefa.descricao
        )}
      </p>
      {d.tarefa.origemMensagemId && (
        <Link to={`/?mensagem=${d.tarefa.origemMensagemId}`}>
          {t("Mensagem de origem")}
        </Link>
      )}
      <p data-testid="estado-tarefa">{t(estados[d.tarefa.estado])}</p>
      <p>
        {d.responsavel} · {d.tarefa.prazo?.toLocaleString()}
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
            <button disabled={pendente} name="intent" value="concluir">
              {t("Concluir tarefa")}
            </button>
          ) : (
            <button disabled={pendente} name="intent" value="reabrir">
              {t("Reabrir")}
            </button>
          )}
          {d.tarefa.estado !== "cancelada" && (
            <>
              <label>
                {t("Motivo do cancelamento")}
                <input name="motivo" />
              </label>
              <button disabled={pendente} name="intent" value="cancelar">
                {t("Cancelar tarefa")}
              </button>
            </>
          )}
        </Form>
      )}
      {d.acaoEtapa && <Link to={d.acaoEtapa}>{t("Concluir tarefa")}</Link>}
      <Detalhes
        dados={d.extras}
        id={d.tarefa.id}
        responsavelId={d.tarefa.responsavelId}
        prazo={d.tarefa.prazo}
        tipo={d.tarefa.tipo}
        viagemId={d.tarefa.viagemId}
      />
      <section aria-label={t("Histórico da tarefa")}>
        <h2>{t("Histórico da tarefa")}</h2>
        <ul>
          {d.historico.map((e) => (
            <li key={e.id}>
              {eventos[e.tipo as keyof typeof eventos]
                ? t(eventos[e.tipo as keyof typeof eventos])
                : qt(e.tipo)}{" "}
              · {e.autor} · {e.criadaEm.toLocaleString()} {e.motivo}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
