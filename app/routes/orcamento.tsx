import { listarDisponibilidade } from "~/modules/profissionais/profissionais.server";
import {
  destinatarioDaViagem,
  enviarOrcamento,
  iniciarNovaVersao,
} from "~/modules/orcamentos/envios.server";
import {
  confirmarPedido,
  extrairPedido,
} from "~/modules/orcamentos/pedido.server";
import { importarExcel } from "~/modules/orcamentos/excel.server";
import { data, redirect } from "react-router";
import type { Route } from "./+types/orcamento";
import { EditorOrcamento } from "~/modules/orcamentos/EditorOrcamento";
import { now } from "~/clock.server";
import { exigirUsuario } from "~/session.server";
import {
  lerOrcamento,
  salvarOrcamento,
  registrarPagamentoTaxa,
} from "~/modules/orcamentos/orcamentos.server";
import { lerIntent, lerInteiroPositivo } from "~/modules/orcamentos/validacao";
import type { Resposta, RetornoOrcamento } from "~/modules/orcamentos/acoes";
export async function loader({ request, params }: Route.LoaderArgs) {
  await exigirUsuario(request);
  const d = await lerOrcamento(lerInteiroPositivo(params.id));
  return {
    ...d,
    ...(await listarDisponibilidade()),
    destinatario: await destinatarioDaViagem(d.viagem.id),
  };
}
export async function action({ request, params }: Route.ActionArgs) {
  const usuario = await exigirUsuario(request);
  const f = await request.formData();
  const resultado = (r: Resposta): RetornoOrcamento => ({
    ...r,
    requestId: String(f.get("requestId") ?? ""),
    orcamentoId: Number(params.id),
  });
  try {
    const intent = lerIntent(f.get("intent"));
    const orcamentoId = lerInteiroPositivo(params.id);
    if (intent === "pagar-taxa") {
      await registrarPagamentoTaxa(orcamentoId, usuario.id, now(request));
      return resultado({ tipo: "pagar-taxa" });
    }
    if (intent === "enviar") {
      await enviarOrcamento(
        orcamentoId,
        usuario.id,
        String(f.get("destinatario") ?? ""),
        String(f.get("canal") ?? ""),
        now(request),
        lerInteiroPositivo(f.get("revisao")),
      );
      return resultado({ tipo: "enviar" });
    }
    if (intent === "nova-versao") {
      const nova = await iniciarNovaVersao(
        orcamentoId,
        usuario.id,
        now(request),
      );
      return redirect(`/orcamentos/${nova.id}`);
    }
    if (intent === "preparar-pedido")
      return resultado({
        tipo: "preparar-pedido",
        texto: String(f.get("pedidoTexto") ?? ""),
        pedido: extrairPedido(String(f.get("pedidoTexto") ?? "")),
      });
    if (intent === "confirmar-pedido") {
      const salvo = await confirmarPedido(
        orcamentoId,
        lerInteiroPositivo(f.get("revisao")),
        String(f.get("pedidoTexto") ?? ""),
      );
      return resultado({
        tipo: "confirmar-pedido",
        revisao: salvo.revisao,
        dados: salvo.dados,
      });
    }
    if (intent === "importar-excel") {
      const arquivo = f.get("arquivo");
      if (!(arquivo instanceof File) || arquivo.size > 5 * 1024 * 1024)
        throw new Response("Use um arquivo do modelo CoreaLux com até 5 MB", {
          status: 400,
        });
      const d = await lerOrcamento(lerInteiroPositivo(params.id));
      const importacao = await importarExcel(
        await arquivo.arrayBuffer(),
        d.pessoas,
      );
      return resultado({
        tipo: "importar-excel",
        importacao,
        revisao: d.orcamento.revisao,
      });
    }
    let dados: unknown;
    try {
      dados = JSON.parse(String(f.get("dados")));
    } catch {
      throw new Response("Orçamento inválido", { status: 400 });
    }
    const salvo = await salvarOrcamento(
      orcamentoId,
      lerInteiroPositivo(f.get("revisao")),
      dados,
      usuario.id,
      now(request),
      intent === "atualizar-referencias",
    );
    return resultado({
      tipo: "salvar",
      revisao: salvo.revisao,
      dados: salvo.dados,
    });
  } catch (e) {
    if (e instanceof Response && [400, 409].includes(e.status))
      return data<RetornoOrcamento>(
        resultado({ tipo: "erro", erro: await e.text() }),
        { status: e.status },
      );
    throw e;
  }
}


export default function Orcamento({ loaderData }: Route.ComponentProps) {
  return <EditorOrcamento key={loaderData.orcamento.id} carregados={loaderData} />;
}
