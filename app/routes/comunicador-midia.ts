import { exigirUsuario } from "~/session.server";
import { now } from "~/clock.server";
import { receberMidia } from "~/modules/comunicador/midia.server";
export async function action({ request }: { request: Request }) {
  const u = await exigirUsuario(request);
  if (Number(request.headers.get("content-length")) > 13 * 1024 * 1024)
    throw new Response("Arquivo muito grande", { status: 413 });
  return Response.json(
    await receberMidia(
      u,
      await request.formData(),
      now(request),
      new URL(request.url).origin,
    ),
  );
}
