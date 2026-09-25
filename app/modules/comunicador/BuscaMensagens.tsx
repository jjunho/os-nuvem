import type { TradutorComunicador } from "./textos";
import type { GruposPainel } from "./use-painel";

export type ResultadoBusca = GruposPainel["busca"]["resultados"][number];
type Props = Pick<GruposPainel["conversas"], "lista" | "pessoas"> &
  Pick<GruposPainel["busca"], "resultados" | "buscar" | "abrirMensagem"> & {
    t: TradutorComunicador;
  };

export function BuscaMensagens({ lista, pessoas, resultados, buscar, abrirMensagem, t }: Props) {
  return (
    <details>
      <summary>{t("Buscar mensagens")}</summary>
      <form onSubmit={(evento) => {
        evento.preventDefault();
        const formulario = new FormData(evento.currentTarget);
        const parametros = new URLSearchParams();
        for (const [chave, valor] of formulario) parametros.set(chave, String(valor));
        void buscar(parametros);
      }}>
        <input name="busca" aria-label={t("Buscar mensagens")} required />
        <select name="autor" aria-label={t("Autor")}>
          <option value="">{t("Autor")}</option>
          {pessoas.map((pessoa) => <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>)}
        </select>
        <select name="filtroConversa" aria-label={t("Todas as conversas")}>
          <option value="">{t("Todas as conversas")}</option>
          {lista.map((conversa) => <option value={conversa.id} key={conversa.id}>{conversa.nome}</option>)}
        </select>
        <label>{t("Data")}<input type="date" name="data" /></label>
        <button>{t("Buscar mensagens")}</button>
      </form>
      {resultados.map((resultado) => (
        <button key={resultado.id} onClick={() => void abrirMensagem(resultado.id)}>
          {resultado.autor}: {resultado.texto}
        </button>
      ))}
    </details>
  );
}
