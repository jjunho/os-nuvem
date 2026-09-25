import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useMaquina } from "~/modules/interface/use-maquina";
import { abrirEventos } from "./eventos.client";
import { criarPresenca } from "./presenca.client";
import {
  criarConsultas,
  type Consultas,
  type ResultadoLista,
  type ResultadoBusca,
  type ResultadoReferencia,
  type ResultadoViajante,
} from "./consultas.client";
import { criarCaixa, type Caixa } from "./caixa.client";
import { reduzirPainel, type EstadoPainel } from "./estado-painel";
import { reduzirConteudo, type Conteudo } from "./conteudo";
import { compositor, mesmaSelecao, novoCompositor, type Compositor, type Selecao } from "./estado-ui";
import type { Mensagem, Conversa, Pessoa } from "./tipos";
import type { Saida } from "./offline.client";
import type { Cartao } from "./cartao";
import { comando } from "./api.client";
import type { Comando } from "./acoes";
import { comprimirFoto } from "./midia.client";
import { criarGravacao, type FaseGravacao } from "./gravacao";
import { interpretarEndereco } from "./endereco";
import type { PreferenciaComunicador } from "./preferencias.server";

const estadoInicial: EstadoPainel = {
  selecao: { conversaId: null, geracao: 0 },
  carga: "vazia",
  erro: null,
};
const conteudoInicial: Conteudo = { mensagens: [], cartoes: [], leitores: [] };
type Referencia = ResultadoReferencia;
export type ReferenciaPainel = ResultadoReferencia;

type TarefaEmEdicao = { mensagemId?: number; titulo: string; clientId: string; conversaId: number; fase: "editando" | "salvando"; erro?: string };

