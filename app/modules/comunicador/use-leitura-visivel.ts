import { useEffect } from "react";
import type { Mensagem } from "./tipos";

export function useLeituraVisivel(args: {
  ativo: boolean;
  conversaId: number | null;
  mensagens: Mensagem[];
  carga: "vazia" | "carregando" | "pronta" | "falhou";
  raiz: { current: HTMLElement | null };
  aoLer: (conversaId: number, mensagemId: number) => void;
}): void {
  useEffect(() => {
    const { conversaId } = args;
    const raiz = args.raiz.current;
    if (!args.ativo || !conversaId || conversaId < 1 || args.carga !== "pronta" || !raiz) return;
    let maiorLida = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const visiveis = new Set<number>();
    const confirmar = () => {
      if (document.visibilityState !== "visible") return;
      const ultimo = Math.max(0, ...visiveis);
      if (ultimo <= maiorLida) return;
      maiorLida = ultimo;
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => args.aoLer(conversaId, ultimo), 100);
    };
    const observer = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        const id = Number((entrada.target as HTMLElement).dataset.mensagemId);
        if (entrada.isIntersecting) visiveis.add(id);
        else visiveis.delete(id);
      }
      confirmar();
    }, { root: raiz, threshold: 0.1 });
    raiz.querySelectorAll("[data-mensagem-id]").forEach((elemento) => observer.observe(elemento));
    document.addEventListener("visibilitychange", confirmar);
    return () => {
      observer.disconnect();
      if (timer !== undefined) clearTimeout(timer);
      document.removeEventListener("visibilitychange", confirmar);
    };
  }, [args.ativo, args.conversaId, args.mensagens, args.carga, args.raiz, args.aoLer]);
}
