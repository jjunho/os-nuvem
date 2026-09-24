import { useEffect, useRef, useState } from "react";
import { Form, Link, NavLink, Outlet, useFetcher, useNavigate } from "react-router";
import type { Route } from "./+types/app-layout";
import { exigirUsuario } from "~/session.server";
import type { loader as buscarLoader } from "./buscar";

export async function loader({ request }: Route.LoaderArgs) {
  const usuario = await exigirUsuario(request);
  return { usuario };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
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
            Pipeline
          </NavLink>
          <NavLink to="/viagens/nova">Nova viagem</NavLink>
        </nav>
        <button className="busca-atalho" onClick={() => setAberto(true)} aria-label="Buscar">
          Buscar <kbd>Ctrl K</kbd>
        </button>
        <span className="usuario">{loaderData.usuario.nome}</span>
        <Form method="post" action="/sair"><button>Sair</button></Form>
      </header>
      <main className="pagina">
        <Outlet />
      </main>
      {aberto && <Busca onFechar={() => setAberto(false)} />}
    </>
  );
}

function Busca({ onFechar }: { onFechar: () => void }) {
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
      <div className="busca" role="dialog" aria-label="Buscar viagem" onClick={(e) => e.stopPropagation()}>
        <input
          ref={input}
          placeholder="Código, contato, telefone, e-mail ou agência"
          onChange={(e) => {
            setSel(0);
            fetcher.load(`/buscar?q=${encodeURIComponent(e.target.value)}`);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setSel((s) => Math.min(s + 1, resultados.length - 1));
            if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0));
            if (e.key === "Enter" && resultados[sel]) abrir(resultados[sel].id);
          }}
        />
        <ul>
          {resultados.map((r, i) => (
            <li key={`${r.id}-${r.contato}`} className={i === sel ? "ativo" : ""} onMouseDown={() => abrir(r.id)}>
              <strong>{r.codigo}</strong> {r.contato} <span className="etapa">{r.etapa}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
