import { desc, eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { notificacoes } from "~/db/schema";

export function listarNotificacoes(usuarioId: number) {
  return db
    .select()
    .from(notificacoes)
    .where(eq(notificacoes.usuarioId, usuarioId))
    .orderBy(desc(notificacoes.id))
    .limit(100);
}

export async function lerEntregasDeTeste(): Promise<
  (typeof notificacoes.$inferSelect)[]
> {
  if (process.env.TEST_MODE !== "1")
    throw new Response("Not found", { status: 404 });
  return db.select().from(notificacoes);
}
