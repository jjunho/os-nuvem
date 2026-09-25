import { registro, identificador } from "./contratos";
import {
  gerirMidia,
  viajantesParaMidia,
  documentosViajante,
} from "./midia.server";
import {
  interna,
  tarefaDaMensagem,
  concluirCartao,
} from "./integracoes.server";
import {
  cartoesDasMensagens,
  buscarCartoes,
} from "./cartoes.server";
import { preferencias } from "./preferencias.server";
import { presenca } from "./presenca.server";
import { marcarLeitura, buscar } from "./leitura.server";
import { grupo, gerirGrupo, mudarMensagem } from "./gestao.server";
import { direta, enviar, ler, listar, localizarMensagem } from "./comunicador.server";
import { avisarPrazos } from "~/modules/tarefas/tarefas.server";
import { invalido } from "./acesso.server";
import type { Usuario } from "./tipos";

export async function consultarComunicador(
  u: Usuario,
  query: URLSearchParams,
  agora: Date,
  origem: string,
): Promise<Response> {
  await avisarPrazos(agora);
  if (query.has("viajantes"))
    return Response.json({
      resultados: await viajantesParaMidia(
        u,
        query.get("viajantes")!,
        Number(query.get("viagemId")) || undefined,
      ),
    });
  if (query.has("documentosViajante"))
    return Response.json({
      documentos: await documentosViajante(
        u,
        Number(query.get("documentosViajante")),
      ),
    });
  if (query.has("mensagem"))
    return Response.json(await localizarMensagem(u, Number(query.get("mensagem"))));
  if (query.has("referencias"))
    return Response.json({
      resultados: await buscarCartoes(query.get("referencias")!.slice(0, 100), u),
    });
  if (query.has("conversa")) {
    const dados = await ler(u, Number(query.get("conversa")), query);
    return Response.json(
      {
        ...dados,
        cartoes: await cartoesDasMensagens(dados.mensagens, u, origem),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  if (query.has("busca")) return Response.json(await buscar(u, query));
  return Response.json(await listar(u), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function executarComando(
  u: Usuario,
  dados: unknown,
  agora: Date,
  origem: string,
): Promise<Response> {
  if (!registro(dados) || typeof dados.acao !== "string") invalido();
  if (dados.acao === "enviar" || dados.acao === "interna") {
    if (
      !identificador(
        dados.acao === "enviar" ? dados.conversaId : dados.viagemId,
      ) ||
      typeof dados.texto !== "string" ||
      !dados.texto.trim() ||
      dados.texto.length > 20000 ||
      typeof dados.clientId !== "string" ||
      !/^[a-zA-Z0-9-]{16,80}$/.test(dados.clientId) ||
      (dados.citadaId != null && !identificador(dados.citadaId))
    )
      invalido();
  }
  if (["purgar", "mover"].includes(dados.acao))
    return Response.json(await gerirMidia(u, dados));
  if (dados.acao === "interna")
    return Response.json(
      await interna(
        u,
        Number(dados.viagemId),
        String(dados.texto),
        String(dados.clientId),
        agora,
        origem,
      ),
    );
  if (dados.acao === "tarefa")
    return Response.json(await tarefaDaMensagem(u, dados, agora, origem));
  if (dados.acao === "concluir-tarefa")
    return Response.json(
      await concluirCartao(
        u,
        Number(dados.tarefaId),
        Number(dados.conversaId),
        agora,
      ),
    );
  if (["preferencias", "modo", "aviso-visto"].includes(dados.acao))
    return Response.json(await preferencias(u, dados));
  if (dados.acao === "presenca")
    return Response.json(await presenca(u, dados));
  if (dados.acao === "ler" || dados.acao === "nao-lida")
    return Response.json(
      await marcarLeitura(
        u,
        Number(dados.conversaId),
        Number(dados.mensagemId),
        dados.acao === "nao-lida",
      ),
    );
  if (dados.acao === "grupo")
    return Response.json(await grupo(u, dados));
  if (
    ["entrar", "sair", "grupo-editar", "convidar", "remover"].includes(
      dados.acao,
    )
  )
    return Response.json(await gerirGrupo(u, dados));
  if (["editar", "apagar", "reagir"].includes(dados.acao))
    return Response.json(await mudarMensagem(u, dados, agora, origem));
  if (dados.acao === "direta")
    return Response.json(await direta(u, Number(dados.usuarioId)));
  if (dados.acao === "enviar")
    return Response.json(
      await enviar(
        u,
        {
          conversaId: Number(dados.conversaId),
          clientId: String(dados.clientId),
          texto: String(dados.texto),
          citadaId: dados.citadaId == null ? undefined : Number(dados.citadaId),
        },
        agora,
        origem,
      ),
    );
  invalido();
}
