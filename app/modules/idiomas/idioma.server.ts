import { eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { usuarios } from "~/db/schema";
import { createCookie } from "react-router";
import { usuarioDaSessao } from "~/modules/acesso/acesso.server";
import { lerToken } from "~/session.server";
import { now } from "~/clock.server";
import type { IdiomaInterface } from "./catalogo";

export const cookieIdioma = createCookie("idioma", {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  maxAge: 31536000,
});

export async function idiomaDaInterface(
  request: Request,
): Promise<IdiomaInterface> {
  const usuario = await usuarioDaSessao(await lerToken(request), now(request));
  const idioma =
    usuario?.idiomaInterface ??
    (await cookieIdioma.parse(request.headers.get("cookie")));
  return idioma === "ko" ? "ko" : "pt";
}
export async function definirIdioma(
  usuarioId: number,
  idioma: IdiomaInterface,
): Promise<void> {
  await db
    .update(usuarios)
    .set({ idiomaInterface: idioma })
    .where(eq(usuarios.id, usuarioId));
}
