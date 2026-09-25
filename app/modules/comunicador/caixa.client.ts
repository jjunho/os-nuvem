import { apagarSaida, guardarSaida, listarSaidas, type Saida } from "./offline.client";
import { comando } from "./api.client";
import { ConfirmacaoInvalida, confirmarEnvio } from "./contratos";
import { enviarArquivo } from "./midia.client";
import type { Selecao } from "./estado-ui";

export type Caixa = {
  carregar(): Promise<void>;
  enfileirar(item: Saida): Promise<Saida>;
  reenviar(item: Saida): Promise<void>;
  iniciar(): Promise<() => void>;
};
export function criarCaixa(deps: {
  usuarioId: number;
  selecao(): Selecao;
  aoMudar(saidas: Saida[]): void;
  aoFalhar(texto: string): void;
  aoConfirmar(item: Saida, confirmado: { id: number; conversaId: number }, escopoInicial: Selecao): void;
  aoOnline(): void;
}) {
  let montado = true;
  let drenando = false;
  let iniciando: Promise<void> | null = null;
  let pararAtual: (() => void) | null = null;
  let montagens = 0;
  async function carregar(): Promise<void> {
    try {
      const itens = await listarSaidas(deps.usuarioId);
      if (montado) deps.aoMudar(itens);
    } catch (erro) {
      if (montado) deps.aoFalhar(erro instanceof Error ? erro.message : String(erro));
    }
  }
  async function drenar(): Promise<void> {
    if (drenando || !navigator.onLine) return;
    drenando = true;
    try {
      const fila = await listarSaidas(deps.usuarioId);
      for (const item of fila) {
        if (item.falhou) break;
        const escopo = deps.selecao();
        let confirmado: { id: number; conversaId: number };
        try {
          let resultado: unknown;
          if (item.arquivo)
            resultado = await enviarArquivo(item.conversaId, item.arquivo, item.clientId, item.texto);
          else if (item.conversaId < 0)
            resultado = await comando<{ conversaId: number }>({
              acao: "interna",
              viagemId: -item.conversaId,
              clientId: item.clientId,
              texto: item.texto,
            });
          else
            resultado = await comando<unknown>({
              acao: "enviar",
              conversaId: item.conversaId,
              clientId: item.clientId,
              texto: item.texto,
              citadaId: item.citadaId,
            });
          confirmado = confirmarEnvio(resultado, item.conversaId, !!item.arquivo);
        } catch (erro) {
          if (navigator.onLine && !(erro instanceof TypeError) && !(erro instanceof ConfirmacaoInvalida)) {
            try {
              await guardarSaida({ ...item, falhou: true });
              if (montado) deps.aoMudar(await listarSaidas(deps.usuarioId));
            } catch (persistencia) {
              if (montado) deps.aoFalhar(persistencia instanceof Error ? persistencia.message : String(persistencia));
            }
          }
          break;
        }
        try {
          if (item.ordem !== undefined) await apagarSaida(item.ordem);
        } catch (erro) {
          if (montado) deps.aoFalhar(erro instanceof Error ? erro.message : String(erro));
          break;
        }
        if (montado) {
          try {
            deps.aoMudar(await listarSaidas(deps.usuarioId));
          } catch (erro) {
            deps.aoFalhar(erro instanceof Error ? erro.message : String(erro));
          }
          try {
            deps.aoConfirmar(item, confirmado, escopo);
          } catch (erro) {
            deps.aoFalhar(erro instanceof Error ? erro.message : String(erro));
          }
        }
      }
    } catch (erro) {
      if (montado) deps.aoFalhar(erro instanceof Error ? erro.message : String(erro));
    } finally { drenando = false; }
  }
  async function enfileirar(item: Saida): Promise<Saida> {
    const salvo = await guardarSaida(item);
    if (montado) {
      const atual = await listarSaidas(deps.usuarioId);
      deps.aoMudar(atual);
      void drenar();
    }
    return salvo;
  }
  async function reenviar(item: Saida): Promise<void> { await enfileirar({ ...item, falhou: false }); }
  async function iniciar(): Promise<() => void> {
    montagens++;
    montado = true;
    if (!iniciando) {
      iniciando = (async () => {
        await carregar();
        void drenar();
        const online = () => {
          void drenar();
          deps.aoOnline();
        };
        window.addEventListener("online", online);
        const timer = setInterval(() => void drenar(), 5000);
        pararAtual = () => {
          montado = false;
          window.removeEventListener("online", online);
          clearInterval(timer);
          pararAtual = null;
          iniciando = null;
        };
      })();
    }
    await iniciando;
    let ativo = true;
    return () => {
      if (!ativo) return;
      ativo = false;
      montagens--;
      if (montagens === 0) pararAtual?.();
    };
  }
  return { carregar, enfileirar, reenviar, iniciar } satisfies Caixa;
}
