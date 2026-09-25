import { comando } from "./api.client";

export type Presenca = {
  iniciar(args: { conversaId: number | null; aberta: boolean }): () => void;
};

export function criarPresenca(): Presenca {
  let aba: string | null = null;
  return {
    iniciar(args) {
      const id = (aba ??= crypto.randomUUID());
      const atualizar = () => {
        void comando({
          acao: "presenca",
          conversaId: args.conversaId && args.conversaId > 0 ? args.conversaId : 0,
          aba: id,
          lendo: args.aberta && document.visibilityState === "visible",
        }).catch(() => {});
      };
      atualizar();
      const timer = setInterval(atualizar, 10000);
      document.addEventListener("visibilitychange", atualizar);
      return () => {
        clearInterval(timer);
        document.removeEventListener("visibilitychange", atualizar);
        void comando({ acao: "presenca", conversaId: 0, aba: id, lendo: false }).catch(() => {});
      };
    },
  };
}
