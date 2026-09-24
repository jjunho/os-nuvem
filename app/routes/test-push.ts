import { db } from "~/db/client.server";
import { notificacoes } from "~/db/schema";
export async function loader() {
  if (process.env.TEST_MODE !== "1")
    throw new Response("Not found", { status: 404 });
  return { pushes: await db.select().from(notificacoes) };
}
