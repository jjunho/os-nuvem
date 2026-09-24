import { renderToStaticMarkup } from "react-dom/server";
import type { Route } from "./+types/proposta";
import { exigirUsuario } from "~/session.server";
import { db } from "~/db/client.server";
import { orcamentos } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Proposta, resumoProposta } from "~/modules/documentos/proposta";
import { gerarPDF } from "~/modules/documentos/pdf.server";
export async function loader({ request, params }: Route.LoaderArgs) {
  await exigirUsuario(request);
  const [orcamento] = await db
    .select({ id: orcamentos.id, memoria: orcamentos.memoria })
    .from(orcamentos)
    .where(eq(orcamentos.id, Number(params.id)));
  const memoria = orcamento?.memoria;
  if (!memoria)
    throw new Response("Envie a versão antes de gerar a proposta", {
      status: 400,
    });
  const formato = new URL(request.url).searchParams.get("formato");
  if (formato === "texto")
    return new Response(resumoProposta(memoria), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "private, no-store",
      },
    });
  const html =
    "<!doctype html>" +
    renderToStaticMarkup(
      <Proposta
        memoria={memoria}
        pdfHref={
          formato === "pdf"
            ? undefined
            : `/propostas/${orcamento.id}?formato=pdf`
        }
      />,
    );
  if (formato === "pdf") {
    const pdf = await gerarPDF(html);
    const nome = `Proposta ${memoria.cliente.replace(/[\\/\r\n]/g, " ")} ${memoria.enviadaEm.slice(0, 10).replaceAll("-", "")} v${memoria.versao}.pdf`;
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Proposta.pdf"; filename*=UTF-8''${encodeURIComponent(nome)}`,
        "Cache-Control": "private, no-store",
      },
    });
  }
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