export type OpcoesPainel = {
  usuarioId: number;
  aberta: boolean;
  aoNaoLidas: (total: number) => void;
};
export type ConversasPainel = {
  lista: Conversa[];
  grupos: Conversa[];
  pessoas: Pessoa[];
  arquivadas: boolean;
  atualizar(): Promise<void>;
  mostrarArquivadas(mostrar: boolean): void;
  abrirDireta(usuarioId: number): Promise<boolean>;
  criarGrupo(nome: string, descricao: string, privada: boolean): Promise<boolean>;
  entrar(conversaId: number): Promise<boolean>;
};
export type ConteudoPainel = {
  mensagens: Mensagem[];
  cartoes: Cartao[];
  leitores: { nome: string; lida_ate: number }[];
  carga: EstadoPainel["carga"];
  erro: string | null;
  carregarPagina(direcao: "antes" | "depois", cursor: number, mensagemId?: number): Promise<boolean>;
  marcarLidaVisivel(conversaId: number, mensagemId: number): void;
  sincronizar(): Promise<void>;
  tentarNovamente(): Promise<boolean>;
};
export type CompositorPainel = {
  estado: Compositor;
  selecao: Selecao;
  selecionar(id: number | null): Selecao;
  abrir(id: number, opcoes?: { inicial?: boolean; antes?: number; mensagemId?: number; preservar?: boolean }): Promise<boolean>;
  definirTexto(texto: string): void;
  enviar(): Promise<void>;
  citar(mensagemId: number): void;
  editar(mensagemId: number, texto: string): void;
  cancelarEdicao(): void;
  reagir(mensagemId: number, emoji: string): Promise<boolean>;
  apagarMensagem(mensagemId: number): Promise<boolean>;
  marcarNaoLida(mensagemId: number): Promise<boolean>;
  marcarLida(mensagemId: number): Promise<boolean>;
};
export type MidiaPainel = {
  fila: Saida[];
  faseGravacao: FaseGravacao;
  foto: string | null;
  zoom: number;
  definirZoom(valor: number): void;
  viajantes: ResultadoViajante[];
  midiaEmMovimento: string | null;
  reporte: boolean;
  enfileirar(item: Saida): Promise<Saida>;
  reenviar(item: Saida): Promise<void>;
  enviarArquivo(arquivo: File, conversaId?: number): Promise<void>;
  enviarReporte(texto: string, arquivo: File, clientId: string): Promise<boolean>;
  cancelarReporte(): void;
  iniciarGravacao(): void;
  pararGravacao(): void;
  cancelarGravacao(): void;
  ampliarFoto(url: string): void;
  fecharFoto(): void;
  moverMidia(midiaId: string, viajanteId: number): Promise<boolean>;
  carregarViajantes(consulta: string, viagemId?: number): Promise<void>;
  prepararMovimento(midiaId: string, viagemId?: number): Promise<void>;
  cancelarMovimento(): void;
  purgarMidia(midiaId: string): Promise<boolean>;
};
export type TarefaPainel = {
  atual: TarefaEmEdicao | null;
  referencias: Referencia[];
  abrir(dados: { mensagemId?: number; titulo: string }): string | null;
  carregarReferencias(consulta: string): Promise<void>;
  salvar(dados: { titulo: string; responsavelId: number; prazo: string; viagemId?: number; copias: number[] }): Promise<boolean>;
  cancelar(): void;
  concluir(tarefaId: number): Promise<boolean>;
};
export type PreferenciasPainel = {
  atual: PreferenciaComunicador;
  salvar(dndInicio: string | null, dndFim: string | null, fuso: string | null): Promise<boolean>;
  marcarAvisoVisto(): Promise<boolean>;
  definirModo(conversaId: number, modo: "todas" | "mencoes" | "mudo"): Promise<boolean>;
  editarGrupo(conversaId: number, dados: { nome: string; descricao: string; privada: boolean; arquivada: boolean }): Promise<boolean>;
  sair(conversaId: number): Promise<boolean>;
  convidar(conversaId: number, usuarioId: number): Promise<boolean>;
  remover(conversaId: number, usuarioId: number): Promise<boolean>;
};
export type BuscaPainel = {
  resultados: ResultadoBusca[];
  buscar(parametros: URLSearchParams): Promise<void>;
  abrirMensagem(mensagemId: number): Promise<boolean>;
  referencias(consulta: string): Promise<Referencia[]>;
  selecionarReferencia(texto: string, referencia: string): string;
};
export type PerfilPainel = { usuario: number; papel: string };
export type GruposPainel = {
  conversas: ConversasPainel;
  conteudo: ConteudoPainel;
  compositor: CompositorPainel;
  midia: MidiaPainel;
  tarefa: TarefaPainel;
  preferencias: PreferenciasPainel;
  busca: BuscaPainel;
  perfil: PerfilPainel;
};

function descreverErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : String(erro);
}

