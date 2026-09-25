import type { TradutorComunicador } from "./textos";
import type { RefObject } from "react";
import { rotuloEtapa } from "~/modules/viagens/rotulos";
import { atividadeTarefa } from "./textos";
import type { GruposPainel } from "./use-painel";

type Props =
  Pick<GruposPainel["conteudo"], "mensagens" | "cartoes" | "leitores" | "carregarPagina"> &
  Pick<GruposPainel["midia"], "fila" | "reenviar" | "ampliarFoto" | "purgarMidia" | "prepararMovimento"> &
  Pick<GruposPainel["compositor"], "marcarNaoLida" | "abrir" | "citar" | "editar" | "apagarMensagem" | "reagir"> &
  Pick<GruposPainel["tarefa"], "concluir"> & {
  conversa: Pick<GruposPainel["conversas"]["lista"][number], "id" | "arquivada"> | null;
  usuarioId: number;
  papel: string;
  idioma: "pt" | "ko";
  origem: string;
  raiz: RefObject<HTMLDivElement | null>;
  traduzirStatus: (texto: string) => string;
  t: TradutorComunicador;
  aoCriarTarefa: (mensagemId: number, titulo: string) => void;
};

export function ListaMensagens({
  mensagens,
  cartoes,
  leitores,
  fila,
  conversa,
  usuarioId,
  papel,
  idioma,
  origem,
  raiz,
  traduzirStatus,
  t,
  carregarPagina,
  marcarNaoLida,
  abrir,
  citar,
  editar,
  apagarMensagem,
  reagir,
  aoCriarTarefa,
  concluir,
  reenviar,
  ampliarFoto,
  purgarMidia,
  prepararMovimento,
}: Props) {
  const conversaId = conversa?.id;
  return (
    <>
      {conversaId !== undefined && (
        <>
          <button
            onClick={() => {
              if (mensagens[0]) void carregarPagina("antes", mensagens[0].id);
            }}
          >{t("Mensagens anteriores")}</button>
          <button
            onClick={() => {
              const ultima = mensagens.at(-1);
              if (ultima) void carregarPagina("depois", ultima.id);
            }}
          >{t("Mensagens seguintes")}</button>
          <button
            onClick={() => {
              const ultima = mensagens.at(-1);
              if (ultima) void marcarNaoLida(ultima.id);
            }}
          >{t("Marcar como não lida")}</button>
          <div
            ref={raiz}
            className="mensagens"
            aria-live="polite"
            onScroll={async (evento) => {
              const elemento = evento.currentTarget;
              const primeira = mensagens[0];
              if (elemento.scrollTop !== 0 || !primeira || conversaId === undefined) return;
              const altura = elemento.scrollHeight;
              if (await carregarPagina("antes", primeira.id)) {
                requestAnimationFrame(() => {
                  elemento.scrollTop += elemento.scrollHeight - altura;
                });
              }
            }}
          >
            {mensagens.map((mensagem) => {
              const citadaId = mensagem.citada_id;
              const midia = mensagem.midia;
              return (
              <article
                data-mensagem-id={mensagem.id}
                id={`mensagem-${mensagem.id}`}
                key={mensagem.id}
              >
                {mensagem.sistema && <small>{t("Atividade da tarefa")}</small>}
                <strong>{mensagem.autor} {!mensagem.ativo && t("Inativo")}</strong>
                {citadaId && (
                  <a
                    href={`#mensagem-${citadaId}`}
                    onClick={() => {
                      if (!mensagens.some((item) => item.id === citadaId)) {
                        void carregarPagina("antes", citadaId + 1, citadaId);
                      }
                    }}
                  >
                    {t("Citar")} #{citadaId} · {mensagens.find((item) => item.id === citadaId)?.texto}
                  </a>
                )}
                {mensagem.apagada && <em>{t("Apagada")}</em>}
                <p>
                  {mensagem.sistema && <>{atividadeTarefa(idioma, mensagem.atividade_tipo)}{mensagem.atividade_motivo ? ` · ${mensagem.atividade_motivo}` : ""}</>}
                  {mensagem.segmentos.map((segmento, indice) => {
                    const segmentoId = segmento.id;
                    if (segmento.tipo === "usuario" || segmento.tipo === "todos" || segmento.tipo === "aqui") {
                      return (
                        <mark key={indice}>
                          {segmento.texto}
                          {segmento.tipo === "usuario" && segmentoId === usuarioId
                            ? idioma === "ko" ? " (나)" : " (você)"
                            : ""}
                        </mark>
                      );
                    }
                    if (segmento.tipo === "grupo") {
                      return typeof segmentoId === "number"
                        ? <button key={indice} onClick={() => void abrir(segmentoId)}>{segmento.texto}</button>
                        : <span key={indice}>{segmento.texto}</span>;
                    }
                    if (segmento.tipo === "link") {
                      return <a key={indice} href={segmento.texto} target="_blank" rel="noreferrer">{segmento.texto}</a>;
                    }
                    return <span key={indice}>{segmento.texto}</span>;
                  })}
                </p>
                {mensagem.urgente && <strong>{t("Urgente")}</strong>}
                {cartoes
                  .filter((cartao) => mensagem.texto.includes(cartao.referencia) || mensagem.texto.includes(origem + cartao.referencia))
                  .map((cartao) => {
                    const tarefaId = cartao.tarefaId;
                    return (
                      <div className="cartao" key={cartao.referencia}>
                        {cartao.url ? <a href={cartao.url}>{cartao.titulo}</a> : t("Acesso restrito")} {" "}
                        {cartao.estado && traduzirStatus(({ ...rotuloEtapa, aberta: "Aberta" } as Record<string, string>)[cartao.estado] ?? cartao.estado)} {" "}
                        {cartao.responsavel} {cartao.prazo} {" "}
                        {cartao.preco !== undefined && `USD ${(cartao.preco / 100).toFixed(2)}`}
                        {typeof tarefaId === "number" && cartao.manual && cartao.estado === "aberta" && conversaId !== undefined && (
                          <button onClick={() => void concluir(tarefaId)}>{t("Concluir")}</button>
                        )}
                      </div>
                    );
                  })}
                {midia && (midia.removida ? (
                  <em>{t("Arquivo removido")}</em>
                ) : midia.movida ? (
                  <em>{t("Movido para o Viajante")}</em>
                ) : (
                  <div>
                    {midia.mime.startsWith("image/") ? (
                      <button onClick={() => ampliarFoto(`/comunicador/midia/${midia.id}`)}>
                        <img alt={t("Foto")} loading="lazy" src={`/comunicador/midia/${midia.id}`} style={{ maxWidth: "100%", maxHeight: 240 }} />
                      </button>
                    ) : (
                      <audio controls preload="metadata" src={`/comunicador/midia/${midia.id}`} />
                    )}
                    <p>{mensagem.transcricao}</p>
                    {papel === "admin" && <button onClick={() => void purgarMidia(midia.id)}>{t("Remover arquivo definitivamente")}</button>}
                    {papel !== "guiamento" && midia.mime.startsWith("image/") && (
                      <button onClick={() => void prepararMovimento(midia.id)}>{t("Mover para o Viajante")}</button>
                    )}
                  </div>
                ))}
                {mensagem.versoes.length > 0 && (
                  <details>
                    <summary>{t("Editada")} · {t("Histórico")}</summary>
                    {mensagem.versoes.map((versao, indice) => <p key={indice}>{versao.texto} <time>{versao.em}</time></p>)}
                  </details>
                )}
                {mensagem.reacoes?.map((reacao, indice) => <small key={indice}>{reacao.emoji} {reacao.nome} </small>)}
                {!mensagem.sistema && !mensagem.apagada && !conversa?.arquivada && (
                  <div>
                    <button onClick={() => aoCriarTarefa(mensagem.id, mensagem.texto)}>{t("Transformar em Tarefa")}</button>
                    <button onClick={() => citar(mensagem.id)}>{t("Citar")}</button>
                    <button aria-label={t("Reagir")} onClick={() => void reagir(mensagem.id, "👍")}>👍</button>
                    {mensagem.autor_id === usuarioId && <button onClick={() => editar(mensagem.id, mensagem.texto)}>{t("Editar")}</button>}
                    {(mensagem.autor_id === usuarioId || papel === "admin") && <button onClick={() => void apagarMensagem(mensagem.id)}>{t("Apagar")}</button>}
                  </div>
                )}
              </article>
              );
            })}
            {fila
              .filter((item) => item.conversaId === conversaId && !mensagens.some((mensagem) => mensagem.client_id === item.clientId))
              .map((item) => (
                <article key={item.clientId}>
                  <p>{item.texto}</p>
                  {item.falhou ? <button onClick={() => void reenviar(item)}>{t("Falhou. Tentar novamente")}</button> : <small>{t("Pendente")}</small>}
                </article>
              ))}
          </div>
          <small>{t("Visto por")}: {" "}{leitores.filter((leitor) => leitor.lida_ate >= (mensagens.at(-1)?.id ?? Infinity)).map((leitor) => leitor.nome).join(", ")}</small>
        </>
      )}
    </>
  );
}
