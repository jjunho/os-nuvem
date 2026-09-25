import { useCallback, useRef, useState } from "react";

function lerValor<S>(referencia: { current: { valor: S } | null }): S {
  const atual = referencia.current;
  if (atual === null) throw new Error("Máquina não inicializada");
  return atual.valor;
}

export function useMaquina<S, E>(
  transicao: (estado: S, evento: E) => S,
  inicial: S | (() => S),
): { estado: S; emitir(evento: E): S; atual(): S } {
  const referencia = useRef<{ valor: S } | null>(null);
  if (referencia.current === null) {
    referencia.current = {
      valor:
        typeof inicial === "function" ? (inicial as () => S)() : inicial,
    };
  }
  const [estado, setEstado] = useState<S>(() => lerValor(referencia));

  const emitir = useCallback(
    (evento: E) => {
      const proximo = transicao(lerValor(referencia), evento);
      referencia.current = { valor: proximo };
      setEstado(() => proximo);
      return proximo;
    },
    [transicao],
  );
  const atual = useCallback(() => lerValor(referencia), []);

  return { estado, emitir, atual };
}
