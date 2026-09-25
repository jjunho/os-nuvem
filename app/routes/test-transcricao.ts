import {
  fakeTranscricao,
  processarTranscricoes,
} from "~/modules/comunicador/transcricao.server";
import { now } from "~/clock.server";
export async function action({ request }: { request: Request }) {
  if (process.env.TEST_MODE !== "1")
    throw new Response("Not found", { status: 404 });
  const d = await request.json();
  fakeTranscricao.falhar = d.falhar === true;
  if (typeof d.texto === "string") fakeTranscricao.texto = d.texto;
  if (d.processar) await processarTranscricoes(now(request));
  return Response.json(fakeTranscricao);
}
