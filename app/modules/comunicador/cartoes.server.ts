import { segmentar } from "./leitura";
import {
  cartaoViagem,
  buscarCartoesViagem,
} from "~/modules/viagens/cartoes.server";
import {
  cartaoTarefa,
  buscarCartoesTarefa,
} from "~/modules/tarefas/cartoes.server";
import type { Usuario, Mensagem } from "./tipos";
import type { Cartao } from "./cartao";
export async function cartoesDasMensagens(
  ms: Mensagem[],
  u: Usuario,
  origem: string,
) {
  const refs = [
    ...new Set(
      ms.flatMap((m) =>
        segmentar(m.texto, { usuarios: [], grupos: [], origem })
          .filter((s) => s.tipo === "codigo" || s.tipo === "app")
          .map((s) => (s.tipo === "app" ? new URL(s.texto).pathname : s.texto)),
      ),
    ),
  ];
  return Promise.all(
    refs.map(async (ref): Promise<Cartao> => {
      if (/^(V\d{2}-|\/viagens\/\d+$)/.test(ref)) return cartaoViagem(ref, u);
      if (/^(TAR-|\/tarefas\/\d+$)/.test(ref)) return cartaoTarefa(ref, u);
      return { referencia: ref, titulo: "Acesso restrito" };
    }),
  );
}
export async function buscarCartoes(q: string, u: Usuario) {
  return [
    ...(await buscarCartoesViagem(q, u)),
    ...(await buscarCartoesTarefa(q, u)),
  ];
}
