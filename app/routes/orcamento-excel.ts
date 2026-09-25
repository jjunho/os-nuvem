import { inteiroEntrada } from "~/modules/validacao/entrada";
import type { Route } from "./+types/orcamento-excel";
import { exigirUsuario } from "~/session.server";
import { lerOrcamento } from "~/modules/orcamentos/orcamentos.server";
import { exportarExcel } from "~/modules/orcamentos/excel.server";
export async function loader({ request, params }: Route.LoaderArgs) {
  await exigirUsuario(request);
  const d = await lerOrcamento(inteiroEntrada(params.id));
  const bytes = await exportarExcel(
    d.orcamento.memoria?.dados ?? d.orcamento.dados,
    d.orcamento.memoria?.referencias ?? d.referencias,
    d.orcamento.memoria?.pessoas ?? d.pessoas,
    d.orcamento.memoria?.calculos,
  );
  return new Response(bytes, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Orcamento ${d.viagem.codigo} v${d.orcamento.versao}.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  });
}
