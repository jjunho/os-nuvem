import { useEffect, useRef, useState } from "react";
import { useFetcher, useNavigate } from "react-router";
import { useIdioma } from "~/modules/idiomas/idioma";
import type { ResultadoBusca } from "~/modules/viagens/viagens.server";
import { rotuloEtapa } from "~/modules/viagens/rotulos";

type DadosBusca = { resultados: ResultadoBusca[] };

export function Busca({ aoFechar }: { aoFechar: () => void }) {
  const { t } = useIdioma();
  const fetcher = useFetcher<DadosBusca>();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [sel, setSel] = useState(0);
  const resultados =
    fetcher.state === "idle" ? (fetcher.data?.resultados ?? []) : [];
  const indice = Math.min(Math.max(0, sel), Math.max(0, resultados.length - 1));

  useEffect(() => input.current?.focus(), []);

  const abrir = (id: number) => {
    aoFechar();
    navigate(`/viagens/${id}`);
  };

  return (
    <div className="busca-fundo" onClick={aoFechar}>
      <div
        className="busca"
        role="dialog"
        aria-label={t("Buscar viagem")}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={input}
          placeholder={t("Código, contato, telefone, e-mail ou agência")}
          onChange={(e) => {
            setSel(0);
            fetcher.load(`/buscar?q=${encodeURIComponent(e.target.value)}`);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown")
              setSel((s) =>
                Math.max(0, Math.min(s + 1, resultados.length - 1)),
              );
            if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0));
            if (e.key === "Enter" && resultados[indice])
              abrir(resultados[indice].id);
          }}
        />
        <ul>
          {resultados.map((r, i) => (
            <li
              key={`${r.id}-${r.contato}`}
              className={i === indice ? "ativo" : ""}
              onMouseDown={() => abrir(r.id)}
            >
              <strong>{r.codigo}</strong> {r.contato}{" "}
              <span className="etapa">{t(rotuloEtapa[r.etapa])}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
