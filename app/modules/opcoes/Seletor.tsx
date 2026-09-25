import { useId, useReducer } from "react";
import { useIdioma } from "~/modules/idiomas/idioma";
import type { Opcao, ContextoOpcoes } from "./contexto";
import {
  iniciarSeletor,
  reduzirSeletor,
  escolhaAoConfirmar,
  valorSeletor,
} from "./seletor-modelo";
export function Seletor({
  nome,
  rotulo,
  opcoes,
  valorInicial = "",
  onChange,
  contexto = {},
  filtro,
  multiplo = false,
  onEditar,
  outroLabel,
}: {
  outroLabel?: string;
  onEditar?: (texto: string) => void;
  multiplo?: boolean;
  nome: string;
  rotulo: string;
  opcoes: Opcao[];
  contexto?: ContextoOpcoes;
  filtro?: (opcao: Opcao, contexto: ContextoOpcoes) => boolean;
  valorInicial?: string;
  onChange?: (valor: string) => void;
}) {
  const { t } = useIdioma();
  const id = useId();
  const nomeInicial =
    opcoes.find((o) => o.valor === valorInicial)?.nome ?? valorInicial;
  const [estado, dispatch] = useReducer(reduzirSeletor, undefined, () =>
    iniciarSeletor(valorInicial, nomeInicial, multiplo),
  );
  if (estado.base.valor !== valorInicial || estado.base.nome !== nomeInicial)
    dispatch({ tipo: "sincronizou", valor: valorInicial, nome: nomeInicial });
  const texto = estado.escolha.texto;
  const valor = valorSeletor(estado);
  const selecionadas = estado.selecionadas;
  const aberto = estado.menu.fase === "aberto";
  const indice = estado.menu.fase === "aberto" ? estado.menu.indice : -1;
  const filtradas = opcoes
    .filter((o) => !filtro || filtro(o, contexto))
    .filter((o) =>
      o.nome.toLocaleLowerCase().includes(texto.toLocaleLowerCase()),
    );
  const escolher = (opcao?: Opcao) => {
    const escolhido = opcao ?? { nome: texto.trim(), valor: texto.trim() };
    dispatch({ tipo: "escolheu", opcao: escolhido });
    onChange?.(escolhido.valor);
  };
  return (
    <div className="seletor">
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={aberto}
        aria-controls={`${id}-lista`}
        aria-activedescendant={
          aberto && indice >= 0 && indice <= filtradas.length
            ? `${id}-${indice}`
            : undefined
        }
        value={texto}
        autoComplete="off"
        onFocus={() => dispatch({ tipo: "abriu" })}
        onBlur={() => dispatch({ tipo: "fechou" })}
        onChange={(e) => {
          onEditar?.(e.target.value);
          dispatch({ tipo: "editou", texto: e.target.value });
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") dispatch({ tipo: "fechou" });
          if (e.key === "ArrowDown") {
            e.preventDefault();
            dispatch({ tipo: "moveu", direcao: 1, total: filtradas.length });
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            dispatch({ tipo: "moveu", direcao: -1, total: filtradas.length });
          }
          if (e.key === "Enter" && aberto) {
            e.preventDefault();
            escolher(escolhaAoConfirmar(estado, filtradas));
          }
        }}
      />
      <input type="hidden" name={nome} value={valor} />
      {selecionadas.map((v) => (
        <span key={v}>
          <input type="hidden" name={nome} value={v} />
          {opcoes.find((o) => o.valor === v)?.nome ?? v}
          <button
            type="button"
            aria-label={`${t("Remover")} ${v}`}
            onClick={() => dispatch({ tipo: "removeu", valor: v })}
          >
            ×
          </button>
        </span>
      ))}
      {aberto && (
        <ul id={`${id}-lista`} role="listbox" aria-label={rotulo}>
          {filtradas.map((o, i) => (
            <li
              role="option"
              aria-selected={i === indice}
              id={`${id}-${i}`}
              key={o.valor}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => escolher(o)}
            >
              {o.nome}
            </li>
          ))}
          <li
            role="option"
            aria-selected={indice === filtradas.length}
            id={`${id}-${filtradas.length}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => escolher()}
          >
            {outroLabel ?? t("Outro…")}
          </li>
        </ul>
      )}
    </div>
  );
}