export function usePainel(opcoes: OpcoesPainel): GruposPainel {
  const location = useLocation();
  const endereco = interpretarEndereco(new URLSearchParams(location.search));
  const maquinaPainel = useMaquina(reduzirPainel, estadoInicial);
  const maquinaConteudo = useMaquina(reduzirConteudo, conteudoInicial);
  const maquinaCompositor = useMaquina(compositor, () => novoCompositor(null));
  const [lista, setLista] = useState<ResultadoLista | null>(null);
  const [fila, setFila] = useState<Saida[]>([]);
  const [preferencia, setPreferencia] = useState<PreferenciaComunicador>({ aviso_visto: true, dnd_inicio: "", dnd_fim: "", fuso: "Asia/Seoul" });
  const [buscaResultados, setBuscaResultados] = useState<ResultadoBusca[]>([]);
  const [referenciasTarefa, setReferenciasTarefa] = useState<Referencia[]>([]);
  const [viajantes, setViajantes] = useState<ResultadoViajante[]>([]);
  const [foto, setFoto] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [faseGravacao, setFaseGravacao] = useState<FaseGravacao>("ociosa");
  const [midiaEmMovimento, setMidiaEmMovimento] = useState<string | null>(null);
  const [tarefaAtual, setTarefaAtual] = useState<TarefaEmEdicao | null>(null);
  const [reporte, setReporte] = useState(false);
  const [arquivadas, setArquivadas] = useState(false);
  const [gravador] = useState(() => criarGravacao());
  const [presenca] = useState(() => criarPresenca());
  const montado = useRef(false);
  const consultasRef = useRef<Consultas | null>(null);
  const caixaRef = useRef<Caixa | null>(null);
  const tarefaIdAtual = useRef<string | null>(null);
  const tarefasEnviando = useRef(new Set<string>());
  const acoesEnviando = useRef(new Set<string>());
  const visivel = useRef(opcoes.aberta);
  visivel.current = opcoes.aberta;
  const erroAtual = maquinaPainel.estado.erro;
  const selecaoAtual = () => maquinaPainel.atual().selecao;
  const vigente = (escopo: Selecao) => montado.current && mesmaSelecao(selecaoAtual(), escopo);

  if (!consultasRef.current) {
    consultasRef.current = criarConsultas({
      usuarioId: opcoes.usuarioId,
      selecao: selecaoAtual,
      montado: () => montado.current,
      primeiroId: () => maquinaConteudo.atual().mensagens[0]?.id ?? null,
      aoPagina: (escopo, pagina, substituir) => {
        if (!mesmaSelecao(selecaoAtual(), escopo)) return;
        maquinaConteudo.emitir({ tipo: substituir ? "substituir" : "mesclar", pagina });
        maquinaPainel.emitir({ tipo: "pagina", escopo, carga: "pronta" });
      },
      aoFalhar: (texto, escopo) => maquinaPainel.emitir({ tipo: "erro", escopo, texto }),
      aoPerderAcesso: (escopo) => {
        if (!mesmaSelecao(selecaoAtual(), escopo)) return;
        maquinaConteudo.emitir({ tipo: "limpar" });
        maquinaPainel.emitir({ tipo: "abertura-falhou", escopo, texto: "Acesso restrito" });
      },
    });
    caixaRef.current = criarCaixa({
      usuarioId: opcoes.usuarioId,
      selecao: selecaoAtual,
      aoMudar: setFila,
      aoOnline: () => {
        const escopo = selecaoAtual();
        if (visivel.current && escopo.conversaId && escopo.conversaId > 0) {
          void consultasRef.current?.sincronizar(escopo, escopo.conversaId);
        }
      },
      aoFalhar: (texto) => maquinaPainel.emitir({ tipo: "erro", escopo: null, texto }),
      aoConfirmar: (item, confirmado, escopo) => {
        if (!mesmaSelecao(selecaoAtual(), escopo)) return;
        if (item.conversaId !== escopo.conversaId) return;
        if (item.conversaId > 0) {
          void consultasRef.current?.sincronizar(escopo, item.conversaId);
        } else if (item.conversaId < 0) {
          void abrir(confirmado.conversaId, { preservar: true });
        }
      },
    });
  }
  const consultas = consultasRef.current;
  const caixa = caixaRef.current;
  if (!consultas || !caixa) throw new Error("Falha ao inicializar serviços do Comunicador");
  const enfileirarSaida = caixa.enfileirar;
  const reenviarSaida = caixa.reenviar;

  function selecionar(id: number | null, preservar = false): Selecao {
    const anterior = selecaoAtual().conversaId;
    consultasRef.current?.cancelar(true);
    consultasRef.current?.cancelarChave("referencias");
    consultasRef.current?.cancelarChave("viajantes");
    const escopo = maquinaPainel.emitir({ tipo: "selecionar", conversaId: id }).selecao;
    maquinaConteudo.emitir({ tipo: "limpar" });
    if (!preservar && anterior !== id) {
      maquinaCompositor.emitir({ tipo: "conversa", conversaId: id });
      setTarefaAtual(null);
      tarefaIdAtual.current = null;
      setReporte(false);
    } else if (preservar && anterior !== null && id !== null) {
      maquinaCompositor.emitir({ tipo: "materializada", anterior, conversaId: id });
      setTarefaAtual((atual) => atual ? { ...atual, conversaId: id } : null);
    }
    if (anterior !== id) {
      setReferenciasTarefa([]);
      setMidiaEmMovimento(null);
      setViajantes([]);
      gravador.cancelar();
    }
    return escopo;
  }

  async function abrir(id: number, detalhes: { inicial?: boolean; antes?: number; mensagemId?: number; preservar?: boolean } = {}): Promise<boolean> {
    const escopo = selecionar(id, detalhes.preservar);
    if (id < 0) return true;
    localStorage.setItem(`comunicador-conversa:${opcoes.usuarioId}`, String(id));
    const abriu = await consultas.abrir(escopo, id, { inicial: detalhes.inicial, antes: detalhes.antes });
    if (abriu && detalhes.mensagemId !== undefined) {
      requestAnimationFrame(() => {
        if (vigente(escopo)) document.getElementById(`mensagem-${detalhes.mensagemId}`)?.scrollIntoView();
      });
    }
    return abriu;
  }
  async function atualizar(): Promise<void> {
    const resposta = await consultas.listar();
    if (!resposta || !montado.current) return;
    setLista(resposta);
    const total = resposta.conversas.reduce((soma, conversa) => soma + conversa.nao_lidas, 0);
    opcoes.aoNaoLidas(total);
    if ("setAppBadge" in navigator) {
      const navegador = navigator as Navigator & { setAppBadge: (total: number) => Promise<void> };
      void navegador.setAppBadge(total).catch(() => {});
    }
    setPreferencia(resposta.preferencia);
  }
  async function executar(comandoPainel: Comando): Promise<boolean> {
    const escopo = selecaoAtual();
    const chave = JSON.stringify(comandoPainel);
    if (acoesEnviando.current.has(chave)) return false;
    acoesEnviando.current.add(chave);
    try {
      await comando(comandoPainel);
      await atualizar();
      if (vigente(escopo) && escopo.conversaId && escopo.conversaId > 0) await consultas.sincronizar(escopo, escopo.conversaId);
      return true;
    } catch (erro) {
      if (vigente(escopo)) maquinaPainel.emitir({ tipo: "erro", escopo, texto: descreverErro(erro) });
      return false;
    } finally {
      acoesEnviando.current.delete(chave);
    }
  }
  const marcarLidaVisivel = useCallback((conversaId: number, mensagemId: number) => {
    const escopo = selecaoAtual();
    if (!montado.current || !visivel.current || conversaId <= 0 || escopo.conversaId !== conversaId) return;
    void executar({ acao: "ler", conversaId, mensagemId });
  }, []);
  async function enviarArquivo(arquivo: File, conversaId = selecaoAtual().conversaId): Promise<void> {
    if (!conversaId || conversaId < 0) return;
    const escopo = selecaoAtual();
    try {
      const pronto = arquivo.type.startsWith("image/") ? await comprimirFoto(arquivo) : arquivo;
      await enfileirarSaida({ clientId: crypto.randomUUID(), usuarioId: opcoes.usuarioId, conversaId, texto: arquivo.type.startsWith("image/") ? "📷" : "🎙", arquivo: pronto, falhou: false });
    } catch (erro) {
      if (vigente(escopo)) maquinaPainel.emitir({ tipo: "erro", escopo, texto: descreverErro(erro) });
    }
  }
  async function enviar(): Promise<void> {
    const atual = maquinaCompositor.atual();
    if (atual.fase === "enviando" || !atual.conversaId || !atual.rascunho.texto.trim()) return;
    const { rascunho, conversaId } = atual;
    if (atual.rascunho.tipo !== "editar" && atual.rascunho.texto.startsWith("/tarefa")) {
      const clientId = crypto.randomUUID();
      tarefaIdAtual.current = clientId;
      setReferenciasTarefa([]);
      setTarefaAtual({
        titulo: atual.rascunho.texto.replace(/^\/tarefa\s*/, ""),
        clientId,
        conversaId: atual.conversaId,
        fase: "editando",
      });
      maquinaCompositor.emitir({ tipo: "cancelar" });
      return;
    }
    if (atual.rascunho.tipo !== "editar" && atual.rascunho.texto.startsWith("/bug")) {
      setReporte(true);
      maquinaCompositor.emitir({ tipo: "cancelar" });
      return;
    }
    const tentativa = crypto.randomUUID();
    const escopo = selecaoAtual();
    maquinaCompositor.emitir({ tipo: "enviar", tentativa });
    try {
      if (rascunho.tipo === "editar") await comando({ acao: "editar", mensagemId: rascunho.mensagemId, texto: rascunho.texto });
      else await enfileirarSaida({ clientId: tentativa, conversaId, usuarioId: opcoes.usuarioId, texto: rascunho.texto, citadaId: rascunho.tipo === "citar" ? rascunho.mensagemId : null, falhou: false });
      maquinaCompositor.emitir({ tipo: "enviado", tentativa });
      if (rascunho.tipo === "editar" && vigente(escopo)) void consultas.sincronizar(escopo, conversaId);
    } catch (erro) {
      maquinaCompositor.emitir({ tipo: "falhou", tentativa, erro: descreverErro(erro) });
    }
  }
  async function carregarViajantes(consulta: string, viagemId?: number): Promise<void> {
    setViajantes([]);
    const parametros = new URLSearchParams({ viajantes: consulta });
    if (viagemId !== undefined) parametros.set("viagemId", String(viagemId));
    const resposta = await consultas.viajantes("/comunicador/api?" + parametros);
    if (resposta) setViajantes(resposta.resultados);
  }
  async function carregarReferencias(consulta: string): Promise<Referencia[]> {
    const resposta = await consultas.referencias("/comunicador/api?referencias=" + encodeURIComponent(consulta));
    if (resposta) return resposta.resultados;
    return [];
  }

  useEffect(() => {
    let ativo = true;
    montado.current = true;
    void atualizar();
    let pararFila: (() => void) | undefined;
    void caixa.iniciar().then((parar) => {
      if (!ativo) parar();
      else pararFila = parar;
    });
    const pararEventos = abrirEventos({ aoEvento: (evento) => {
      void atualizar();
      const escopo = selecaoAtual();
      if (!visivel.current || !escopo.conversaId || escopo.conversaId < 1) return;
      if (evento.id && evento.id !== escopo.conversaId) return;
      if (evento.tipo === "leitura") void consultas.abrir(escopo, escopo.conversaId);
      else void consultas.sincronizar(escopo, escopo.conversaId);
    } });
    return () => {
      ativo = false;
      montado.current = false;
      pararFila?.();
      pararEventos();
      consultasRef.current?.cancelar();
      gravador.cancelar();
      maquinaPainel.emitir({ tipo: "descartar" });
    };
  }, [opcoes.usuarioId]);
  useEffect(() => {
    const tripId = Number(endereco.interna);
    const conversaId = Number(endereco.conversa);
    const mensagemId = Number(endereco.mensagem);
    if (Number.isSafeInteger(mensagemId) && mensagemId > 0) {
      const escopo = selecionar(null);
      void (async () => {
        const localizada = await consultas.localizar(mensagemId);
        if (vigente(escopo) && localizada) {
          await abrir(localizada.conversaId, { antes: mensagemId + 1, mensagemId });
        }
      })();
      return;
    }
    if (Number.isSafeInteger(tripId) && tripId > 0) {
      const escopo = selecionar(null);
      void (async () => {
        const resposta = await consultas.listar();
        if (!vigente(escopo)) return;
        const interna = resposta?.conversas.find((conversa) => conversa.tipo === "interna" && conversa.viagem_id === tripId);
        await abrir(interna?.id ?? -tripId);
      })();
      return;
    }
    if (Number.isSafeInteger(conversaId) && conversaId > 0) {
      void abrir(conversaId, { inicial: true });
      return;
    }
    const salvo = Number(localStorage.getItem(`comunicador-conversa:${opcoes.usuarioId}`));
    if (Number.isSafeInteger(salvo) && salvo > 0) void abrir(salvo, { inicial: true });
  }, [endereco.interna, endereco.conversa, endereco.mensagem, opcoes.usuarioId]);
  useEffect(() => presenca.iniciar({ conversaId: maquinaPainel.estado.selecao.conversaId, aberta: opcoes.aberta }), [presenca, maquinaPainel.estado.selecao.conversaId, opcoes.aberta]);
  useEffect(() => {
    const id = maquinaPainel.estado.selecao.conversaId;
    if (opcoes.aberta && id && id > 0) void consultas.sincronizar(maquinaPainel.estado.selecao, id);
  }, [opcoes.aberta]);

  return {
    conversas: {
      lista: lista?.conversas ?? [], grupos: lista?.grupos ?? [], pessoas: lista?.usuarios ?? [], arquivadas,
      atualizar,
      mostrarArquivadas: setArquivadas,
      abrirDireta: async (usuarioId) => {
        try {
          const conversa = await comando<{ id: number }>({ acao: "direta", usuarioId });
          await atualizar();
          return await abrir(conversa.id);
        } catch (erro) {
          maquinaPainel.emitir({ tipo: "erro", escopo: selecaoAtual(), texto: descreverErro(erro) });
          return false;
        }
      },
      criarGrupo: (nome, descricao, privada) => executar({ acao: "grupo", nome, descricao, privada }),
      entrar: (conversaId) => executar({ acao: "entrar", conversaId }),
    },
    conteudo: {
      mensagens: maquinaConteudo.estado.mensagens, cartoes: maquinaConteudo.estado.cartoes, leitores: maquinaConteudo.estado.leitores,
      carga: maquinaPainel.estado.carga, erro: erroAtual?.texto ?? null,
      carregarPagina: async (direcao, cursor, mensagemId) => {
        const escopo = selecaoAtual();
        const id = escopo.conversaId;
        if (!id || id <= 0) return false;
        const carregou = await consultas.pagina(escopo, id, direcao, cursor);
        if (carregou && mensagemId !== undefined) {
          requestAnimationFrame(() => {
            if (vigente(escopo)) document.getElementById(`mensagem-${mensagemId}`)?.scrollIntoView();
          });
        }
        return carregou;
      },
      marcarLidaVisivel,
      tentarNovamente: () => {
        const id = selecaoAtual().conversaId;
        return id ? abrir(id, { inicial: true }) : Promise.resolve(false);
      },
      sincronizar: async () => { const escopo = selecaoAtual(); if (escopo.conversaId && escopo.conversaId > 0) await consultas.sincronizar(escopo, escopo.conversaId); },
    },
    compositor: {
      estado: maquinaCompositor.estado, selecao: maquinaPainel.estado.selecao, selecionar: (id) => selecionar(id), abrir,
      definirTexto: (texto) => maquinaCompositor.emitir({ tipo: "texto", texto }),
      citar: (mensagemId) => maquinaCompositor.emitir({ tipo: "citar", mensagemId }),
      editar: (mensagemId, texto) => maquinaCompositor.emitir({ tipo: "editar", mensagemId, texto }),
      cancelarEdicao: () => maquinaCompositor.emitir({ tipo: "cancelar" }),
      enviar,
      reagir: (mensagemId, emoji) => executar({ acao: "reagir", mensagemId, emoji }),
      apagarMensagem: (mensagemId) => executar({ acao: "apagar", mensagemId }),
      marcarNaoLida: (mensagemId) => {
        const conversaId = selecaoAtual().conversaId;
        return conversaId ? executar({ acao: "nao-lida", conversaId, mensagemId }) : Promise.resolve(false);
      },
      marcarLida: (mensagemId) => {
        const conversaId = selecaoAtual().conversaId;
        return conversaId ? executar({ acao: "ler", conversaId, mensagemId }) : Promise.resolve(false);
      },
    },
    midia: {
      fila, faseGravacao, foto, zoom, viajantes, midiaEmMovimento,
      enfileirar: (item) => enfileirarSaida(item),
      reenviar: async (item) => { const escopo = selecaoAtual(); try { await reenviarSaida(item); } catch (erro) { if (vigente(escopo)) maquinaPainel.emitir({ tipo: "erro", escopo, texto: descreverErro(erro) }); } },
      enviarArquivo,
      reporte,
      enviarReporte: async (texto, arquivo, clientId) => {
        const escopoInicial = selecaoAtual();
        let escopoReporte = escopoInicial;
        let conversaId = escopoInicial.conversaId;
        if (conversaId === null) return false;
        try {
          if (conversaId < 0) {
            conversaId = (await comando<{ conversaId: number }>({
              acao: "interna",
              viagemId: -conversaId,
              texto: "/bug",
              clientId: `${clientId}-interna`,
            })).conversaId;
            if (vigente(escopoInicial)) {
              const abertura = abrir(conversaId, { preservar: true });
              escopoReporte = selecaoAtual();
              void abertura.catch((erro) => {
                if (vigente(escopoReporte))
                  maquinaPainel.emitir({
                    tipo: "erro",
                    escopo: escopoReporte,
                    texto: descreverErro(erro),
                  });
              });
            }
          }
          await enfileirarSaida({
            clientId,
            usuarioId: opcoes.usuarioId,
            conversaId,
            texto,
            arquivo,
            falhou: false,
          });
          if (vigente(escopoReporte)) setReporte(false);
          return true;
        } catch (erro) {
          if (vigente(escopoReporte))
            maquinaPainel.emitir({ tipo: "erro", escopo: escopoReporte, texto: descreverErro(erro) });
          throw erro;
        }
      },
      cancelarReporte: () => setReporte(false),
      iniciarGravacao: () => {
        const escopo = selecaoAtual();
        if (!escopo.conversaId || escopo.conversaId < 0 || maquinaPainel.estado.carga !== "pronta") return;
        const conversaId = escopo.conversaId;
        void gravador.iniciar(conversaId, (id, arquivo) => { if (vigente(escopo) && visivel.current) void enviarArquivo(arquivo, id); }, (fase) => { if (montado.current) setFaseGravacao(fase); }, () => { if (vigente(escopo)) maquinaPainel.emitir({ tipo: "erro", escopo, texto: "Microfone indisponível" }); });
      },
      pararGravacao: () => gravador.parar(), cancelarGravacao: () => gravador.cancelar(),
      ampliarFoto: (url) => { setFoto(url); setZoom(1); }, fecharFoto: () => setFoto(null), definirZoom: setZoom,
      carregarViajantes,
      prepararMovimento: async (midiaId, viagemId) => {
        setMidiaEmMovimento(midiaId);
        await carregarViajantes("", viagemId);
      },
      moverMidia: async (midiaId, viajanteId) => {
        const escopo = selecaoAtual();
        const ok = await executar({ acao: "mover", midiaId, viajanteId });
        if (ok && vigente(escopo)) setMidiaEmMovimento(null);
        return ok;
      },
      cancelarMovimento: () => setMidiaEmMovimento(null),
      purgarMidia: (midiaId) => executar({ acao: "purgar", midiaId }),
    },
    tarefa: {
      atual: tarefaAtual, referencias: referenciasTarefa,
      abrir: ({ mensagemId, titulo }) => {
        const conversaId = selecaoAtual().conversaId;
        if (!conversaId) return null;
        const clientId = crypto.randomUUID();
        tarefaIdAtual.current = clientId;
        setReferenciasTarefa([]);
        setTarefaAtual({ mensagemId, titulo, conversaId, clientId, fase: "editando" });
        return clientId;
      },
      carregarReferencias: async (consulta) => {
        const escopo = selecaoAtual();
        const clientId = tarefaIdAtual.current;
        setReferenciasTarefa([]);
        const resposta = await consultas.referencias("/comunicador/api?referencias=" + encodeURIComponent(consulta));
        if (!clientId || !vigente(escopo) || tarefaIdAtual.current !== clientId) return;
        if (resposta) setReferenciasTarefa(resposta.resultados);
      },
      salvar: async ({ titulo, responsavelId, prazo, viagemId, copias }) => {
        const atual = tarefaAtual;
        if (!atual || atual.fase === "salvando" || tarefasEnviando.current.has(atual.clientId)) return false;
        const escopo = selecaoAtual();
        tarefasEnviando.current.add(atual.clientId);
        setTarefaAtual({ ...atual, titulo, fase: "salvando", erro: undefined });
        try {
          let conversaId = atual.conversaId;
          if (conversaId < 0) conversaId = (await comando<{ conversaId: number }>({ acao: "interna", viagemId: -conversaId, texto: "/tarefa " + titulo, clientId: `${atual.clientId}-interna` })).conversaId;
          await comando({ acao: "tarefa", clientId: atual.clientId, viagemId, conversaId, mensagemId: atual.mensagemId, titulo, responsavelId, prazo, copias });
          if (vigente(escopo) && tarefaIdAtual.current === atual.clientId) {
            tarefaIdAtual.current = null;
            setTarefaAtual(null);
            if (atual.conversaId < 0) await abrir(conversaId, { preservar: true });
            else if (conversaId > 0) await consultas.sincronizar(escopo, conversaId);
          }
          return true;
        } catch (erro) {
          if (vigente(escopo)) setTarefaAtual((atualAgora) => atualAgora?.clientId === atual.clientId ? { ...atualAgora, fase: "editando", erro: descreverErro(erro) } : atualAgora);
          return false;
        } finally { tarefasEnviando.current.delete(atual.clientId); }
      },
      cancelar: () => { tarefaIdAtual.current = null; setTarefaAtual(null); },
      concluir: (tarefaId) => { const conversaId = selecaoAtual().conversaId; return conversaId ? executar({ acao: "concluir-tarefa", tarefaId, conversaId }) : Promise.resolve(false); },
    },
    preferencias: {
      atual: preferencia,
      salvar: (dndInicio, dndFim, fuso) => executar({ acao: "preferencias", dndInicio, dndFim, fuso }),
      marcarAvisoVisto: () => executar({ acao: "aviso-visto" }),
      definirModo: (conversaId, modo) => executar({ acao: "modo", conversaId, modo }),
      editarGrupo: (conversaId, dados) => executar({ acao: "grupo-editar", conversaId, ...dados }),
      sair: (conversaId) => executar({ acao: "sair", conversaId }),
      convidar: (conversaId, usuarioId) => executar({ acao: "convidar", conversaId, usuarioId }),
      remover: (conversaId, usuarioId) => executar({ acao: "remover", conversaId, usuarioId }),
    },
    busca: {
      resultados: buscaResultados,
      buscar: async (parametros) => {
        setBuscaResultados([]);
        const resposta = await consultas.buscar("/comunicador/api?" + parametros);
        if (resposta) setBuscaResultados(resposta.resultados);
      },
      abrirMensagem: async (mensagemId) => {
        const escopo = selecaoAtual();
        const encontrada = await consultas.localizar(mensagemId);
        if (!vigente(escopo) || !encontrada) return false;
        return abrir(encontrada.conversaId, { antes: mensagemId + 1, mensagemId });
      },
      referencias: carregarReferencias,
      selecionarReferencia: (texto, referencia) => texto.replace(/\[\[.*$/, referencia + " "),
    },
    perfil: { usuario: lista?.usuario ?? opcoes.usuarioId, papel: lista?.papel ?? "" },
  };
}
