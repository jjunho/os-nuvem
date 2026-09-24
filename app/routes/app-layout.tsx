import { iniciarFollowups } from "~/modules/orcamentos/agendador.server";
import { rotuloEtapa } from "~/modules/viagens/rotulos";
import { useEffect, useRef, useState } from "react";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useFetcher,
  useNavigate,
  data,
} from "react-router";
import { eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { usuarios } from "~/db/schema";
import { cookieIdioma } from "~/modules/idiomas/idioma.server";
import { useIdioma } from "~/modules/idiomas/idioma";
import type { Route } from "./+types/app-layout";
import { exigirUsuario } from "~/session.server";
import type { loader as buscarLoader } from "./buscar";

export async function loader({ request }: Route.LoaderArgs) {
  iniciarFollowups();
  const usuario = await exigirUsuario(request);
  return { usuario };
}

export async function action({ request }: Route.ActionArgs) {
  const usuario = await exigirUsuario(request);
  const form = await request.formData();
  const idioma = form.get("idioma");
  if (idioma !== "pt" && idioma !== "ko")
    throw new Response("Idioma inválido", { status: 400 });
  await db
    .update(usuarios)
    .set({ idiomaInterface: idioma })
    .where(eq(usuarios.id, usuario.id));
  return data(
    { ok: true },
    { headers: { "Set-Cookie": await cookieIdioma.serialize(idioma) } },
  );
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { idioma, t } = useIdioma();
  const preferencia = useFetcher();
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberto(true);
      }
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="topo">
        <Link to="/" className="marca-app">
          Corealux OS
        </Link>
        <nav>
          <NavLink to="/" end>
            {t("Pipeline")}
          </NavLink>
          <NavLink to="/notificacoes">{t("Notificações")}</NavLink>
          <NavLink to="/tabelas">{t("Tabelas de referência")}</NavLink>
          <NavLink to="/tarefas">{t("Tarefas")}</NavLink>
          <NavLink to="/viagens/nova">{t("Nova viagem")}</NavLink>
          {loaderData.usuario.papel === "admin" && (
            <NavLink to="/modelos-resposta">
              {t("Modelos de primeira resposta")}
            </NavLink>
          )}
          {loaderData.usuario.papel === "admin" && (
            <NavLink to="/opcoes">{t("Opções conhecidas")}</NavLink>
          )}
        </nav>
        <button
          className="busca-atalho"
          onClick={() => setAberto(true)}
          aria-label={t("Buscar")}
        >
          {t("Buscar")} <kbd>Ctrl K</kbd>
        </button>
        <span className="usuario">{loaderData.usuario.nome}</span>
        <preferencia.Form method="post" action="/preferencias">
          <select
            name="idioma"
            aria-label={t("Idioma da interface")}
            value={idioma}
            onChange={(e) => preferencia.submit(e.currentTarget.form)}
          >
            <option value="pt">{t("Português")}</option>
            <option value="ko">한국어</option>
          </select>
        </preferencia.Form>
        <Form method="post" action="/sair">
          <button>{t("Sair")}</button>
        </Form>
      </header>
      <main className="pagina">
        <Outlet />
      </main>
      {aberto && <Busca onFechar={() => setAberto(false)} />}
    </>
  );
}

function Busca({ onFechar }: { onFechar: () => void }) {
  const { t } = useIdioma();
  const fetcher = useFetcher<typeof buscarLoader>();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [sel, setSel] = useState(0);
  const resultados = fetcher.data?.resultados ?? [];

  useEffect(() => input.current?.focus(), []);

  const abrir = (id: number) => {
    onFechar();
    navigate(`/viagens/${id}`);
  };

  return (
    <div className="busca-fundo" onClick={onFechar}>
      <div
        className="busca"
        role="dialog"
        aria-label={t("Buscar viagem")}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={input}
          placeholder={t("Código, contato, telefone, e-mail ou agência")}
          onChange={(e) => {
            setSel(0);
            fetcher.load(`/buscar?q=${encodeURIComponent(e.target.value)}`);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown")
              setSel((s) => Math.min(s + 1, resultados.length - 1));
            if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0));
            if (e.key === "Enter" && resultados[sel]) abrir(resultados[sel].id);
          }}
        />
        <ul>
          {resultados.map((r, i) => (
            <li
              key={`${r.id}-${r.contato}`}
              className={i === sel ? "ativo" : ""}
              onMouseDown={() => abrir(r.id)}
            >
              <strong>{r.codigo}</strong> {r.contato}{" "}
              <span className="etapa">{t(rotuloEtapa[r.etapa])}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
