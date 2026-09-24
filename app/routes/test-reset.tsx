import type { Route } from "./+types/test-reset";
import { limparTudo, semear } from "~/db/seed.server";

// Only available in test mode: resets the database to the seed.
export async function action(_: Route.ActionArgs) {
  if (process.env.TEST_MODE !== "1") throw new Response("Not found", { status: 404 });
  await limparTudo();
  await semear();
  return Response.json({ ok: true });
}
