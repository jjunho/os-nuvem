import type { TradutorComunicador } from "./textos";
import { useState } from "react";
import type { GruposPainel, ReferenciaPainel } from "./use-painel";

type Referencia = ReferenciaPainel;
type Props = Pick<GruposPainel["compositor"], "estado" | "definirTexto" | "enviar" | "cancelarEdicao"> &
  Pick<GruposPainel["busca"], "referencias" | "selecionarReferencia"> &
  Pick<GruposPainel["conversas"], "pessoas" | "lista"> & {
    t: TradutorComunicador;
  };

export function Compositor({ estado, definirTexto, enviar, cancelarEdicao, referencias: buscarReferencias, selecionarReferencia, pessoas, lista, t }: Props) {
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const texto = estado.rascunho.texto;
  const citada = estado.rascunho.tipo === "citar" ? estado.rascunho.mensagemId : null;
  const edicao = estado.rascunho.tipo === "editar" ? estado.rascunho.mensagemId : null;
  const enviando = estado.fase === "enviando";
  const falha = estado.fase === "falhou" ? estado.erro : null;
  return (
    <form onSubmit={(evento) => { evento.preventDefault(); void enviar(); }}>
      {(citada || edicao) && (
        <button type="button" onClick={cancelarEdicao}>{t("Cancelar")} #{citada || edicao}</button>
      )}
      <label>
        {t("Mensagem")}
        <textarea
          aria-label={t("Mensagem")}
          disabled={enviando}
          value={texto}
          onChange={(evento) => {
            const valor = evento.target.value;
            definirTexto(valor);
            if (valor.includes("[[")) {
              const consulta = valor.slice(valor.lastIndexOf("[[") + 2);
              void buscarReferencias(consulta).then(setReferencias);
            } else setReferencias([]);
          }}
        />
      </label>
      {texto.includes("[[") && referencias.map((referencia) => (
        <button type="button" key={referencia.referencia} onClick={() => {
          definirTexto(selecionarReferencia(texto, referencia.referencia));
          setReferencias([]);
        }}>{referencia.titulo}</button>
      ))}
      {falha && <p role="alert">{falha}</p>}
      <button disabled={enviando}>{t("Enviar")}</button>
      <small>{t("Atalhos: @ pessoa · @todos · @aqui · # grupo · [[ referência · /tarefa · /urgente · /bug")}</small>
      {/@[^@]*$/.test(texto) && pessoas.filter((pessoa) => pessoa.nome.toLowerCase().startsWith(texto.slice(texto.lastIndexOf("@") + 1).toLowerCase())).map((pessoa) => (
        <button type="button" key={pessoa.id} onClick={() => definirTexto(texto.replace(/@[^@]*$/, "@" + pessoa.nome + " "))}>{pessoa.nome}</button>
      ))}
      {/#.*$/.test(texto) && lista.filter((conversa) => conversa.tipo === "grupo").map((conversa) => (
        <button type="button" key={conversa.id} onClick={() => definirTexto(texto.replace(/#.*$/, "#" + conversa.nome + " "))}>{conversa.nome}</button>
      ))}
    </form>
  );
}
