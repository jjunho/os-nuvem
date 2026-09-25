import { useEffect, useReducer, useRef } from "react";
import { useIdioma } from "~/modules/idiomas/idioma";
import {
  lerDocumentosResposta,
  type DocumentoViajante,
} from "./documentos-resposta";
import { reduzirOperacao } from "./operacao-remota";

export function DocumentosViajante({ id }: { id: number }) {
  return <ListaDocumentos key={id} id={id} />;
}
function ListaDocumentos({ id }: { id: number }) {
  const { t } = useIdioma();
  const [estado, dispatch] = useReducer(reduzirOperacao<DocumentoViajante[]>, {
    fase: "inicial",
  });
  const sequencia = useRef(0);
  const requisicao = useRef<AbortController | null>(null);
  useEffect(() => () => requisicao.current?.abort(), []);
  async function carregar() {
    if (requisicao.current && !requisicao.current.signal.aborted) return;
    const controller = new AbortController();
    requisicao.current = controller;
    const tentativa = ++sequencia.current;
    dispatch({ tipo: "iniciou", tentativa, chave: String(id) });
    try {
      const resposta = await fetch(
        `/comunicador/api?documentosViajante=${id}`,
        { signal: controller.signal },
      );
      if (!resposta.ok) throw new Error("documentos");
      const dados = lerDocumentosResposta(await resposta.json());
      if (!controller.signal.aborted)
        dispatch({ tipo: "concluiu", tentativa, dados });
    } catch (erro) {
      if (!controller.signal.aborted)
        dispatch({
          tipo: "falhou",
          tentativa,
          erro: erro instanceof Error ? erro.message : String(erro),
        });
    } finally {
      if (requisicao.current === controller) requisicao.current = null;
    }
  }
  return (
    <details
      onToggle={(e) => {
        if (e.currentTarget.open) void carregar();
        else {
          requisicao.current?.abort();
          requisicao.current = null;
          dispatch({ tipo: "cancelou", tentativa: sequencia.current });
        }
      }}
    >
      <summary>{t("Documentos do Viajante")}</summary>
      {estado.fase === "carregando" && (
        <p role="status">{t("Carregando documentos…")}</p>
      )}
      {estado.fase === "erro" && (
        <div>
          <p role="alert">{t("Não foi possível carregar os documentos")}</p>
          <button type="button" onClick={() => void carregar()}>
            {t("Tentar novamente")}
          </button>
        </div>
      )}
      {estado.fase === "pronto" &&
        (estado.dados.length ? (
          estado.dados.map((d) => (
            <a
              key={d.id}
              href={`/comunicador/midia/${d.id}`}
              target="_blank"
              rel="noreferrer"
            >
              {t("Abrir documento")}
            </a>
          ))
        ) : (
          <p>{t("Nenhum documento")}</p>
        ))}
    </details>
  );
}
