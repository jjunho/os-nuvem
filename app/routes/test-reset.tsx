import { limparPresencasDeTeste } from "~/modules/comunicador/presenca.server";
import { fakeTranscricao } from "~/modules/comunicador/transcricao.server";
import type { Route } from "./+types/test-reset";
import { limparTudo, semear } from "~/db/seed.server";

// Only available in test mode: resets the database to the seed.
export async function action(_: Route.ActionArgs) {
  if (process.env.TEST_MODE !== "1")
    throw new Response("Not found", { status: 404 });
  limparPresencasDeTeste();
  Object.assign(fakeTranscricao, {
    falhar: false,
    texto: "Transcrição de teste",
    chamadas: 0,
  });
  await limparTudo();
  await semear();
  return Response.json({ ok: true });
}
