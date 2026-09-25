import { useFiltrosURL } from "~/modules/interface/filtros-url";
import { inteiroEntrada } from "~/modules/validacao/entrada";
import { useEffect, useRef, useState } from "react";
import { Form, Link, useFetcher, useRevalidator } from "react-router";
import type { Route } from "./+types/quadro";
import { exigirUsuario } from "~/session.server";
import { now } from "~/clock.server";
import { lerQuadro, acaoQuadro } from "~/modules/quadros/quadros.server";
import { useIdioma } from "~/modules/idiomas/idioma";
import { useQuadrosTexto } from "~/modules/quadros/textos";
import { erroDeFormulario } from "~/modules/interface/erro-formulario.server";
import "~/modules/quadros/quadros.css";
export async function loader({ request, params }: Route.LoaderArgs) {
  const u = await exigirUsuario(request);
  return {
    ...(await lerQuadro(
      u,
      inteiroEntrada(params.id),
      new URL(request.url).searchParams,
      now(request),
    )),
    usuario: u,
  };
}
export async function action({ request, params }: Route.ActionArgs) {
  try {
    await acaoQuadro(
      await exigirUsuario(request),
      inteiroEntrada(params.id),
      await request.formData(),
      now(request),
    );
    return { ok: true };
  } catch (e) {
    return erroDeFormulario(e);
  }
}
export default function Quadro(props: Route.ComponentProps) {
  return <PaginaQuadro key={props.loaderData.quadro.id} {...props} />;
}

