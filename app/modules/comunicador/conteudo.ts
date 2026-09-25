import type { Mensagem } from "./tipos";
import type { Cartao } from "./cartao";
import type { Pagina } from "./estado-painel";

export type Conteudo = {
  mensagens: Mensagem[];
  cartoes: Cartao[];
  leitores: { nome: string; lida_ate: number }[];
};

export function mesclarPagina(atual: Conteudo, pagina: Pagina, substituir = false): Conteudo {
  const mensagens = new Map<number, Mensagem>();
  if (!substituir) for (const mensagem of atual.mensagens) mensagens.set(mensagem.id, mensagem);
  for (const mensagem of pagina.mensagens) mensagens.set(mensagem.id, mensagem);
  const cartoes = new Map<string, Cartao>();
  if (!substituir) for (const cartao of atual.cartoes) cartoes.set(cartao.referencia, cartao);
  for (const cartao of pagina.cartoes ?? []) cartoes.set(cartao.referencia, cartao);
  return {
    mensagens: [...mensagens.values()].sort((a, b) => a.id - b.id),
    cartoes: [...cartoes.values()],
    leitores: pagina.leitores ?? atual.leitores,
  };
}

export type EventoConteudo =
  | { tipo: "substituir"; pagina: Pagina }
  | { tipo: "mesclar"; pagina: Pagina }
  | { tipo: "leitores"; leitores: { nome: string; lida_ate: number }[] }
  | { tipo: "limpar" };

export function reduzirConteudo(atual: Conteudo, evento: EventoConteudo): Conteudo {
  if (evento.tipo === "limpar") return { mensagens: [], cartoes: [], leitores: [] };
  if (evento.tipo === "leitores") return { ...atual, leitores: evento.leitores };
  return mesclarPagina(atual, evento.pagina, evento.tipo === "substituir");
}