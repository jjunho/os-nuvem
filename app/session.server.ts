import { redirect } from "react-router";
import { eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { usuarios } from "~/db/schema";

// Login method is not decided yet (ADR-0003). Until it is, a staff member picks
// who they are on /entrar and we keep their id in a cookie.
const COOKIE = "usuario";

export function lerUsuarioId(request: Request): number | null {
  const m = new RegExp(`(?:^|;\\s*)${COOKIE}=(\\d+)`).exec(request.headers.get("cookie") ?? "");
  return m ? Number(m[1]) : null;
}

export async function exigirUsuario(request: Request) {
  const id = lerUsuarioId(request);
  if (id) {
    const [u] = await db.select().from(usuarios).where(eq(usuarios.id, id));
    if (u) return u;
  }
  throw redirect("/entrar");
}

export function cookieDeUsuario(id: number) {
  return `${COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`;
}
