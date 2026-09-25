import { useState } from "react";
import { useLocation } from "react-router";

/** Values being edited before “Filter” are a draft of this history entry.
 * Navigation discards that draft; the URL remains the authority for applied filters.
 */
export function useFiltrosURL(valores: Record<string, string | undefined>) {
  const location = useLocation();
  const origem = `${location.key}:${location.search}`;
  const [rascunho, setRascunho] = useState({ origem, valores });
  if (rascunho.origem !== origem) setRascunho({ origem, valores });
  const atuais = rascunho.origem === origem ? rascunho.valores : valores;
  function alterar(nome: string, valor: string | undefined) {
    setRascunho({ origem, valores: { ...atuais, [nome]: valor } });
  }
  return { valores: atuais, alterar };
}
