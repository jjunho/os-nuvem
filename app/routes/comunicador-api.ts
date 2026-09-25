import { registro, identificador } from "~/modules/comunicador/contratos";
import { avisarPrazos } from "~/modules/tarefas/tarefas.server";
import {
  gerirMidia,
  viajantesParaMidia,
  documentosViajante,
} from "~/modules/comunicador/midia.server";
import {
  interna,
  tarefaDaMensagem,
  concluirCartao,
} from "~/modules/comunicador/integracoes.server";
import {
  cartoesDasMensagens,
  buscarCartoes,
} from "~/modules/comunicador/cartoes.server";
import {
  preferencias,
  presenca,
} from "~/modules/comunicador/notificacoes.server";
import { marcarLeitura, buscar } from "~/modules/comunicador/leitura.server";
import {
  grupo,
  gerirGrupo,
  mudarMensagem,
} from "~/modules/comunicador/gestao.server";
import { exigirUsuario } from "~/session.server";
import { now } from "~/clock.server";
import {
  direta,
  enviar,
  ler,
  listar,
  invalido,
  localizarMensagem,
} from "~/modules/comunicador/comunicador.server";
export async function loader({ request }: { request: Request }) {
  const u = await exigirUsuario(request),
    q = new URL(request.url).searchParams;
  await avisarPrazos(now(request));
  if (q.has("viajantes"))
    return Response.json({
      resultados: await viajantesParaMidia(
        u,
        q.get("viajantes")!,
        Number(q.get("viagemId")) || undefined,
      ),
    });
  if (q.has("documentosViajante"))
    return Response.json({
      documentos: await documentosViajante(
        u,
        Number(q.get("documentosViajante")),
      ),
    });
  if (q.has("mensagem"))
    return Response.json(await localizarMensagem(u, Number(q.get("mensagem"))));
  if (q.has("referencias"))
    return Response.json({
      resultados: await buscarCartoes(q.get("referencias")!.slice(0, 100), u),
    });
  if (q.has("conversa")) {
    const d = await ler(u, Number(q.get("conversa")), q);
    return Response.json(
      {
        ...d,
        cartoes: await cartoesDasMensagens(
          d.mensagens,
          u,
          new URL(request.url).origin,
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  if (q.has("busca")) return Response.json(await buscar(u, q));
  return Response.json(
    q.has("conversa")
      ? await ler(u, Number(q.get("conversa")), q)
      : await listar(u),
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function action({ request }: { request: Request }) {
  const u = await exigirUsuario(request),
    d: unknown = await request.json().catch(() => invalido());
  if (!registro(d) || typeof d.acao !== "string") invalido();
  if (d.acao === "enviar" || d.acao === "interna") {
    if (
      !identificador(d.acao === "enviar" ? d.conversaId : d.viagemId) ||
      typeof d.texto !== "string" ||
      !d.texto.trim() ||
      d.texto.length > 20000 ||
      typeof d.clientId !== "string" ||
      !/^[a-zA-Z0-9-]{16,80}$/.test(d.clientId) ||
      (d.citadaId != null && !identificador(d.citadaId))
    )
      invalido();
  }
  if (["purgar", "mover"].includes(d.acao))
    return Response.json(await gerirMidia(u, d));
  if (d.acao === "interna")
    return Response.json(
      await interna(
        u,
        Number(d.viagemId),
        String(d.texto),
        String(d.clientId),
        now(request),
        new URL(request.url).origin,
      ),
    );
  if (d.acao === "tarefa")
    return Response.json(
      await tarefaDaMensagem(u, d, now(request), new URL(request.url).origin),
    );
  if (d.acao === "concluir-tarefa")
    return Response.json(
      await concluirCartao(
        u,
        Number(d.tarefaId),
        Number(d.conversaId),
        now(request),
      ),
    );
  if (["preferencias", "modo", "aviso-visto"].includes(d.acao))
    return Response.json(await preferencias(u, d));
  if (d.acao === "presenca") return Response.json(await presenca(u, d));
  if (d.acao === "ler" || d.acao === "nao-lida")
    return Response.json(
      await marcarLeitura(
        u,
        Number(d.conversaId),
        Number(d.mensagemId),
        d.acao === "nao-lida",
      ),
    );
  if (d.acao === "grupo") return Response.json(await grupo(u, d));
  if (
    ["entrar", "sair", "grupo-editar", "convidar", "remover"].includes(d.acao)
  )
    return Response.json(await gerirGrupo(u, d));
  if (["editar", "apagar", "reagir"].includes(d.acao))
    return Response.json(
      await mudarMensagem(u, d, now(request), new URL(request.url).origin),
    );
  if (d.acao === "direta")
    return Response.json(await direta(u, Number(d.usuarioId)));
  if (d.acao === "enviar")
    return Response.json(
      await enviar(
        u,
        {
          conversaId: Number(d.conversaId),
          clientId: String(d.clientId),
          texto: String(d.texto),
          citadaId: d.citadaId == null ? undefined : Number(d.citadaId),
        },
        now(request),
        new URL(request.url).origin,
      ),
    );
  invalido();
}