function PaginaQuadro({ loaderData: d, actionData }: Route.ComponentProps) {
  const filtro = useFiltrosURL(d.filtros);
  const { mensagem } = useIdioma();
  const t = useQuadrosTexto(),
    fetcher = useFetcher<typeof action>(),
    { revalidate } = useRevalidator();
  const [movendo, setMovendo] = useState<number | null>(null);
  const movimentoEmCurso = useRef(false);
  const tentativa =
    fetcher.state !== "idle" && fetcher.formData?.get("intent") === "mover"
      ? fetcher.formData
      : null;
  const otimista = tentativa
    ? {
        id: Number(tentativa.get("tarefaId")),
        lista: Number(tentativa.get("listaId")),
        antes: Number(tentativa.get("antesId")) || undefined,
      }
    : null;
  useEffect(() => {
    const s = new EventSource("/comunicador/eventos");
    s.onmessage = () => {
      if (document.visibilityState === "visible") void revalidate();
    };
    return () => s.close();
  }, [revalidate]);
  const listas = d.listas.filter(
    (l) => !l.arquivada || d.filtros.arquivadas === "on",
  );
  const tarefas = d.tarefas.map((a) =>
    otimista?.id === a.id ? { ...a, lista_id: otimista.lista } : a,
  );
  if (otimista) {
    const i = tarefas.findIndex((a) => a.id === otimista.id);
    if (i >= 0) {
      const [movida] = tarefas.splice(i, 1);
      const j = otimista.antes
        ? tarefas.findIndex((a) => a.id === otimista.antes)
        : -1;
      if (j >= 0) tarefas.splice(j, 0, movida);
      else tarefas.push(movida);
    }
  }
  async function mover(id: number, lista: number, antes?: number) {
    if (movimentoEmCurso.current) return;
    const destino = d.destinos.find((l) => l.id === lista);
    if (!destino) return;
    movimentoEmCurso.current = true;
    try {
      await fetcher.submit(
        {
          intent: "mover",
          tarefaId: id,
          listaId: lista,
          ...(antes ? { antesId: antes } : {}),
        },
        { method: "post", action: `/quadros/${destino.quadro_id}` },
      );
    } finally {
      movimentoEmCurso.current = false;
    }
  }
  const cartao = (a: (typeof tarefas)[number]) => (
    <article
      className="quadro-tarefa"
      draggable={!d.quadro.arquivado}
      key={a.id}
      onDragStart={(e) => e.dataTransfer.setData("text/plain", String(a.id))}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = Number(e.dataTransfer.getData("text/plain"));
        if (id && id !== a.id) mover(id, a.lista_id, a.id);
      }}
      style={{
        textDecoration: a.estado === "concluida" ? "line-through" : undefined,
      }}
    >
      {a.capa && (
        <img
          className="quadro-capa"
          src={`/tarefas/${a.id}/anexos/${a.capa}`}
          alt={t("Capa")}
        />
      )}
      <Link to={a.cartao.url}>{a.cartao.titulo}</Link>
      {a.cartao.preco != null && <p>USD {(a.cartao.preco / 100).toFixed(2)}</p>}
      <p>
        {a.responsavel} ·{" "}
        {a.prazo ? new Date(a.prazo).toLocaleDateString() : t("Sem prazo")}
      </p>
      {a.etiquetas.map((e) => (
        <span className="quadro-etiqueta" key={e}>
          {e}
        </span>
      ))}
      {!d.quadro.arquivado && (
        <details
          onToggle={(e) => {
            if (e.currentTarget.open) setMovendo(a.id);
          }}
        >
          <summary>{t("Mover")}</summary>
          {movendo === a.id && (
            <>
              <fetcher.Form
                method="post"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  mover(Number(f.get("tarefaId")), Number(f.get("listaId")));
                }}
              >
                <input type="hidden" name="intent" value="mover" />
                <input type="hidden" name="tarefaId" value={a.id} />
                <label>
                  {t("Lista")}
                  <select
                    aria-label={t("Lista")}
                    name="listaId"
                    defaultValue={a.lista_id}
                  >
                    {d.destinos.map((l) => (
                      <option key={l.id} value={l.id}>
                        {t(
                          d.quadros.find((q) => q.id === l.quadro_id)?.nome ??
                            "",
                        )}{" "}
                        · {t(l.nome)}
                      </option>
                    ))}
                  </select>
                </label>
                <button>{t("Mover")}</button>
              </fetcher.Form>
              <button
                onClick={() => {
                  const items = tarefas.filter(
                    (x) => x.lista_id === a.lista_id,
                  );
                  const anterior =
                    items[items.findIndex((x) => x.id === a.id) - 1];
                  if (anterior) mover(a.id, a.lista_id, anterior.id);
                }}
              >
                {t("Subir")}
              </button>
              <Link to={`/tarefas/${a.id}`}>{t("Abrir tarefa")}</Link>
            </>
          )}
        </details>
      )}
    </article>
  );
  const grupos = new Map<string, typeof tarefas>();
  for (const a of tarefas) {
    const k = a.prazo
      ? new Date(a.prazo).toISOString().slice(0, 10)
      : t("Sem prazo");
    grupos.set(k, [...(grupos.get(k) ?? []), a]);
  }
  return (
    <>
      <Link to="/quadros">{t("Quadros")}</Link>
      <h1>{t(d.quadro.nome)}</h1>
      {d.quadro.arquivado && <p>{t("Arquivado")}</p>}
      {actionData && "erro" in actionData && actionData.erro && (
        <p role="alert">{mensagem(actionData.erro)}</p>
      )}
      {fetcher.data && "erro" in fetcher.data && fetcher.data.erro && (
        <p role="alert">{mensagem(fetcher.data.erro)}</p>
      )}
      <nav className="linha">
        {d.quadros
          .filter((q) => !q.arquivado && q.id !== d.quadro.id)
          .map((q) => (
            <Link
              key={q.id}
              to={`/quadros/${q.id}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = Number(e.dataTransfer.getData("text/plain")),
                  l = d.destinos.find((l) => l.quadro_id === q.id);
                if (id && l) mover(id, l.id);
              }}
            >
              {t(q.nome)}
            </Link>
          ))}
      </nav>
      <Form method="get" className="linha">
        <label>
          {t("Pesquisar")}
          <input
            name="q"
            value={filtro.valores.q ?? ""}
            onChange={(e) => filtro.alterar("q", e.target.value)}
          />
        </label>
        <label>
          {t("Responsável")}
          <select
            aria-label={t("Responsável")}
            name="responsavel"
            value={filtro.valores.responsavel ?? ""}
            onChange={(e) => filtro.alterar("responsavel", e.target.value)}
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
          {t("Etiquetas")}
          <select
            aria-label={t("Etiquetas")}
            name="etiqueta"
            value={filtro.valores.etiqueta ?? ""}
            onChange={(e) => filtro.alterar("etiqueta", e.target.value)}
          >
            <option value="">{t("Todas")}</option>
            {d.etiquetas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Viagem")}
          <select
            aria-label={t("Viagem")}
            name="viagem"
            value={filtro.valores.viagem ?? ""}
            onChange={(e) => filtro.alterar("viagem", e.target.value)}
          >
            <option value="">{t("Todas")}</option>
            {[
              ...new Set(
                [
                  Number(d.filtros.viagem),
                  ...d.tarefas.map((a) => a.viagem_id),
                ].filter(Boolean),
              ),
            ].map((id) => (
              <option key={id} value={id!}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Prazo")}
          <select
            aria-label={t("Prazo")}
            name="prazo"
            value={filtro.valores.prazo ?? ""}
            onChange={(e) => filtro.alterar("prazo", e.target.value)}
          >
            <option value="">{t("Todas")}</option>
            <option value="atrasadas">{t("Atrasadas")}</option>
            <option value="hoje">{t("Hoje")}</option>
            <option value="sem">{t("Sem prazo")}</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            name="ocultarConcluidas"
            checked={filtro.valores.ocultarConcluidas !== undefined}
            onChange={(e) =>
              filtro.alterar(
                "ocultarConcluidas",
                e.target.checked ? "on" : undefined,
              )
            }
          />
          {t("Ocultar concluídas")}
        </label>
        <label>
          <input
            type="checkbox"
            name="arquivadas"
            checked={filtro.valores.arquivadas !== undefined}
            onChange={(e) =>
              filtro.alterar("arquivadas", e.target.checked ? "on" : undefined)
            }
          />
          {t("Mostrar arquivadas")}
        </label>
        <select
          name="vista"
          aria-label={t("Calendário")}
          value={filtro.valores.vista ?? "listas"}
          onChange={(e) => filtro.alterar("vista", e.target.value)}
        >
          <option value="listas">{t("Listas")}</option>
          <option value="calendario">{t("Calendário")}</option>
        </select>
        <button>{t("Filtrar")}</button>
      </Form>
      {d.filtros.vista === "calendario" ? (
        <div className="quadro-calendario">
          {[...grupos]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dia, items]) => (
              <section key={dia}>
                <h2>{dia}</h2>
                {items.map(cartao)}
              </section>
            ))}
        </div>
      ) : (
        <div className="quadros-listas">
          {listas.map((l, i) => (
            <section
              key={l.id}
              data-testid={
                l.conclusao
                  ? "lista-conclusao"
                  : i === 0
                    ? "lista-novo"
                    : `lista-${l.id}`
              }
              className="quadro-lista"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = Number(e.dataTransfer.getData("text/plain"));
                if (id) mover(id, l.id);
              }}
            >
              <h2>{t(l.nome)}</h2>
              {tarefas.filter((a) => a.lista_id === l.id).map(cartao)}
              {!d.quadro.arquivado && (
                <details>
                  <summary>{t("Listas")}</summary>
                  <Form method="post">
                    <input type="hidden" name="listaId" value={l.id} />
                    <input
                      name="nome"
                      aria-label={t("Nome")}
                      defaultValue={l.nome}
                    />
                    <button name="intent" value="renomear-lista">
                      {t("Renomear")}
                    </button>
                    <button name="intent" value="arquivar-lista">
                      {t("Arquivar")}
                    </button>
                    <button name="intent" value="conclusao">
                      {t("Lista de conclusão")}
                    </button>
                    <label>
                      <input name="semConclusao" type="checkbox" />
                      {t("Sem lista de conclusão")}
                    </label>
                  </Form>
                  <Form method="post">
                    <input type="hidden" name="intent" value="ordenar-lista" />
                    <input type="hidden" name="listaId" value={l.id} />
                    <input
                      type="hidden"
                      name="posicao"
                      value={
                        i > 0
                          ? Number(listas[i - 1].posicao) - 0.5
                          : Number(l.posicao) - 1
                      }
                    />
                    <button>{t("Subir")}</button>
                  </Form>
                </details>
              )}
            </section>
          ))}
        </div>
      )}
      <nav>
        {d.pagina > 0 && (
          <Link
            to={`?${new URLSearchParams({ ...d.filtros, pagina: String(d.pagina - 1) })}`}
          >
            {t("Anterior")}
          </Link>
        )}
        {d.mais && (
          <Link
            to={`?${new URLSearchParams({ ...d.filtros, pagina: String(d.pagina + 1) })}`}
          >
            {t("Próximo")}
          </Link>
        )}
      </nav>
      {!d.quadro.arquivado && (
        <>
          <Form method="post" className="linha">
            <input type="hidden" name="intent" value="criar-tarefa" />
            <label>
              {t("Título")}
              <input name="titulo" required />
            </label>
            <label>
              {t("Prazo")}
              <input type="datetime-local" name="prazo" />
            </label>
            <label>
              {t("Lista")}
              <select aria-label={t("Lista")} name="listaId">
                {d.listas
                  .filter((l) => !l.arquivada && !l.conclusao)
                  .map((l) => (
                    <option value={l.id} key={l.id}>
                      {t(l.nome)}
                    </option>
                  ))}
              </select>
            </label>
            <button>{t("Criar tarefa")}</button>
          </Form>
          <Form method="post">
            <input type="hidden" name="intent" value="criar-lista" />
            <label>
              {t("Nome")}
              <input name="nome" required />
            </label>
            <button>{t("Criar lista")}</button>
          </Form>
          <Form method="post">
            <label>
              {t("Nome")}
              <input name="nome" defaultValue={d.quadro.nome} />
            </label>
            <button name="intent" value="renomear-quadro">
              {t("Renomear")}
            </button>
          </Form>
          {!d.quadro.pessoal && (
            <>
              <h2>{t("Membros")}</h2>
              {d.membros.map((m) => (
                <Form method="post" key={m.id}>
                  {m.nome}
                  <input type="hidden" name="usuarioId" value={m.id} />
                  {(d.usuario.id === d.quadro.criador_id ||
                    d.usuario.papel === "admin") &&
                    m.id !== d.quadro.criador_id && (
                      <button name="intent" value="remover-membro">
                        {t("Remover membro")}
                      </button>
                    )}
                </Form>
              ))}
              <Form method="post">
                <select name="usuarioId" aria-label={t("Pessoa")}>
                  {d.usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
                <button name="intent" value="compartilhar">
                  {t("Compartilhar")}
                </button>
                {(d.usuario.id === d.quadro.criador_id ||
                  d.usuario.papel === "admin") && (
                  <button name="intent" value="arquivar-quadro">
                    {t("Arquivar")}
                  </button>
                )}
              </Form>
            </>
          )}
        </>
      )}
    </>
  );
}
