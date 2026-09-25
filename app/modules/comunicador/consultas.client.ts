import { leituraOffline } from "./offline.client";
import { RespostaHttp, lerApi } from "./api.client";
import type { Selecao } from "./estado-ui";
import type { Pagina } from "./estado-painel";
import type { Conversa, Pessoa } from "./tipos";
import type { PreferenciaComunicador } from "./preferencias.server";

export type ResultadoLista = {
  conversas: Conversa[];
  grupos: Conversa[];
  usuarios: Pessoa[];
  usuario: number;
  papel: string;
  preferencia: PreferenciaComunicador;
};
export type ResultadoBusca = {
  id: number;
  conversa_id: number;
  texto: string;
  autor: string;
};
export type ResultadoReferencia = {
  referencia: string;
  titulo: string;
  viagemId?: number;
};
export type ResultadoViajante = {
  id: number;
  nome: string | null;
  codigo: string;
};
export type RespostaReferencias = { resultados: ResultadoReferencia[] };
export type RespostaViajantes = { resultados: ResultadoViajante[] };
export type Consultas = {
  abrir(escopo: Selecao, id: number, opcoes?: { inicial?: boolean; antes?: number }): Promise<boolean>;
  pagina(escopo: Selecao, id: number, direcao: "antes" | "depois", cursor: number): Promise<boolean>;
  sincronizar(escopo: Selecao, id: number): Promise<void>;
  localizar(mensagemId: number): Promise<{ conversaId: number } | null>;
  listar(): Promise<ResultadoLista | null>;
  buscar(url: string): Promise<{ resultados: ResultadoBusca[] } | null>;
  referencias(url: string): Promise<RespostaReferencias | null>;
  viajantes(url: string): Promise<RespostaViajantes | null>;
  cancelar(somenteLocais?: boolean): void;
  cancelarChave(chave: string): void;
};
export function criarConsultas(deps: {
  usuarioId: number;
  vigente(escopo: Selecao): boolean;
  montado(): boolean;
  primeiroId(): number | null;
  aoPagina(escopo: Selecao, pagina: Pagina, substituir: boolean): void;
  aoFalhar(texto: string, escopo: Selecao | null): void;
  aoPerderAcesso(escopo: Selecao): void;
}) {
  const controllers = new Map<string, { controller: AbortController; local: boolean }>();
  const versoes = new Map<string, number>();
  const locks = new Set<string>();
  const abrindo = new Map<string, number>();
  const syncPendente = new Map<string, boolean>();
  const chave = (escopo: Selecao) => `${escopo.conversaId}:${escopo.geracao}`;
  // A regra de vigência (Padrão 6) tem um único dono: quem cria as consultas.
  const vigente = deps.vigente;
  function abortarChave(key: string) {
    controllers.get(key)?.controller.abort();
    controllers.delete(key);
  }
  function cancelarChave(key: string) {
    versoes.set(key, (versoes.get(key) ?? 0) + 1);
    abortarChave(key);
  }
  function cancelar(somenteLocais = false) {
    for (const [key, item] of controllers) {
      if (somenteLocais && !item.local) continue;
      versoes.set(key, (versoes.get(key) ?? 0) + 1);
      item.controller.abort();
      controllers.delete(key);
    }
  }
  async function requisitar<T>(url: string, key: string, local: boolean, offline = false): Promise<T> {
    abortarChave(key);
    const controller = new AbortController();
    controllers.set(key, { controller, local });
    try {
      return offline
        ? await leituraOffline(deps.usuarioId, url, controller.signal) as T
        : await lerApi<T>(url, controller.signal);
    } finally {
      if (controllers.get(key)?.controller === controller) controllers.delete(key);
    }
  }
  async function abrir(escopo: Selecao, id: number, opcoes: { inicial?: boolean; antes?: number } = {}): Promise<boolean> {
    if (!vigente(escopo) || id < 0) return false;
    const escopoKey = chave(escopo);
    const params = new URLSearchParams({ conversa: String(id) });
    if (opcoes.antes !== undefined) params.set("antes", String(opcoes.antes));
    else if (opcoes.inicial) params.set("inicial", "1");
    const request = (versoes.get("abrir") ?? 0) + 1;
    versoes.set("abrir", request);
    abrindo.set(escopoKey, request);
    let aplicou = false;
    try {
      const page = await requisitar<Pagina>(`/comunicador/api?${params}`, "abrir", true, true);
      if (!vigente(escopo) || versoes.get("abrir") !== request) return false;
      deps.aoPagina(escopo, page, true);
      aplicou = true;
      return true;
    } catch (erro) {
      if (vigente(escopo) && versoes.get("abrir") === request && !(erro instanceof DOMException && erro.name === "AbortError"))
        deps.aoFalhar(erro instanceof Error ? erro.message : String(erro), escopo);
      return false;
    } finally {
      if (abrindo.get(escopoKey) === request) abrindo.delete(escopoKey);
      if (!vigente(escopo)) syncPendente.delete(escopoKey);
      else if (aplicou && !abrindo.has(escopoKey) && syncPendente.has(escopoKey)) {
        syncPendente.delete(escopoKey);
        void sincronizar(escopo, id);
      }
    }
  }
  async function pagina(escopo: Selecao, id: number, direcao: "antes" | "depois", cursor: number): Promise<boolean> {
    const lock = `pagina:${chave(escopo)}:${direcao}:${cursor}`;
    if (!vigente(escopo) || id < 0 || abrindo.has(chave(escopo)) || locks.has(lock)) return false;
    locks.add(lock);
    try {
      const page = await requisitar<Pagina>(`/comunicador/api?conversa=${id}&${direcao}=${cursor}`, lock, true, true);
      if (!vigente(escopo)) return false;
      deps.aoPagina(escopo, page, false);
      return true;
    } catch (erro) {
      if (vigente(escopo) && !(erro instanceof DOMException && erro.name === "AbortError"))
        deps.aoFalhar(erro instanceof Error ? erro.message : String(erro), escopo);
      return false;
    } finally { locks.delete(lock); }
  }
  async function sincronizar(escopo: Selecao, id: number): Promise<void> {
    if (!vigente(escopo) || id <= 0) return;
    const key = `sync:${chave(escopo)}`;
    if (abrindo.has(chave(escopo))) { syncPendente.set(chave(escopo), true); return; }
    if (controllers.has("abrir")) { syncPendente.set(chave(escopo), true); return; }
    if (locks.has(key)) { syncPendente.set(chave(escopo), true); return; }
    locks.add(key);
    try {
      do {
        syncPendente.delete(chave(escopo));
        let cursor = Math.max(0, (deps.primeiroId() ?? 1) - 1);
        while (vigente(escopo)) {
          let page: Pagina;
          try { page = await requisitar<Pagina>(`/comunicador/api?conversa=${id}&depois=${cursor}`, key, true); }
          catch (erro) {
            if (erro instanceof RespostaHttp && erro.status === 403 && vigente(escopo)) deps.aoPerderAcesso(escopo);
            else if (!(erro instanceof DOMException && erro.name === "AbortError") && vigente(escopo)) deps.aoFalhar(erro instanceof Error ? erro.message : String(erro), escopo);
            return;
          }
          if (!vigente(escopo)) return;
          deps.aoPagina(escopo, page, false);
          if (page.mensagens.length < 50) break;
          const ultimo = page.mensagens.at(-1);
          if (!ultimo) break;
          cursor = ultimo.id;
        }
      } while (syncPendente.get(chave(escopo)) && vigente(escopo));
    } finally { locks.delete(key); }
  }
  async function localizar(mensagemId: number): Promise<{ conversaId: number } | null> {
    const key = `localizar:${mensagemId}`;
    const request = (versoes.get(key) ?? 0) + 1;
    versoes.set(key, request);
    try {
      const resultado = await requisitar<{ conversaId: number }>(`/comunicador/api?mensagem=${mensagemId}`, key, true);
      return deps.montado() && versoes.get(key) === request ? resultado : null;
    } catch { return null; }
  }
  async function listar(): Promise<ResultadoLista | null> {
    const key = "lista";
    const request = (versoes.get(key) ?? 0) + 1;
    versoes.set(key, request);
    try {
      const resultado = await requisitar<ResultadoLista>("/comunicador/api", key, false, true);
      return deps.montado() && versoes.get(key) === request ? resultado : null;
    } catch { return null; }
  }
  async function buscar(url: string): Promise<{ resultados: ResultadoBusca[] } | null> {
    return consultar(url, "busca");
  }
  async function referencias(url: string): Promise<RespostaReferencias | null> {
    return consultar<RespostaReferencias>(url, "referencias");
  }
  async function viajantes(url: string): Promise<RespostaViajantes | null> {
    return consultar<RespostaViajantes>(url, "viajantes");
  }
  async function consultar<T>(url: string, key: string): Promise<T | null> {
    const n = (versoes.get(key) ?? 0) + 1; versoes.set(key, n);
    try { const resultado = await requisitar<T>(url, key, false); return deps.montado() && versoes.get(key) === n ? resultado : null; }
    catch (erro) {
      if (deps.montado() && versoes.get(key) === n && !(erro instanceof DOMException && erro.name === "AbortError"))
        deps.aoFalhar(erro instanceof Error ? erro.message : String(erro), null);
      return null;
    }
  }
  return { abrir, pagina, sincronizar, localizar, listar, buscar, referencias, viajantes, cancelar, cancelarChave } satisfies Consultas;
}
