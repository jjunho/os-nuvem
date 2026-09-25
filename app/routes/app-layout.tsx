import { deveAbrirPainel } from "~/modules/comunicador/endereco";
import { Instalacao } from "~/modules/comunicador/Instalacao";
import { preferencia } from "~/modules/comunicador/preferencias.server";
import {
  guardarPaginaSessao,
  prepararShell,
} from "~/modules/comunicador/shell.client";
import { limparOffline } from "~/modules/comunicador/offline.client";
import { iniciarTranscricoes } from "~/modules/comunicador/transcricao.server";
import { Painel } from "~/modules/comunicador/Painel";
import { textos } from "~/modules/comunicador/textos";
import { iniciarFollowups } from "~/modules/orcamentos/agendador.server";
import { Busca } from "~/modules/interface/Busca";
import { useEffect, useState } from "react";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useFetcher,
  useLocation,
  data,
} from "react-router";
import {
  cookieIdioma,
  definirIdioma,
} from "~/modules/idiomas/idioma.server";
import { idiomaValido } from "~/modules/idiomas/catalogo";
import type { Route } from "./+types/app-layout";
import { exigirUsuario } from "~/session.server";
import { useIdioma } from "~/modules/idiomas/idioma";

export async function loader({ request }: Route.LoaderArgs) {
  iniciarFollowups();
  iniciarTranscricoes();
  const usuario = await exigirUsuario(request);
  return { usuario, preferencia: await preferencia(usuario) };
}

export async function action({ request }: Route.ActionArgs) {
  const usuario = await exigirUsuario(request);
  const form = await request.formData();
  const idioma = form.get("idioma");
  if (!idiomaValido(idioma))
    throw new Response("Idioma inválido", { status: 400 });
  await definirIdioma(usuario.id, idioma);
  return data(
    { ok: true },
    { headers: { "Set-Cookie": await cookieIdioma.serialize(idioma) } },
  );
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { idioma, t } = useIdioma();
  const preferencia = useFetcher();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/comunicador")
      guardarPaginaSessao(window.location.href);
    const q = new URLSearchParams(location.search);
    if (deveAbrirPainel(location.pathname, q)) setComunicador(true);
  }, [location.search, location.pathname]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [comunicador, setComunicador] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [cliente, setCliente] = useState(false);

  useEffect(() => setCliente(true), []);

  useEffect(() => {
    void prepararShell(loaderData.usuario.id).catch(() => {});
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
          <button
            aria-label={textos(idioma)("Comunicador")}
            onClick={() => setComunicador(!comunicador)}
          >
            {textos(idioma)("Comunicador")}
            {naoLidas > 0 && <span aria-hidden="true"> · {naoLidas}</span>}
          </button>
          <NavLink to="/" end>
            {t("Pipeline")}
          </NavLink>
          <NavLink to="/notificacoes">{t("Notificações")}</NavLink>
          <NavLink to="/tabelas">{t("Tabelas de referência")}</NavLink>
          <NavLink to="/quadros">
            {idioma === "ko" ? "보드" : "Quadros"}
          </NavLink>
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
        <Form
          method="post"
          action="/sair"
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            void limparOffline().finally(() => f.submit());
          }}
        >
          <button>{t("Sair")}</button>
        </Form>
      </header>
      <Instalacao
        key={loaderData.usuario.id}
        visto={loaderData.preferencia.aviso_visto}
      />
      <main className="pagina">
        <Outlet />
      </main>
      {cliente && (
        <Painel
          key={loaderData.usuario.id}
          aberta={comunicador}
          aoNaoLidas={setNaoLidas}
          usuarioId={loaderData.usuario.id}
          fechar={() => setComunicador(false)}
        />
      )}
      {aberto && <Busca aoFechar={() => setAberto(false)} />}
    </>
  );
}

