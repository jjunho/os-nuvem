import { rotuloEtapa } from "~/modules/viagens/rotulos";
import { Reporte } from "./Reporte";
import {
  guardarSaida,
  listarSaidas,
  apagarSaida,
  leituraOffline,
  type Saida,
} from "./offline.client";
import { comprimirFoto, enviarArquivo } from "./midia.client";
import type { Cartao } from "./cartao";
import { segmentar } from "./leitura";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useIdioma } from "~/modules/idiomas/idioma";
import { textos, erroTraduzido, atividadeTarefa } from "./textos";
import type { Conversa, Mensagem, Pessoa } from "./comunicador.server";
export async function comando(d: object) {
  const r = await fetch("/comunicador/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
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
    [msgs, setMsgs] = useState<Mensagem[]>([]),
    [texto, setTexto] = useState("");
  const [bug, setBug] = useState(false);
  const [foto, setFoto] = useState<string | null>(null),
    [zoom, setZoom] = useState(1),
    [gravando, setGravando] = useState(false),
    [mover, setMover] = useState<string | null>(null),
    [viajantes, setViajantes] = useState<
      { id: number; nome: string; codigo: string }[]
    >([]);
  const gravador = useRef<MediaRecorder | null>(null);
  const pressionado = useRef(false);
  const [cartoes, setCartoes] = useState<Cartao[]>([]),
    [referencias, setReferencias] = useState<
      { referencia: string; titulo: string; viagemId?: number }[]
    >([]);
  const [tarefa, setTarefa] = useState<{
    mensagemId?: number;
    titulo: string;
  } | null>(null);
  const [leitores, setLeitores] = useState<
    { nome: string; lida_ate: number }[]
  >([]);
  const [resultados, setResultados] = useState<
    { id: number; conversa_id: number; texto: string; autor: string }[]
  >([]);
  const [perfil, setPerfil] = useState({ usuario: 0, papel: "" });
  const [grupos, setGrupos] = useState<Conversa[]>([]),
    [arquivadas, setArquivadas] = useState(false),
    [citada, setCitada] = useState<number | null>(null),
    [edicao, setEdicao] = useState<number | null>(null);
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
  const tarefaClientId = useRef(crypto.randomUUID());
  function pagina(
    d: {
      mensagens: Mensagem[];
      cartoes?: Cartao[];
      leitores?: { nome: string; lida_ate: number }[];
    },
    substituir = false,
  ) {
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
  const sincronizando = useRef(false);
  const sincronizarNovamente = useRef(false);
  async function sincronizar(n: number) {
    if (sincronizando.current) {
      sincronizarNovamente.current = true;
      return;
    }
    sincronizando.current = true;
    try {
      do {
        sincronizarNovamente.current = false;
        let cursor = mensagensRef.current[0]?.id;
        cursor = cursor ? cursor - 1 : 0;
        while (atual.current === n) {
          const r = await fetch(
            `/comunicador/api?conversa=${n}&depois=${cursor}`,
          );
          if (!r.ok) {
            if (r.status === 403) {
              setMsgs([]);
              setCartoes([]);
            }
            break;
          }
          const d = await r.json();
          if (atual.current !== n) break;
          pagina(d);
          if (d.mensagens.length < 50) break;
          cursor = d.mensagens.at(-1).id;
        }
      } while (sincronizarNovamente.current && atual.current === n);
    } catch {
      // A próxima reconexão retoma a partir das mensagens já carregadas.
    } finally {
      sincronizando.current = false;
    }
  }
  async function atualizar() {
    try {
      const d = await leituraOffline(usuarioId, "/comunicador/api");
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
  async function abrir(n: number, inicial = false) {
    setId(n);
    atual.current = n;
    localStorage.setItem(`comunicador-conversa:${usuarioId}`, String(n));
    try {
      const d = await leituraOffline(
        usuarioId,
        `/comunicador/api?conversa=${n}${inicial ? "&inicial=1" : ""}`,
      );
      if (atual.current === n) {
        pagina(d, true);
      }
    } catch (e) {
      setMsgs([]);
      setErro(String(e));
    }
  }
  useEffect(() => {
    const q = new URLSearchParams(rota.search);
    const vi = Number(q.get("interna")),
      c = Number(q.get("conversa")),
      m = Number(q.get("mensagem"));
    if (m)
      void fetch(`/comunicador/api?mensagem=${m}`)
        .then((r) => r.json())
        .then(async (d) => {
          await abrir(d.conversaId);
          const r = await leituraOffline(
            usuarioId,
            `/comunicador/api?conversa=${d.conversaId}&antes=${m + 1}`,
          );
          pagina(r, true);
          requestAnimationFrame(() =>
            document.getElementById(`mensagem-${m}`)?.scrollIntoView(),
          );
        });
    else if (c) void abrir(c, true);
    else if (vi)
      void fetch("/comunicador/api")
        .then((r) => r.json())
        .then((d) => {
          const c = d.conversas.find(
            (x: Conversa) => x.tipo === "interna" && x.viagem_id === vi,
          );
          if (c) void abrir(c.id);
          else {
            setId(-vi);
            atual.current = -vi;
          }
        });
    else {
      const salvo = Number(
        localStorage.getItem(`comunicador-conversa:${usuarioId}`),
      );
      if (salvo > 0) void abrir(salvo, true);
    }
  }, [rota.search]);
  useEffect(() => {
    aba.current = crypto.randomUUID();
    void atualizar();
    const es = new EventSource("/comunicador/eventos");
    es.onmessage = (e) => {
      void atualizar();
      if (atual.current && atual.current > 0 && visivel.current) {
        const evento = JSON.parse(e.data);
        if (evento.id && evento.id !== atual.current) return;
        if (evento.tipo === "leitura")
          void leituraOffline(
            usuarioId,
            `/comunicador/api?conversa=${atual.current}`,
          )
            .then((d) => setLeitores(d.leitores))
            .catch(() => {});
        else void sincronizar(atual.current);
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
    if (!aberta || !id || id < 0 || !listaRef.current) return;
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
  }, [aberta, id, msgs]);
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
        if (item.falhou) break;
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
          await apagarSaida(item.ordem!);
          setPendentes((p) => p.filter((m) => m.clientId !== item.clientId));
          if (atual.current === item.conversaId)
            if (item.conversaId < 0) await abrir(res.conversaId);
            else await sincronizar(item.conversaId);
        } catch (e) {
          if (navigator.onLine && !(e instanceof TypeError)) {
            item.falhou = true;
            await guardarSaida(item);
            setPendentes((p) =>
              p.map((m) => (m.clientId === item.clientId ? item : m)),
            );
          }
          break;
        }
      }
    } finally {
      drenando.current = false;
    }
  }
  useEffect(() => {
    void listarSaidas(usuarioId).then((s) => {
      setPendentes(s);
      void drenar();
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
    try {
      const salvo = await guardarSaida(item);
      setPendentes((p) => [
        ...p.filter((m) => m.clientId !== salvo.clientId),
        salvo,
      ]);
      void drenar();
    } catch (e) {
      setPendentes((p) => [
        ...p.filter((m) => m.clientId !== item.clientId),
        { ...item, falhou: true },
      ]);
      setErro(String(e));
    }
  }
  async function enviar(clientId: string = crypto.randomUUID(), valor = texto) {
    if (!id || !valor.trim()) return;
    if (valor.startsWith("/bug")) {
      setBug(true);
      return;
    }
    if (valor.startsWith("/tarefa")) {
      setTarefa({ titulo: valor.replace(/^\/tarefa\s*/, "") });
      return;
    }
    const anterior = pendentes.find((p) => p.clientId === clientId);
    setTexto("");
    setErro("");
    await enfileirar({
      ...anterior,
      clientId,
      conversaId: id,
      usuarioId,
      texto: valor,
      citadaId: citada,
      falhou: false,
    });
    setCitada(null);
  }
  async function arquivo(f: File) {
    if (!id || id < 0) return;
    try {
      const pronto = f.type.startsWith("image/") ? await comprimirFoto(f) : f;
      await enfileirar({
        clientId: crypto.randomUUID(),
        usuarioId,
        conversaId: id,
        texto: f.type.startsWith("image/") ? "📷" : "🎙",
        arquivo: pronto,
        falhou: false,
      });
    } catch (e) {
      setErro(String(e));
    }
  }
  async function gravar() {
    pressionado.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!pressionado.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const tipo = ["audio/webm", "audio/mp4", "audio/ogg"].find((m) =>
        MediaRecorder.isTypeSupported(m),
      );
      const r = new MediaRecorder(
        stream,
        tipo ? { mimeType: tipo } : undefined,
      );
      gravador.current = r;
      const partes: Blob[] = [];
      r.ondataavailable = (e) => {
        if (e.data.size) partes.push(e.data);
      };
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setGravando(false);
        void arquivo(new File(partes, "voz", { type: r.mimeType }));
      };
      r.start();
      setGravando(true);
    } catch {
      setErro(t("Microfone indisponível"));
    }
  }
  function parar() {
    pressionado.current = false;
    if (gravador.current?.state === "recording") gravador.current.stop();
  }
  const conversa = conversas.find((c) => c.id === id);
  async function agir(d: object) {
    try {
      await comando(d);
      await atualizar();
      if (id) await abrir(id);
    } catch (e) {
      setErro(String(e));
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
          try {
            const c = await comando({
              acao: "direta",
              usuarioId: Number(outro),
            });
            await atualizar();
            await abrir(c.id);
          } catch (e) {
            setErro(String(e));
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
            const r = await fetch("/comunicador/api?" + q);
            if (r.ok) setResultados((await r.json()).resultados);
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
              await abrir(r.conversa_id);
              const x = await fetch(
                `/comunicador/api?conversa=${r.conversa_id}&antes=${r.id + 1}`,
              );
              pagina(await x.json(), true);
              requestAnimationFrame(() =>
                document.getElementById(`mensagem-${r.id}`)?.scrollIntoView(),
              );
            }}
          >
            {r.autor}: {r.texto}
          </button>
        ))}
      </details>
      <p role="alert">{erroTraduzido(idioma, erro)}</p>
      {bug && id && (
        <Reporte
          cancelar={() => setBug(false)}
          enviar={async (texto, arquivo) => {
            try {
              let conversaId = id;
              if (id < 0)
                conversaId = (
                  await comando({
                    acao: "interna",
                    viagemId: -id,
                    texto: "/bug",
                    clientId: crypto.randomUUID(),
                  })
                ).conversaId;
              await enfileirar({
                clientId: crypto.randomUUID(),
                usuarioId,
                conversaId,
                texto,
                arquivo,
                falhou: false,
              });
              setBug(false);
              setTexto("");
            } catch (e) {
              setErro(String(e));
            }
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
              onChange={(e) =>
                void fetch(
                  `/comunicador/api?viajantes=${encodeURIComponent(e.target.value)}`,
                )
                  .then((r) => r.json())
                  .then((d) => setViajantes(d.resultados))
              }
            />
          </label>
          {viajantes.map((v) => (
            <button
              key={v.id}
              onClick={async () => {
                await agir({ acao: "mover", midiaId: mover, viajanteId: v.id });
                setMover(null);
              }}
            >
              {v.nome} · {v.codigo}
            </button>
          ))}
          <button onClick={() => setMover(null)}>{t("Cancelar")}</button>
        </div>
      )}
      {id !== null && id < 0 && <h3>{t("Conversa interna")}</h3>}
      {tarefa && (
        <form
          aria-label={t("Nova tarefa")}
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              let conversaId = id;
              if (id && id < 0)
                conversaId = (
                  await comando({
                    acao: "interna",
                    viagemId: -id,
                    texto: "/tarefa " + tarefa.titulo,
                    clientId: crypto.randomUUID(),
                  })
                ).conversaId;
              await comando({
                acao: "tarefa",
                clientId: tarefaClientId.current,
                viagemId: Number(f.get("viagemId")) || undefined,
                conversaId,
                mensagemId: tarefa.mensagemId,
                titulo: f.get("titulo"),
                responsavelId: Number(f.get("responsavel")),
                prazo: f.get("prazo"),
                copias: f.getAll("copias").map(Number),
              });
              tarefaClientId.current = crypto.randomUUID();
              setTarefa(null);
              setTexto("");
              if (conversaId) await abrir(conversaId);
            } catch (e) {
              setErro(String(e));
            }
          }}
        >
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
                  const r = await fetch(
                    `/comunicador/api?referencias=${encodeURIComponent(e.target.value)}`,
                  );
                  setReferencias((await r.json()).resultados);
                }}
              />
              <select
                name="viagemId"
                aria-label={idioma === "ko" ? "여행" : "Viagem"}
              >
                <option value="">—</option>
                {referencias
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
          <button type="button" onClick={() => setTarefa(null)}>
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
      {id && (
        <>
          <button
            onClick={async () => {
              if (!msgs[0]) return;
              const r = await fetch(
                `/comunicador/api?conversa=${id}&antes=${msgs[0].id}`,
              );
              const d = await r.json();
              pagina(d);
            }}
          >
            {t("Mensagens anteriores")}
          </button>
          <button
            onClick={async () => {
              if (!id || !msgs.length) return;
              const r = await leituraOffline(
                usuarioId,
                `/comunicador/api?conversa=${id}&depois=${msgs.at(-1)!.id}`,
              );
              pagina(r);
            }}
          >
            {t("Mensagens seguintes")}
          </button>
          <button
            onClick={async () => {
              if (msgs.length)
                await comando({
                  acao: "nao-lida",
                  conversaId: id,
                  mensagemId: msgs.at(-1)!.id,
                });
              setId(null);
              atual.current = null;
              await atualizar();
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
              const r = await leituraOffline(
                usuarioId,
                `/comunicador/api?conversa=${id}&antes=${msgs[0].id}`,
              );
              pagina(r);
              requestAnimationFrame(() => {
                el.scrollTop += el.scrollHeight - altura;
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
                        const r = await fetch(
                          `/comunicador/api?conversa=${id}&antes=${m.citada_id! + 1}`,
                        );
                        const d = await r.json();
                        pagina(d);
                        requestAnimationFrame(() =>
                          document
                            .getElementById(`mensagem-${m.citada_id}`)
                            ?.scrollIntoView(),
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
                              const r = await fetch(
                                `/comunicador/api?viajantes=&viagemId=${conversa?.viagem_id ?? ""}`,
                              );
                              setViajantes((await r.json()).resultados);
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
                        setTarefa({ mensagemId: m.id, titulo: m.texto })
                      }
                    >
                      {t("Transformar em Tarefa")}
                    </button>
                    <button onClick={() => setCitada(m.id)}>
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
                          setEdicao(m.id);
                          setTexto(m.texto);
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
                    <button onClick={() => enviar(p.clientId, p.texto)}>
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
                {t(gravando ? "Gravando" : "Segure para gravar")}
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
              if (edicao) {
                void agir({ acao: "editar", mensagemId: edicao, texto });
                setEdicao(null);
                setTexto("");
              } else void enviar();
            }}
          >
            {(citada || edicao) && (
              <button
                type="button"
                onClick={() => {
                  setCitada(null);
                  setEdicao(null);
                  setTexto("");
                }}
              >
                {t("Cancelar")} #{citada || edicao}
              </button>
            )}
            <label>
              {t("Mensagem")}
              <textarea
                value={texto}
                onChange={(e) => {
                  const v = e.target.value;
                  setTexto(v);
                  if (v.includes("[["))
                    void fetch(
                      "/comunicador/api?referencias=" +
                        encodeURIComponent(v.split("[[").at(-1)!),
                    )
                      .then((r) => r.json())
                      .then((d) => setReferencias(d.resultados));
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
                  }}
                >
                  {r.titulo}
                </button>
              ))}
            <button>{t("Enviar")}</button>
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
