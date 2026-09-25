import type { TradutorComunicador } from "./textos";
import { useState } from "react";
import type { GruposPainel } from "./use-painel";

type Props = Pick<
  GruposPainel["conversas"],
  "lista" | "grupos" | "pessoas" | "arquivadas" | "mostrarArquivadas" | "abrirDireta" | "criarGrupo" | "entrar"
> & Pick<GruposPainel["compositor"], "abrir"> & {
  selecionada: number | null;
  papel: string;
  t: TradutorComunicador;
};

export function ListaConversas({
  lista,
  grupos,
  pessoas,
  arquivadas,
  mostrarArquivadas,
  abrirDireta,
  criarGrupo,
  entrar,
  abrir,
  selecionada,
  papel,
  t,
}: Props) {
  const [outro, setOutro] = useState("");
  return (
    <>
      <label>
        {t("Conversa direta")}
        <select value={outro} onChange={(evento) => setOutro(evento.target.value)}>
          <option value="">{t("Escolher usuário")}</option>
          {pessoas.map((pessoa) => <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>)}
        </select>
      </label>
      <button disabled={!outro} onClick={() => void abrirDireta(Number(outro))}>{t("Iniciar conversa")}</button>
      {papel !== "guiamento" && (
        <details>
          <summary>{t("Novo grupo")}</summary>
          <form onSubmit={(evento) => {
            evento.preventDefault();
            const dados = new FormData(evento.currentTarget);
            const nome = dados.get("nome");
            const descricao = dados.get("descricao");
            if (typeof nome === "string" && typeof descricao === "string")
              void criarGrupo(nome, descricao, dados.has("privada"));
          }}>
            <label>{t("Nome")}<input name="nome" required /></label>
            <label>{t("Descrição")}<input name="descricao" /></label>
            <label><input type="checkbox" name="privada" defaultChecked />{t("Privado")}</label>
            <button>{t("Criar grupo")}</button>
          </form>
          <h3>{t("Grupos públicos")}</h3>
          {grupos.map((grupo) => (
            <button key={grupo.id} onClick={() => void entrar(grupo.id)}>
              {t("Entrar no grupo")} · {grupo.nome}
            </button>
          ))}
        </details>
      )}
      <label>
        <input type="checkbox" checked={arquivadas} onChange={(evento) => mostrarArquivadas(evento.target.checked)} />
        {t("Mostrar arquivadas")}
      </label>
      <nav>
        {lista.filter((conversa) => arquivadas || !conversa.arquivada).map((conversa) => (
          <button key={conversa.id} onClick={() => void abrir(conversa.id, { inicial: true })} aria-pressed={selecionada === conversa.id}>
            {conversa.nome} {conversa.nao_lidas > 0 && <b aria-label={t("Não lidas")}>{conversa.nao_lidas}</b>}
          </button>
        ))}
      </nav>
    </>
  );
}
