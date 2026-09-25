import {
  confirmarEnvio,
  identificador,
  ConfirmacaoInvalida,
} from "./contratos";
import { rotuloEtapa } from "~/modules/viagens/rotulos";
import { Reporte } from "./Reporte";
import { criarGravacao, type FaseGravacao } from "./gravacao";
import {
  guardarSaida,
  listarSaidas,
  apagarSaida,
  leituraOffline,
  type Saida,
} from "./offline.client";
import { comprimirFoto, enviarArquivo } from "./midia.client";
import type { Cartao } from "./cartao";
import {
  compositor,
  novoCompositor,
  mesmaSelecao,
  type Selecao,
} from "./estado-ui";
import { useEffect, useReducer, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useIdioma } from "~/modules/idiomas/idioma";
import { textos, erroTraduzido, atividadeTarefa } from "./textos";
import type { Conversa, Mensagem, Pessoa } from "./comunicador.server";
function descreverErro(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
export async function comando(d: object) {
  const r = await fetch("/comunicador/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d),
  });
  if (!r.ok) {
    const mensagem = await r.text();
    if (r.status >= 500 || r.status === 408)
      throw new ConfirmacaoInvalida(mensagem);
    throw Error(mensagem);
  }
  return r.json().catch(() => {
    throw new ConfirmacaoInvalida("Resposta inválida do comunicador");
  });
}
export function Painel({
  fechar,
  usuarioId,
  aberta,
  aoNaoLidas,
}: {
  fechar: () => void;
  usuarioId: number;
  aberta: boolean;
  aoNaoLidas: (n: number) => void;
}) {
  const rota = useLocation();
  const { idioma, mensagem } = useIdioma(),
    t = textos(idioma);
  const [conversas, setConversas] = useState<Conversa[]>([]),
    [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [id, setId] = useState<number | null>(null),
    [msgs, setMsgs] = useState<Mensagem[]>([]);
  const [composicao, dispatch] = useReducer(compositor, null, novoCompositor);
  const compositorAtual = useRef(composicao);
  compositorAtual.current = composicao;
  function emitir(evento: Parameters<typeof compositor>[1]) {
    compositorAtual.current = compositor(compositorAtual.current, evento);
    dispatch(evento);
  }
  const texto = composicao.rascunho.texto;
  const citada =
    composicao.rascunho.tipo === "citar"
      ? composicao.rascunho.mensagemId
      : null;
  const edicao =
    composicao.rascunho.tipo === "editar"
      ? composicao.rascunho.mensagemId
      : null;
  const setTexto = (texto: string) => emitir({ tipo: "texto", texto });
  const [carga, setCarga] = useState<
    "vazia" | "carregando" | "pronta" | "falhou"
  >("vazia");
  const carregando = useRef(false);
  const sincronizacaoPendente = useRef<Selecao | null>(null);
  const selecao = useRef<Selecao>({ conversaId: null, geracao: 0 });
  const montado = useRef(true);
  const consultas = useRef<Record<string, number>>({});
  const [referenciasTarefa, setReferenciasTarefa] = useState<
    { referencia: string; titulo: string; viagemId?: number }[]
  >([]);
  const [bug, setBug] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null),
    [zoom, setZoom] = useState(1),
    [gravacao, setGravacao] = useState<FaseGravacao>("ociosa"),
    [mover, setMover] = useState<string | null>(null),
    [viajantes, setViajantes] = useState<
      { id: number; nome: string; codigo: string }[]
    >([]);
  const [gravador] = useState(() => criarGravacao());
  function cancelarGravacao() {
    gravador.cancelar();
  }
  const [cartoes, setCartoes] = useState<Cartao[]>([]),
    [referencias, setReferencias] = useState<
      { referencia: string; titulo: string; viagemId?: number }[]
    >([]);
  const [tarefa, setTarefa] = useState<{
    mensagemId?: number;
    titulo: string;
    clientId: string;
    conversaId: number;
    fase: "editando" | "salvando";
    erro?: string;
  } | null>(null);
  const [leitores, setLeitores] = useState<
    { nome: string; lida_ate: number }[]
  >([]);
  const [resultados, setResultados] = useState<
    { id: number; conversa_id: number; texto: string; autor: string }[]
  >([]);
  const [perfil, setPerfil] = useState({ usuario: 0, papel: "" });
  const [grupos, setGrupos] = useState<Conversa[]>([]),
    [arquivadas, setArquivadas] = useState(false);
  const [outro, setOutro] = useState(""),
    [erro, setErro] = useState("");
  const [pendentes, setPendentes] = useState<Saida[]>([]);
  const aba = useRef("");
  const [preferencia, setPreferencia] = useState({
    aviso_visto: true,
    dnd_inicio: "",
    dnd_fim: "",
    fuso: "Asia/Seoul",
  });
  const atual = useRef(id);
  atual.current = id;
  const visivel = useRef(aberta);
  visivel.current = aberta;
  const mensagensRef = useRef(msgs);
  mensagensRef.current = msgs;
  const listaRef = useRef<HTMLDivElement>(null);
  const tarefaAtual = useRef<string | null>(null);
  const tarefasEnviando = useRef(new Set<string>());
  const acoesEnviando = useRef(new Set<string>());
  function abrirTarefa(dados: { mensagemId?: number; titulo: string }) {
    if (!id) return;
    const clientId = crypto.randomUUID();
    tarefaAtual.current = clientId;
    setReferenciasTarefa([]);
    leituras.current.get("viagensTarefa")?.controle.abort();
    consultas.current.viagensTarefa =
      (consultas.current.viagensTarefa ?? 0) + 1;
    setTarefa({
      ...dados,
      conversaId: id,
      clientId,
      fase: "editando",
    });
  }
  function vigente(escopo: Selecao) {
    return montado.current && mesmaSelecao(selecao.current, escopo);
  }
  const leituras = useRef(
    new Map<string, { controle: AbortController; local: boolean }>(),
  );
  function cancelarLeituras(somenteLocais = false) {
    for (const [chave, leitura] of leituras.current) {
      if (somenteLocais && !leitura.local) continue;
      leitura.controle.abort();
      leituras.current.delete(chave);
    }
  }
  async function json(
    url: string,
    chave: string,
    local = true,
    offline = false,
  ) {
    leituras.current.get(chave)?.controle.abort();
    const leitura = { controle: new AbortController(), local };
    leituras.current.set(chave, leitura);
    try {
      if (offline)
        return await leituraOffline(usuarioId, url, leitura.controle.signal);
      const r = await fetch(url, { signal: leitura.controle.signal });
      if (!r.ok) {
        if (
          r.status === 403 &&
          chave === "sincronizar" &&
          !leitura.controle.signal.aborted
        ) {
          setMsgs([]);
          setCartoes([]);
          setLeitores([]);
          setCarga("falhou");
        }
        throw Error(await r.text());
      }
      return await r.json();
    } finally {
      if (leituras.current.get(chave) === leitura)
        leituras.current.delete(chave);
    }
  }
  async function consultar<T>(
    chave: string,
    url: string,
    aplicar: (d: { resultados: T[] }) => void,
    local = true,
  ) {
    const pedido = (consultas.current[chave] =
      (consultas.current[chave] ?? 0) + 1);
    const escopo = selecao.current;
    const aceita = () =>
      montado.current &&
      consultas.current[chave] === pedido &&
      (!local || vigente(escopo));
    try {
      const d = await json(url, chave, local);
      if (aceita()) aplicar(d);
    } catch (e) {
      if (aceita() && !(e instanceof DOMException && e.name === "AbortError"))
        setErro(descreverErro(e));
    }
  }
  function pagina(
    escopo: Selecao,
    d: {
      mensagens: Mensagem[];
      cartoes?: Cartao[];
      leitores?: { nome: string; lida_ate: number }[];
    },
    substituir = false,
  ) {
    if (!vigente(escopo)) return;
    setMsgs((p) =>
      [
        ...new Map(
          [...(substituir ? [] : p), ...d.mensagens].map((m) => [m.id, m]),
        ).values(),
      ].sort((a, b) => a.id - b.id),
    );
    setCartoes((p) => [
      ...new Map(
        [...(substituir ? [] : p), ...(d.cartoes ?? [])].map((c) => [
          c.referencia,
          c,
        ]),
      ).values(),
    ]);
    if (d.leitores) setLeitores(d.leitores);
  }
  const sincronizando = useRef<{ escopo: Selecao; repetir: boolean } | null>(
    null,
  );
  async function sincronizar(n: number) {
    const escopo = selecao.current;
    if (!vigente(escopo) || escopo.conversaId !== n || n < 0) return;
    if (carregando.current) {
      sincronizacaoPendente.current = escopo;
      return;
    }
    const anterior = sincronizando.current;
    if (anterior && mesmaSelecao(anterior.escopo, escopo)) {
      anterior.repetir = true;
      return;
    }
    const operacao = { escopo, repetir: false };
    sincronizando.current = operacao;
    try {
      do {
        operacao.repetir = false;
        let cursor = Math.max(0, (mensagensRef.current[0]?.id ?? 1) - 1);
        while (vigente(escopo)) {
          const d = await json(
            `/comunicador/api?conversa=${n}&depois=${cursor}`,
            "sincronizar",
          );
          if (!vigente(escopo)) return;
          pagina(escopo, d);
          if (d.mensagens.length < 50) break;
          cursor = d.mensagens.at(-1).id;
        }
      } while (operacao.repetir && vigente(escopo));
    } catch (e) {
      if (vigente(escopo)) setErro(descreverErro(e));
    } finally {
      if (sincronizando.current === operacao) sincronizando.current = null;
    }
  }
  async function atualizar() {
    const pedido = (consultas.current.lista =
      (consultas.current.lista ?? 0) + 1);
    try {
      const d = await json("/comunicador/api", "lista", false, true);
      if (!montado.current || consultas.current.lista !== pedido) return;
      setConversas(d.conversas);
      const total = d.conversas.reduce(
        (n: number, c: Conversa) => n + c.nao_lidas,
        0,
      );
      aoNaoLidas(total);
      if ("setAppBadge" in navigator)
        void (
          navigator as Navigator & { setAppBadge: (n: number) => Promise<void> }
        )
          .setAppBadge(total)
          .catch(() => {});
      setGrupos(d.grupos);
      setPerfil({ usuario: d.usuario, papel: d.papel });
      setPessoas(d.usuarios);
      setPreferencia(d.preferencia);
    } catch {}
  }
  function selecionar(n: number | null, preservar = false) {
    cancelarLeituras(true);
    const anterior = selecao.current.conversaId;
    const escopo = { conversaId: n, geracao: selecao.current.geracao + 1 };
    selecao.current = escopo;
    sincronizacaoPendente.current = null;
    atual.current = n;
    setId(n);
    setMsgs([]);
    mensagensRef.current = [];
    setCartoes([]);
    setLeitores([]);
    setErro("");
    if (anterior !== n) {
      setReferencias([]);
      setReferenciasTarefa([]);
    }
    if (!preservar && anterior !== n) {
      setBug(null);
      setTarefa(null);
      tarefaAtual.current = null;
      emitir({ tipo: "conversa", conversaId: n });
    } else if (preservar && anterior !== null && n !== null) {
      emitir({ tipo: "materializada", anterior, conversaId: n });
      setTarefa((atual) => (atual ? { ...atual, conversaId: n } : null));
    }
    if (anterior !== n) {
      setMover(null);
      setViajantes([]);
      cancelarGravacao();
    }
    carregando.current = n !== null && n > 0;
    setCarga(n === null ? "vazia" : n < 0 ? "pronta" : "carregando");
    return escopo;
  }
  async function abrir(
    n: number,
    inicial = false,
    mensagemId?: number,
    preservar = false,
  ) {
    const escopo = selecionar(n, preservar);
    if (n < 0) return;
    localStorage.setItem(`comunicador-conversa:${usuarioId}`, String(n));
    try {
      const d = await json(
        `/comunicador/api?conversa=${n}${mensagemId ? `&antes=${mensagemId + 1}` : inicial ? "&inicial=1" : ""}`,
        "abrir",
        true,
        true,
      );
      if (!vigente(escopo)) return;
      pagina(escopo, d, true);
      carregando.current = false;
      setCarga("pronta");
      if (
        sincronizacaoPendente.current &&
        mesmaSelecao(sincronizacaoPendente.current, escopo)
      ) {
        sincronizacaoPendente.current = null;
        mensagensRef.current = d.mensagens;
        void sincronizar(n);
      }
      if (mensagemId)
        requestAnimationFrame(() => {
          if (vigente(escopo))
            document.getElementById(`mensagem-${mensagemId}`)?.scrollIntoView();
        });
    } catch (e) {
      if (!vigente(escopo)) return;
      carregando.current = false;
      setCarga("falhou");
      setErro(descreverErro(e));
    }
  }
  async function carregarPagina(
    direcao: "antes" | "depois",
    cursor: number,
    mensagemId?: number,
  ) {
    const escopo = selecao.current;
    if (!escopo.conversaId || escopo.conversaId < 0 || carregando.current)
      return false;
    const chave = `pagina:${direcao}:${cursor}`;
    const pedido = (consultas.current[chave] =
      (consultas.current[chave] ?? 0) + 1);
    const aceita = () => vigente(escopo) && consultas.current[chave] === pedido;
    try {
      const d = await json(
        `/comunicador/api?conversa=${escopo.conversaId}&${direcao}=${cursor}`,
        chave,
        true,
        true,
      );
      if (!aceita()) return false;
      pagina(escopo, d);
      if (mensagemId)
        requestAnimationFrame(() => {
          if (vigente(escopo))
            document.getElementById(`mensagem-${mensagemId}`)?.scrollIntoView();
        });
      return true;
    } catch (e) {
      if (aceita() && !(e instanceof DOMException && e.name === "AbortError"))
        setErro(descreverErro(e));
      return false;
    }
  }
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      cancelarLeituras();
      selecao.current = {
        ...selecao.current,
        geracao: selecao.current.geracao + 1,
      };
      cancelarGravacao();
    };
  }, []);
  const parametros = new URLSearchParams(rota.search);
  const internaRota = parametros.get("interna"),
    conversaRota = parametros.get("conversa"),
    mensagemRota = parametros.get("mensagem");
  useEffect(() => {
    const vi = Number(internaRota),
      c = Number(conversaRota),
      m = Number(mensagemRota);
    if (m || vi) {
      const escopo = selecionar(null);
      void (async () => {
        try {
          if (m) {
            const d = await json(`/comunicador/api?mensagem=${m}`, "rota");
            if (vigente(escopo)) await abrir(d.conversaId, false, m);
          } else {
            const d = await json("/comunicador/api", "rota");
            if (!vigente(escopo)) return;
            const encontrada = d.conversas.find(
              (x: Conversa) => x.tipo === "interna" && x.viagem_id === vi,
            );
            await abrir(encontrada?.id ?? -vi);
          }
        } catch (e) {
          if (vigente(escopo)) setErro(descreverErro(e));
        }
      })();
    } else if (c) void abrir(c, true);
    else {
      const salvo = Number(
        localStorage.getItem(`comunicador-conversa:${usuarioId}`),
      );
      if (identificador(salvo)) void abrir(salvo, true);
    }
  }, [internaRota, conversaRota, mensagemRota]);
  useEffect(() => {
    aba.current = crypto.randomUUID();
    void atualizar();
    const es = new EventSource("/comunicador/eventos");
    es.onmessage = (e) => {
      void atualizar();
      if (atual.current && atual.current > 0 && visivel.current) {
        const evento = JSON.parse(e.data);
        if (evento.id && evento.id !== atual.current) return;
        if (evento.tipo === "leitura") {
          const escopo = selecao.current;
          const pedido = (consultas.current.leitores =
            (consultas.current.leitores ?? 0) + 1);
          void json(
            `/comunicador/api?conversa=${atual.current}`,
            "leitores",
            true,
            true,
          )
            .then((d) => {
              if (vigente(escopo) && consultas.current.leitores === pedido)
                setLeitores(d.leitores);
            })
            .catch(() => {});
        } else void sincronizar(atual.current);
      }
    };
    return () => es.close();
  }, []);
  useEffect(() => {
    const atualizarPresenca = () => {
      void comando({
        acao: "presenca",
        conversaId: id && id > 0 ? id : 0,
        aba: aba.current,
        lendo: aberta && document.visibilityState === "visible",
      }).catch(() => {});
    };
    atualizarPresenca();
    const timer = setInterval(atualizarPresenca, 10000);
    document.addEventListener("visibilitychange", atualizarPresenca);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", atualizarPresenca);
      void comando({
        acao: "presenca",
        conversaId: 0,
        aba: aba.current,
        lendo: false,
      }).catch(() => {});
    };
  }, [id, aberta]);
  useEffect(() => {
    if (!aberta || !id || id < 0 || carga !== "pronta" || !listaRef.current)
      return;
    let maior = 0;
    let timer: ReturnType<typeof setTimeout>;
    const vistos = new Set<number>();
    const confirmar = () => {
      if (document.visibilityState !== "visible" || atual.current !== id)
        return;
      const ultimo = Math.max(0, ...vistos);
      if (ultimo <= maior) return;
      maior = ultimo;
      clearTimeout(timer);
      timer = setTimeout(() => {
        void comando({ acao: "ler", conversaId: id, mensagemId: ultimo }).catch(
          () => {},
        );
      }, 100);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = Number((entry.target as HTMLElement).dataset.mensagemId);
          if (entry.isIntersecting) vistos.add(n);
          else vistos.delete(n);
        }
        confirmar();
      },
      { root: listaRef.current, threshold: 0.1 },
    );
    listaRef.current
      .querySelectorAll("[data-mensagem-id]")
      .forEach((el) => observer.observe(el));
    document.addEventListener("visibilitychange", confirmar);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", confirmar);
    };
  }, [aberta, id, msgs, carga]);
  useEffect(() => {
    if (aberta && atual.current && atual.current > 0)
      void sincronizar(atual.current);
  }, [aberta]);
  const drenando = useRef(false);
  async function drenar() {
    if (drenando.current || !navigator.onLine) return;
    drenando.current = true;
    try {
      const fila = await listarSaidas(usuarioId);
      for (const item of fila) {
        if (item.falhou || !montado.current) break;
        const escopo = selecao.current;
        try {
          const res = item.arquivo
            ? await enviarArquivo(
                item.conversaId,
                item.arquivo,
                item.clientId,
                item.texto,
              )
            : await comando(
                item.conversaId < 0
                  ? {
                      acao: "interna",
                      viagemId: -item.conversaId,
                      clientId: item.clientId,
                      texto: item.texto,
                    }
                  : { acao: "enviar", ...item },
              );
          const confirmado = confirmarEnvio(
            res,
            item.conversaId,
            !!item.arquivo,
          );
          await apagarSaida(item.ordem!);
          setPendentes((p) => p.filter((m) => m.clientId !== item.clientId));
          if (vigente(escopo) && escopo.conversaId === item.conversaId)
            if (item.conversaId < 0)
              await abrir(confirmado.conversaId, false, undefined, true);
            else await sincronizar(item.conversaId);
        } catch (e) {
          if (
            navigator.onLine &&
            !(e instanceof TypeError) &&
            !(e instanceof ConfirmacaoInvalida)
          ) {
            item.falhou = true;
            await guardarSaida(item);
            setPendentes((p) =>
              p.map((m) => (m.clientId === item.clientId ? item : m)),
            );
          }
          break;
        }
      }
    } catch (e) {
      if (montado.current) setErro(descreverErro(e));
    } finally {
      drenando.current = false;
    }
  }
  useEffect(() => {
    void listarSaidas(usuarioId)
      .then((s) => {
        if (!montado.current) return;
        setPendentes(s);
        void drenar();
      })
      .catch((e) => {
        if (montado.current) setErro(descreverErro(e));
      });
    const online = () => {
      void drenar();
      if (visivel.current && atual.current && atual.current > 0)
        void sincronizar(atual.current);
    };
    window.addEventListener("online", online);
    const timer = setInterval(() => void drenar(), 5000);
    return () => {
      window.removeEventListener("online", online);
      clearInterval(timer);
    };
  }, [usuarioId]);
  async function enfileirar(item: Saida) {
    const salvo = await guardarSaida(item);
    if (!montado.current) return;
    setPendentes((p) => [
      ...p.filter((m) => m.clientId !== salvo.clientId),
      salvo,
    ]);
    void drenar();
  }
  async function reenviar(item: Saida) {
    const escopo = selecao.current;
    try {
      await enfileirar({ ...item, falhou: false });
    } catch (e) {
      if (vigente(escopo)) setErro(descreverErro(e));
    }
  }
  async function enviar() {
    const s = compositorAtual.current;
    if (s.fase === "enviando" || !s.conversaId || !s.rascunho.texto.trim())
      return;
    const { rascunho, conversaId } = s;
    if (rascunho.tipo !== "editar" && rascunho.texto.startsWith("/bug")) {
      setBug(crypto.randomUUID());
      emitir({ tipo: "cancelar" });
      return;
    }
    if (rascunho.tipo !== "editar" && rascunho.texto.startsWith("/tarefa")) {
      abrirTarefa({ titulo: rascunho.texto.replace(/^\/tarefa\s*/, "") });
      emitir({ tipo: "cancelar" });
      return;
    }
    const tentativa = crypto.randomUUID();
    const escopo = selecao.current;
    emitir({ tipo: "enviar", tentativa });
    try {
      if (rascunho.tipo === "editar") {
        await comando({
          acao: "editar",
          mensagemId: rascunho.mensagemId,
          texto: rascunho.texto,
        });
        if (vigente(escopo)) void sincronizar(conversaId);
      } else
        await enfileirar({
          clientId: tentativa,
          conversaId,
          usuarioId,
          texto: rascunho.texto,
          citadaId: rascunho.tipo === "citar" ? rascunho.mensagemId : null,
          falhou: false,
        });
      emitir({ tipo: "enviado", tentativa });
    } catch (e) {
      emitir({ tipo: "falhou", tentativa, erro: descreverErro(e) });
    }
  }
  async function arquivo(f: File, conversaId = id) {
    if (!conversaId || conversaId < 0) return;
    const escopo = selecao.current;
    try {
      const pronto = f.type.startsWith("image/") ? await comprimirFoto(f) : f;
      await enfileirar({
        clientId: crypto.randomUUID(),
        usuarioId,
        conversaId,
        texto: f.type.startsWith("image/") ? "📷" : "🎙",
        arquivo: pronto,
        falhou: false,
      });
    } catch (e) {
      if (vigente(escopo)) setErro(descreverErro(e));
    }
  }
  function gravar() {
    const escopo = selecao.current;
    if (!escopo.conversaId || escopo.conversaId < 0 || carga !== "pronta")
      return;
    const sessaoVisivel = () =>
      montado.current &&
      visivel.current &&
      selecao.current.conversaId === escopo.conversaId;
    void gravador.iniciar(
      escopo.conversaId,
      (conversaId, f) => {
        if (sessaoVisivel()) void arquivo(f, conversaId);
      },
      (fase) => {
        if (montado.current) setGravacao(fase);
      },
      () => {
        if (sessaoVisivel()) setErro("Microfone indisponível");
      },
    );
  }
  function parar() {
    gravador.parar();
  }
  useEffect(() => {
    if (!aberta) cancelarGravacao();
  }, [aberta]);
  const conversa = conversas.find((c) => c.id === id);
  async function agir(d: object) {
    const escopo = selecao.current;
    const chave = JSON.stringify(d);
    if (acoesEnviando.current.has(chave)) return false;
    acoesEnviando.current.add(chave);
    try {
      await comando(d);
      await atualizar();
      if (vigente(escopo) && escopo.conversaId && escopo.conversaId > 0)
        await sincronizar(escopo.conversaId);
      return true;
    } catch (e) {
      if (vigente(escopo)) setErro(descreverErro(e));
      return false;
    } finally {
      acoesEnviando.current.delete(chave);
    }
  }
  if (!aberta) return null;
  return (
    <aside
      hidden={!aberta}
      className="comunicador"
      aria-label={t("Comunicador")}
    >
      <header>
        <h2>{t("Comunicador")}</h2>
        <button onClick={fechar}>{t("Fechar")}</button>
      </header>
      <details>
        <summary>{t("Não perturbe")}</summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void agir({
              acao: "preferencias",
              dndInicio: f.get("inicio"),
              dndFim: f.get("fim"),
              fuso: f.get("fuso"),
            });
          }}
        >
          <label>
            {t("Início")}
            <input
              name="inicio"
              type="time"
              defaultValue={preferencia.dnd_inicio}
            />
          </label>
          <label>
            {t("Fim")}
            <input name="fim" type="time" defaultValue={preferencia.dnd_fim} />
          </label>
          <label>
            {t("Fuso horário")}
            <input name="fuso" defaultValue={preferencia.fuso} />
          </label>
          <button>{t("Salvar")}</button>
        </form>
      </details>
      <label>
        {t("Conversa direta")}
        <select value={outro} onChange={(e) => setOutro(e.target.value)}>
          <option value="">{t("Escolher usuário")}</option>
          {pessoas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </label>
      <button
        disabled={!outro}
        onClick={async () => {
          if (acoesEnviando.current.has("direta")) return;
          acoesEnviando.current.add("direta");
          const escopo = selecao.current;
          try {
            const c = await comando({
              acao: "direta",
              usuarioId: Number(outro),
            });
            await atualizar();
            if (vigente(escopo)) await abrir(c.id);
          } catch (e) {
            if (vigente(escopo)) setErro(descreverErro(e));
          } finally {
            acoesEnviando.current.delete("direta");
          }
        }}
      >
        {t("Iniciar conversa")}
      </button>
      {perfil.papel !== "guiamento" && (
        <details>
          <summary>{t("Novo grupo")}</summary>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void agir({
                acao: "grupo",
                nome: f.get("nome"),
                descricao: f.get("descricao"),
                privada: f.has("privada"),
              });
            }}
          >
            <label>
              {t("Nome")}
              <input name="nome" required />
            </label>
            <label>
              {t("Descrição")}
              <input name="descricao" />
            </label>
            <label>
              <input type="checkbox" name="privada" defaultChecked />
              {t("Privado")}
            </label>
            <button>{t("Criar grupo")}</button>
          </form>
          <h3>{t("Grupos públicos")}</h3>
          {grupos.map((g) => (
            <button
              key={g.id}
              onClick={() => agir({ acao: "entrar", conversaId: g.id })}
            >
              {t("Entrar no grupo")} · {g.nome}
            </button>
          ))}
        </details>
      )}
      <label>
        <input
          type="checkbox"
          checked={arquivadas}
          onChange={(e) => setArquivadas(e.target.checked)}
        />
        {t("Mostrar arquivadas")}
      </label>
      <nav>
        {conversas
          .filter((c) => arquivadas || !c.arquivada)
          .map((c) => (
            <button
              key={c.id}
              onClick={() => abrir(c.id, true)}
              aria-pressed={id === c.id}
            >
              {c.nome}{" "}
              {c.nao_lidas > 0 && (
                <b aria-label={t("Não lidas")}>{c.nao_lidas}</b>
              )}
            </button>
          ))}
      </nav>
      <details>
        <summary>{t("Buscar mensagens")}</summary>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget),
              q = new URLSearchParams();
            for (const [k, v] of f) q.set(k, String(v));
            setResultados([]);
            await consultar<(typeof resultados)[number]>(
              "busca",
              "/comunicador/api?" + q,
              (d) => setResultados(d.resultados),
              false,
            );
          }}
        >
          <input name="busca" aria-label={t("Buscar mensagens")} required />
          <select name="autor" aria-label={t("Autor")}>
            <option value="">{t("Autor")}</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
          <select name="filtroConversa" aria-label={t("Todas as conversas")}>
            <option value="">{t("Todas as conversas")}</option>
            {conversas.map((c) => (
              <option value={c.id} key={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <label>
            {t("Data")}
            <input type="date" name="data" />
          </label>
          <button>{t("Buscar mensagens")}</button>
        </form>
        {resultados.map((r) => (
          <button
            key={r.id}
            onClick={async () => {
              await abrir(r.conversa_id, false, r.id);
            }}
          >
            {r.autor}: {r.texto}
          </button>
        ))}
      </details>
      <p role="alert">{erroTraduzido(idioma, erro)}</p>
      {bug && id && (
        <Reporte
          cancelar={() => setBug(null)}
          key={bug}
          enviar={async (texto, arquivo, clientId) => {
            const escopo = selecao.current;
            let conversaId = id;
            if (id < 0)
              conversaId = (
                await comando({
                  acao: "interna",
                  viagemId: -id,
                  texto: "/bug",
                  clientId: `${clientId}-interna`,
                })
              ).conversaId;
            await enfileirar({
              clientId,
              usuarioId,
              conversaId,
              texto,
              arquivo,
              falhou: false,
            });
            if (vigente(escopo))
              setBug((atual) => (atual === bug ? null : atual));
          }}
        />
      )}
      {foto && (
        <div className="midia-ampliada" role="dialog" aria-label={t("Foto")}>
          <button onClick={() => setFoto(null)}>{t("Fechar")}</button>
          <label>
            {t("Zoom")}
            <input
              type="range"
              min="1"
              max="4"
              step=".1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
          <div style={{ overflow: "auto" }}>
            <img
              alt={t("Foto")}
              src={foto}
              style={{ width: `${zoom * 100}%`, maxWidth: "none" }}
            />
          </div>
        </div>
      )}
      {mover && (
        <div>
          <label>
            {t("Buscar Viajante")}
            <input
              onChange={(e) => {
                setViajantes([]);
                void consultar<(typeof viajantes)[number]>(
                  "viajantes",
                  `/comunicador/api?viajantes=${encodeURIComponent(e.target.value)}`,
                  (d) => setViajantes(d.resultados),
                );
              }}
            />
          </label>
          {viajantes.map((v) => (
            <button
              key={v.id}
              onClick={async () => {
                const escopo = selecao.current;
                const operacao = mover;
                if (
                  await agir({
                    acao: "mover",
                    midiaId: mover,
                    viajanteId: v.id,
                  })
                ) {
                  if (vigente(escopo))
                    setMover((atual) => (atual === operacao ? null : atual));
                }
              }}
            >
              {v.nome} · {v.codigo}
            </button>
          ))}
          <button
            onClick={() => {
              leituras.current.get("viajantes")?.controle.abort();
              consultas.current.viajantes =
                (consultas.current.viajantes ?? 0) + 1;
              setMover(null);
            }}
          >
            {t("Cancelar")}
          </button>
        </div>
      )}
      {id !== null && id < 0 && <h3>{t("Conversa interna")}</h3>}
      {tarefa && (
        <form
          key={tarefa.clientId}
          aria-label={t("Nova tarefa")}
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              tarefa.fase === "salvando" ||
              tarefasEnviando.current.has(tarefa.clientId)
            )
              return;
            const f = new FormData(e.currentTarget);
            const tentativa = tarefa;
            const escopo = selecao.current;
            tarefasEnviando.current.add(tentativa.clientId);
            setTarefa({ ...tentativa, fase: "salvando", erro: undefined });
            try {
              let conversaId = tentativa.conversaId;
              if (conversaId < 0)
                conversaId = (
                  await comando({
                    acao: "interna",
                    viagemId: -conversaId,
                    texto: "/tarefa " + tentativa.titulo,
                    clientId: `${tentativa.clientId}-interna`,
                  })
                ).conversaId;
              await comando({
                acao: "tarefa",
                clientId: tentativa.clientId,
                viagemId: Number(f.get("viagemId")) || undefined,
                conversaId,
                mensagemId: tentativa.mensagemId,
                titulo: f.get("titulo"),
                responsavelId: Number(f.get("responsavel")),
                prazo: f.get("prazo"),
                copias: f.getAll("copias").map(Number),
              });
              if (
                vigente(escopo) &&
                tarefaAtual.current === tentativa.clientId
              ) {
                tarefaAtual.current = null;
                setTarefa((atual) =>
                  atual?.clientId === tentativa.clientId ? null : atual,
                );
                if (tentativa.conversaId < 0)
                  await abrir(conversaId, false, undefined, true);
                else await sincronizar(conversaId);
              }
            } catch (e) {
              if (vigente(escopo))
                setTarefa((atual) =>
                  atual?.clientId === tentativa.clientId
                    ? { ...atual, fase: "editando", erro: descreverErro(e) }
                    : atual,
                );
            } finally {
              tarefasEnviando.current.delete(tentativa.clientId);
            }
          }}
        >
          <fieldset disabled={tarefa.fase === "salvando"}>
            <label>
              {t("Título")}
              <input name="titulo" defaultValue={tarefa.titulo} required />
            </label>
            <label>
              {t("Responsável")}
              <select name="responsavel" defaultValue={perfil.usuario}>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </label>
            {perfil.papel !== "guiamento" && !conversa?.viagem_id && (
              <label>
                {idioma === "ko" ? "여행 (선택 사항)" : "Viagem (opcional)"}
                <input
                  aria-label={idioma === "ko" ? "여행 검색" : "Buscar viagem"}
                  onChange={async (e) => {
                    setReferenciasTarefa([]);
                    await consultar<(typeof referenciasTarefa)[number]>(
                      "viagensTarefa",
                      `/comunicador/api?referencias=${encodeURIComponent(e.target.value)}`,
                      (d) => setReferenciasTarefa(d.resultados),
                    );
                  }}
                />
                <select
                  name="viagemId"
                  aria-label={idioma === "ko" ? "여행" : "Viagem"}
                >
                  <option value="">—</option>
                  {referenciasTarefa
                    .filter((r) => r.referencia.startsWith("V"))
                    .map((r) => (
                      <option key={r.referencia} value={r.viagemId}>
                        {r.referencia} · {r.titulo}
                      </option>
                    ))}
                </select>
              </label>
            )}
            <label>
              {t("Prazo")}
              <input type="datetime-local" name="prazo" required />
            </label>
            <label>
              {t("Cópias")}
              <select multiple name="copias">
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </label>
            <button>{t("Salvar")}</button>
          </fieldset>
          {tarefa.erro && (
            <p role="alert">{erroTraduzido(idioma, tarefa.erro)}</p>
          )}
          <button
            type="button"
            onClick={() => {
              tarefaAtual.current = null;
              leituras.current.get("viagensTarefa")?.controle.abort();
              consultas.current.viagensTarefa =
                (consultas.current.viagensTarefa ?? 0) + 1;
              setTarefa(null);
            }}
          >
            {t("Cancelar")}
          </button>
        </form>
      )}
      {conversa?.tipo === "grupo" && (
        <label>
          {t("Notificações do grupo")}
          <select
            onChange={(e) =>
              agir({ acao: "modo", conversaId: id, modo: e.target.value })
            }
            key={id}
            defaultValue={conversa.notificacao ?? "mencoes"}
          >
            <option value="todas">{t("Todas")}</option>
            <option value="mencoes">{t("Somente menções")}</option>
            <option value="mudo">{t("Silenciar")}</option>
          </select>
        </label>
      )}
      {conversa?.tipo === "grupo" && (
        <details key={id}>
          <summary>{t("Gerenciar grupo")}</summary>
          <button onClick={() => agir({ acao: "sair", conversaId: id })}>
            {t("Sair do grupo")}
          </button>
          {(perfil.papel === "admin" ||
            conversa.criador_id === perfil.usuario) && (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  void agir({
                    acao: "grupo-editar",
                    conversaId: id,
                    nome: f.get("nome"),
                    descricao: f.get("descricao"),
                    privada: f.has("privada"),
                    arquivada: f.has("arquivada"),
                  });
                }}
              >
                <label>
                  {t("Nome")}
                  <input name="nome" defaultValue={conversa.nome} required />
                </label>
                <label>
                  {t("Descrição")}
                  <input name="descricao" defaultValue={conversa.descricao} />
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="privada"
                    defaultChecked={conversa.privada}
                  />
                  {t("Privado")}
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="arquivada"
                    defaultChecked={conversa.arquivada}
                  />
                  {t("Arquivada")}
                </label>
                <button>{t("Salvar")}</button>
              </form>
              <select
                aria-label={t("Convidar")}
                value={outro}
                onChange={(e) => setOutro(e.target.value)}
              >
                <option value="">{t("Escolher usuário")}</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  agir({
                    acao: "convidar",
                    conversaId: id,
                    usuarioId: Number(outro),
                  })
                }
              >
                {t("Convidar")}
              </button>
              <button
                onClick={() =>
                  agir({
                    acao: "remover",
                    conversaId: id,
                    usuarioId: Number(outro),
                  })
                }
              >
                {t("Remover membro")}
              </button>
            </>
          )}
        </details>
      )}
      {carga === "carregando" && <p role="status">{t("Carregando…")}</p>}
      {carga === "falhou" && id && (
        <button onClick={() => abrir(id, true)}>{t("Tentar novamente")}</button>
      )}
      {id && (
        <>
          <button
            onClick={async () => {
              if (!msgs[0]) return;
              await carregarPagina("antes", msgs[0].id);
            }}
          >
            {t("Mensagens anteriores")}
          </button>
          <button
            onClick={async () => {
              if (!id || !msgs.length) return;
              await carregarPagina("depois", msgs.at(-1)!.id);
            }}
          >
            {t("Mensagens seguintes")}
          </button>
          <button
            onClick={async () => {
              const escopo = selecao.current;
              if (
                msgs.length &&
                (await agir({
                  acao: "nao-lida",
                  conversaId: id,
                  mensagemId: msgs.at(-1)!.id,
                }))
              ) {
                if (vigente(escopo)) selecionar(null);
              }
            }}
          >
            {t("Marcar como não lida")}
          </button>
          <div
            ref={listaRef}
            className="mensagens"
            aria-live="polite"
            onScroll={async (e) => {
              if (e.currentTarget.scrollTop !== 0 || !id || !msgs[0]) return;
              const el = e.currentTarget,
                altura = el.scrollHeight;
              const escopo = selecao.current;
              if (await carregarPagina("antes", msgs[0].id))
                requestAnimationFrame(() => {
                  if (vigente(escopo)) el.scrollTop += el.scrollHeight - altura;
                });
            }}
          >
            {msgs.map((m) => (
              <article
                data-mensagem-id={m.id}
                id={`mensagem-${m.id}`}
                key={m.id}
              >
                {m.sistema && <small>{t("Atividade da tarefa")}</small>}
                <strong>
                  {m.autor} {!m.ativo && t("Inativo")}
                </strong>
                {m.citada_id && (
                  <a
                    href={`#mensagem-${m.citada_id}`}
                    onClick={async () => {
                      if (!msgs.some((x) => x.id === m.citada_id)) {
                        await carregarPagina(
                          "antes",
                          m.citada_id! + 1,
                          m.citada_id!,
                        );
                      }
                    }}
                  >
                    {t("Citar")} #{m.citada_id} ·{" "}
                    {msgs.find((x) => x.id === m.citada_id)?.texto}
                  </a>
                )}
                {m.apagada && <em>{t("Apagada")}</em>}
                <p>
                  {m.sistema && (
                    <>
                      {atividadeTarefa(idioma, m.atividade_tipo)}
                      {m.atividade_motivo ? ` · ${m.atividade_motivo}` : ""}
                    </>
                  )}
                  {m.segmentos.map((s, i) =>
                    s.tipo === "usuario" ||
                    s.tipo === "todos" ||
                    s.tipo === "aqui" ? (
                      <mark key={i}>
                        {s.texto}
                        {s.tipo === "usuario" && s.id === usuarioId
                          ? idioma === "ko"
                            ? " (나)"
                            : " (você)"
                          : ""}
                      </mark>
                    ) : s.tipo === "grupo" ? (
                      <button key={i} onClick={() => abrir(s.id!)}>
                        {s.texto}
                      </button>
                    ) : s.tipo === "link" ? (
                      <a
                        key={i}
                        href={s.texto}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.texto}
                      </a>
                    ) : (
                      <span key={i}>{s.texto}</span>
                    ),
                  )}
                </p>
                {m.urgente && <strong>{t("Urgente")}</strong>}
                {cartoes
                  .filter(
                    (c) =>
                      m.texto.includes(c.referencia) ||
                      m.texto.includes(location.origin + c.referencia),
                  )
                  .map((c) => (
                    <div className="cartao" key={c.referencia}>
                      {c.url ? (
                        <a href={c.url}>{c.titulo}</a>
                      ) : (
                        t("Acesso restrito")
                      )}{" "}
                      {c.estado &&
                        mensagem(
                          (
                            { ...rotuloEtapa, aberta: "Aberta" } as Record<
                              string,
                              string
                            >
                          )[c.estado] ?? c.estado,
                        )}{" "}
                      {c.responsavel} {c.prazo}{" "}
                      {c.preco !== undefined &&
                        `USD ${(c.preco / 100).toFixed(2)}`}
                      {c.tarefaId && c.manual && c.estado === "aberta" && (
                        <button
                          onClick={() =>
                            agir({
                              acao: "concluir-tarefa",
                              tarefaId: c.tarefaId,
                              conversaId: id,
                            })
                          }
                        >
                          {t("Concluir")}
                        </button>
                      )}
                    </div>
                  ))}
                {m.midia &&
                  (m.midia.removida ? (
                    <em>{t("Arquivo removido")}</em>
                  ) : m.midia.movida ? (
                    <em>{t("Movido para o Viajante")}</em>
                  ) : (
                    <div>
                      {m.midia.mime.startsWith("image/") ? (
                        <button
                          onClick={() => {
                            setFoto(`/comunicador/midia/${m.midia!.id}`);
                            setZoom(1);
                          }}
                        >
                          <img
                            alt={t("Foto")}
                            loading="lazy"
                            src={`/comunicador/midia/${m.midia.id}`}
                            style={{ maxWidth: "100%", maxHeight: 240 }}
                          />
                        </button>
                      ) : (
                        <audio
                          controls
                          preload="metadata"
                          src={`/comunicador/midia/${m.midia.id}`}
                        />
                      )}
                      <p>{m.transcricao}</p>
                      {perfil.papel === "admin" && (
                        <button
                          onClick={() =>
                            agir({ acao: "purgar", midiaId: m.midia!.id })
                          }
                        >
                          {t("Remover arquivo definitivamente")}
                        </button>
                      )}
                      {perfil.papel !== "guiamento" &&
                        m.midia.mime.startsWith("image/") && (
                          <button
                            onClick={async () => {
                              setMover(m.midia!.id);
                              setViajantes([]);
                              await consultar<(typeof viajantes)[number]>(
                                "viajantes",
                                `/comunicador/api?viajantes=&viagemId=${conversa?.viagem_id ?? ""}`,
                                (d) => setViajantes(d.resultados),
                              );
                            }}
                          >
                            {t("Mover para o Viajante")}
                          </button>
                        )}
                    </div>
                  ))}
                {m.versoes.length > 0 && (
                  <details>
                    <summary>
                      {t("Editada")} · {t("Histórico")}
                    </summary>
                    {m.versoes.map((v, i) => (
                      <p key={i}>
                        {v.texto} <time>{v.em}</time>
                      </p>
                    ))}
                  </details>
                )}
                {m.reacoes?.map((r, i) => (
                  <small key={i}>
                    {r.emoji} {r.nome}{" "}
                  </small>
                ))}
                {!m.sistema && !m.apagada && !conversa?.arquivada && (
                  <div>
                    <button
                      onClick={() =>
                        abrirTarefa({ mensagemId: m.id, titulo: m.texto })
                      }
                    >
                      {t("Transformar em Tarefa")}
                    </button>
                    <button
                      onClick={() =>
                        emitir({ tipo: "citar", mensagemId: m.id })
                      }
                    >
                      {t("Citar")}
                    </button>
                    <button
                      aria-label={t("Reagir")}
                      onClick={() =>
                        agir({ acao: "reagir", mensagemId: m.id, emoji: "👍" })
                      }
                    >
                      👍
                    </button>
                    {m.autor_id === perfil.usuario && (
                      <button
                        onClick={() => {
                          emitir({
                            tipo: "editar",
                            mensagemId: m.id,
                            texto: m.texto,
                          });
                        }}
                      >
                        {t("Editar")}
                      </button>
                    )}
                    {(m.autor_id === perfil.usuario ||
                      perfil.papel === "admin") && (
                      <button
                        onClick={() =>
                          agir({ acao: "apagar", mensagemId: m.id })
                        }
                      >
                        {t("Apagar")}
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
            {pendentes
              .filter(
                (p) =>
                  p.conversaId === id &&
                  !msgs.some((m) => m.client_id === p.clientId),
              )
              .map((p) => (
                <article key={p.clientId}>
                  <p>{p.texto}</p>
                  {p.falhou ? (
                    <button onClick={() => reenviar(p)}>
                      {t("Falhou. Tentar novamente")}
                    </button>
                  ) : (
                    <small>{t("Pendente")}</small>
                  )}
                </article>
              ))}
          </div>
          {id > 0 && !conversa?.arquivada && (
            <div>
              <label>
                {t("Foto")}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) void arquivo(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              <label>
                {t("Câmera")}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    if (e.target.files?.[0]) void arquivo(e.target.files[0]);
                  }}
                />
              </label>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  void gravar();
                }}
                onPointerUp={parar}
                onPointerCancel={parar}
                onKeyDown={(e) => {
                  if (e.key === " " && !e.repeat) void gravar();
                }}
                onKeyUp={(e) => {
                  if (e.key === " ") parar();
                }}
              >
                {t(gravacao === "gravando" ? "Gravando" : "Segure para gravar")}
              </button>
            </div>
          )}
          <small>
            {t("Visto por")}:{" "}
            {leitores
              .filter((l) => l.lida_ate >= (msgs.at(-1)?.id ?? Infinity))
              .map((l) => l.nome)
              .join(", ")}
          </small>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void enviar();
            }}
          >
            {(citada || edicao) && (
              <button
                type="button"
                onClick={() => {
                  emitir({ tipo: "cancelar" });
                }}
              >
                {t("Cancelar")} #{citada || edicao}
              </button>
            )}
            <label>
              {t("Mensagem")}
              <textarea
                aria-label={t("Mensagem")}
                disabled={composicao.fase === "enviando"}
                value={texto}
                onChange={(e) => {
                  const v = e.target.value;
                  setTexto(v);
                  setReferencias([]);
                  if (v.includes("[["))
                    void consultar<(typeof referencias)[number]>(
                      "referencias",
                      "/comunicador/api?referencias=" +
                        encodeURIComponent(v.split("[[").at(-1)!),
                      (d) => setReferencias(d.resultados),
                    );
                  else leituras.current.get("referencias")?.controle.abort();
                  consultas.current.referencias =
                    (consultas.current.referencias ?? 0) + 1;
                }}
              />
            </label>
            {texto.includes("[[") &&
              referencias.map((r) => (
                <button
                  type="button"
                  key={r.referencia}
                  onClick={() => {
                    setTexto(texto.replace(/\[\[.*$/, r.referencia + " "));
                    setReferencias([]);
                    leituras.current.get("referencias")?.controle.abort();
                    consultas.current.referencias =
                      (consultas.current.referencias ?? 0) + 1;
                  }}
                >
                  {r.titulo}
                </button>
              ))}
            {composicao.fase === "falhou" && (
              <p role="alert">{erroTraduzido(idioma, composicao.erro)}</p>
            )}
            <button disabled={composicao.fase === "enviando"}>
              {t("Enviar")}
            </button>
            <small>
              {t(
                "Atalhos: @ pessoa · @todos · @aqui · # grupo · [[ referência · /tarefa · /urgente · /bug",
              )}
            </small>
            {/@[^@]*$/.test(texto) &&
              pessoas
                .filter((p) =>
                  p.nome
                    .toLowerCase()
                    .startsWith(texto.split("@").at(-1)!.toLowerCase()),
                )
                .map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() =>
                      setTexto(texto.replace(/@[^@]*$/, "@" + p.nome + " "))
                    }
                  >
                    {p.nome}
                  </button>
                ))}
            {/#.*$/.test(texto) &&
              conversas
                .filter((c) => c.tipo === "grupo")
                .map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() =>
                      setTexto(texto.replace(/#.*$/, "#" + c.nome + " "))
                    }
                  >
                    {c.nome}
                  </button>
                ))}
          </form>
        </>
      )}
    </aside>
  );
}
