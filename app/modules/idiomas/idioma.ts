import { useRouteLoaderData } from "react-router";
import {
  traduzirMensagem,
  traduzir,
  type ChaveTraducao,
  type IdiomaInterface,
} from "./catalogo";

export type DadosDeIdioma = { idioma: IdiomaInterface };

export function useIdioma() {
  const dados = useRouteLoaderData<DadosDeIdioma>("root");
  const idioma = dados?.idioma ?? "pt";
  return {
    idioma,
    mensagem: (texto: string) => traduzirMensagem(idioma, texto),
    t: (chave: ChaveTraducao) => traduzir(idioma, chave),
  };
}
