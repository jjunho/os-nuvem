import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteLoaderData,
} from "react-router";
import { idiomaDaInterface } from "~/modules/idiomas/idioma.server";
import type { Route } from "./+types/root";
import "./app.css";

export const meta: Route.MetaFunction = () => [{ title: "Corealux OS" }];

export async function loader({ request }: Route.LoaderArgs) {
  return { idioma: await idiomaDaInterface(request) };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const dados = useRouteLoaderData<typeof loader>("root");
  const formulario = useRouteLoaderData<{ idioma: string }>(
    "routes/formulario",
  );
  return (
    <html
      lang={formulario?.idioma ?? (dados?.idioma === "ko" ? "ko" : "pt-BR")}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#17645f" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const msg = isRouteErrorResponse(error)
    ? error.status < 500 && typeof error.data === "string" && error.data
      ? error.data
      : `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Erro";
  return (
    <main className="pagina">
      <h1>Algo deu errado</h1>
      <p>{msg}</p>
    </main>
  );
}
