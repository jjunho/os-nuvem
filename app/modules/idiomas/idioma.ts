import { useRouteLoaderData } from "react-router";
import type { loader } from "~/root";
import { traduzirMensagem, traduzir, type ChaveTraducao } from "./catalogo";

export function useIdioma() {
  const dados = useRouteLoaderData<typeof loader>("root");
  const idioma = dados?.idioma ?? "pt";
  return {
    idioma,
    mensagem: (texto: string) => traduzirMensagem(idioma, texto),
    t: (chave: ChaveTraducao) => traduzir(idioma, chave),
  };
}
