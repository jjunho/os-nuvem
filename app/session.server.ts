import { createCookie, redirect } from "react-router";
import { now } from "~/clock.server";
import { usuarioDaSessao } from "~/modules/acesso/acesso.server";

const cookie = createCookie("sessao", { httpOnly: true, sameSite: "lax", path: "/" });

export async function lerToken(request: Request): Promise<string | null> {
  const valor: unknown = await cookie.parse(request.headers.get("cookie"));
  return typeof valor === "string" && /^[a-f0-9]{64}$/.test(valor) ? valor : null;
}

export function destinoSeguro(destino: string | null) {
  if (!destino?.startsWith("/") || destino.startsWith("//") || /[\\\x00-\x20]/.test(destino)) return "/";
  return destino;
}

export async function exigirUsuario(request: Request) {
  const usuario = await usuarioDaSessao(await lerToken(request), now(request));
  if (usuario) return usuario;
  const url = new URL(request.url);
  // React Router's data transport suffix is not a navigable page.
  const caminho = url.pathname.replace(/\.data$/, "").replace(/^\/_root$/, "/");
  url.searchParams.delete("_routes");
  throw redirect(`/entrar?destino=${encodeURIComponent(caminho + url.search)}`);
}

export function cookieDeSessao(request: Request, sessao: { token: string; expiraEm: Date }) {
  return cookie.serialize(sessao.token, { maxAge: Math.max(0, Math.floor((sessao.expiraEm.getTime() - now(request).getTime()) / 1000)), secure: usaHttps(request) });
}

export function apagarCookie(request: Request) {
  return cookie.serialize("", { maxAge: 0, secure: usaHttps(request) });
}

function usaHttps(request: Request) {
  return new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto")?.split(",")[0].trim() === "https";
}
