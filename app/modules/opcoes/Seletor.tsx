import { useId, useState, useEffect } from "react";
import { useIdioma } from "~/modules/idiomas/idioma";
import type { Opcao, ContextoOpcoes } from "./contexto";
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
  onEditar?: () => void;
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
  const [texto, setTexto] = useState(
    opcoes.find((o) => o.valor === valorInicial)?.nome ?? valorInicial,
  );
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [valor, setValor] = useState(valorInicial);
  const nomeInicial =
    opcoes.find((o) => o.valor === valorInicial)?.nome ?? valorInicial;
  useEffect(() => {
    setTexto(nomeInicial);
    setValor(valorInicial);
  }, [valorInicial, nomeInicial]);
  const [aberto, setAberto] = useState(false);
  const [indice, setIndice] = useState(-1);
  const filtradas = opcoes
    .filter((o) => !filtro || filtro(o, contexto))
    .filter((o) =>
      o.nome.toLocaleLowerCase().includes(texto.toLocaleLowerCase()),
    );
  const escolher = (opcao?: Opcao) => {
    const escolhido = opcao ?? { nome: texto.trim(), valor: texto.trim() };
    if (multiplo)
      setSelecionadas((atuais) =>
        [...new Set([...atuais, escolhido.valor])].filter(Boolean),
      );
    setTexto(multiplo ? "" : escolhido.nome);
    setValor(multiplo ? "" : escolhido.valor);
    setAberto(false);
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
          aberto && indice >= 0 ? `${id}-${indice}` : undefined
        }
        value={texto}
        autoComplete="off"
        onFocus={() => setAberto(true)}
        onBlur={() => setAberto(false)}
        onChange={(e) => {
          onEditar?.();
          setTexto(e.target.value);
          setValor(e.target.value.trim());
          setIndice(-1);
          setAberto(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setAberto(false);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setAberto(true);
            setIndice(Math.min(indice + 1, filtradas.length));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndice(Math.max(indice - 1, 0));
          }
          if (e.key === "Enter" && aberto) {
            e.preventDefault();
            escolher(filtradas[indice]);
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
            onClick={() =>
              setSelecionadas((atuais) => atuais.filter((x) => x !== v))
            }
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
