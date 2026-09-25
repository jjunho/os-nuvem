import { useEffect, useRef, useState } from "react";
import { useMaquina } from "~/modules/interface/use-maquina";
import { useIdioma } from "~/modules/idiomas/idioma";
import { textos } from "./textos";
import { reporte, type ReporteEstado } from "./estado-ui";

export function Reporte({
  enviar,
  cancelar,
}: {
  enviar: (texto: string, arquivo: File, clientId: string) => Promise<void>;
  cancelar: () => void;
}) {
  const { idioma } = useIdioma(),
    t = textos(idioma);
  const { estado, emitir, atual } = useMaquina(reporte, {
    fase: "capturando",
  });
  const ativo = useRef(true);
  const capturaAtual = useRef<AbortController | null>(null);
  const [pagina] = useState(
    () => sessionStorage.getItem("comunicador-pagina") ?? location.href,
  );
  async function capturar() {
    if (!ativo.current) return;
    capturaAtual.current?.abort();
    const controle = new AbortController();
    capturaAtual.current = controle;
    const vigente = () => ativo.current && !controle.signal.aborted;
    let frame: HTMLIFrameElement | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const { toBlob } = await import("html-to-image");
      if (!vigente()) return;
      let documento = document;
      const anterior = new URL(pagina, location.origin);
      if (
        location.pathname === "/comunicador" &&
        anterior.origin === location.origin &&
        anterior.pathname !== "/comunicador"
      ) {
        frame = document.createElement("iframe");
        frame.setAttribute("aria-hidden", "true");
        frame.style.cssText =
          "position:fixed;left:-10000px;width:1200px;height:900px";
        const pronto = new Promise<void>((resolve, reject) => {
          timeout = setTimeout(
            () => reject(Error("Captura indisponível")),
            10000,
          );
          controle.signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timeout);
              frame?.remove();
              reject(Error("Captura cancelada"));
            },
            { once: true },
          );
          frame!.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        frame.src = anterior.href;
        document.body.appendChild(frame);
        await pronto;
        if (!vigente()) return;
        if (frame.contentDocument) documento = frame.contentDocument;
      }
      const main = documento.querySelector<HTMLElement>("main.pagina");
      if (!main) throw Error("Captura indisponível");
      const blob = await toBlob(main, {
        pixelRatio: 1,
        backgroundColor: "#ffffff",
        skipFonts: true,
      });
      if (!blob) throw Error("Captura indisponível");
      if (vigente()) emitir({ tipo: "capturada", captura: blob });
    } catch {
      if (vigente()) emitir({ tipo: "captura-falhou" });
    } finally {
      clearTimeout(timeout);
      frame?.remove();
    }
  }
  useEffect(() => {
    ativo.current = true;
    void capturar();
    return () => {
      ativo.current = false;
      capturaAtual.current?.abort();
    };
  }, []);
  async function transmitir(
    tentativa: Extract<
      ReporteEstado,
      { fase: "enviando" | "erro-envio" | "enviado" }
    >,
  ) {
    try {
      await enviar(
        tentativa.texto,
        new File([tentativa.captura], "captura.png", { type: "image/png" }),
        tentativa.clientId,
      );
      if (ativo.current)
        emitir({ tipo: "enviado", clientId: tentativa.clientId });
    } catch {
      if (ativo.current)
        emitir({ tipo: "falhou", clientId: tentativa.clientId });
    }
  }
  const bloqueado =
    estado.fase === "enviando" ||
    estado.fase === "erro-envio" ||
    estado.fase === "enviado";
  return (
    <form
      aria-label={t("Reportar problema")}
      onSubmit={(e) => {
        e.preventDefault();
        // A guarda síncrona vale também para dois submits antes do próximo render.
        const estadoAtual = atual();
        if (estadoAtual.fase !== "pronta" || !ativo.current) return;
        const f = new FormData(e.currentTarget);
        const texto = [
          `Página: ${f.get("pagina")}`,
          `Ação: ${f.get("acao")}`,
          `Esperado: ${f.get("esperado")}`,
          `Observado: ${f.get("observado")}`,
          `Reprodução: ${f.get("reproducao")}`,
          `Aparelho/navegador/idioma: ${navigator.userAgent} · ${idioma}`,
        ].join("\n");
        const tentativa = {
          fase: "enviando" as const,
          captura: estadoAtual.captura,
          texto,
          clientId: crypto.randomUUID(),
        };
        emitir({ tipo: "enviar", texto, clientId: tentativa.clientId });
        void transmitir(tentativa);
      }}
    >
      <h3>{t("Reportar problema")}</h3>
      <fieldset disabled={bloqueado}>
        <label>
          {t("Página")}
          <input name="pagina" defaultValue={pagina} required />
        </label>
        {(
          [
            ["acao", "Ação"],
            ["esperado", "Esperado"],
            ["observado", "Observado"],
            ["reproducao", "Reprodução"],
          ] as const
        ).map(([name, label]) => (
          <label key={name}>
            {t(label)}
            <textarea name={name} required />
          </label>
        ))}
        <p>
          {navigator.userAgent} · {idioma}
        </p>
        <button disabled={estado.fase !== "pronta"}>
          {t("Enviar reporte")}
        </button>
      </fieldset>
      <p role={estado.fase.startsWith("erro") ? "alert" : "status"}>
        {t(
          estado.fase === "capturando"
            ? "Capturando página"
            : estado.fase === "erro-captura"
              ? "Não foi possível capturar a página"
              : estado.fase === "erro-envio"
                ? "Não foi possível enviar o reporte"
                : estado.fase === "enviando"
                  ? "Enviando…"
                  : "Captura pronta",
        )}
      </p>
      {estado.fase === "erro-captura" && (
        <button
          type="button"
          onClick={() => {
            if (atual().fase !== "erro-captura") return;
            emitir({ tipo: "capturar" });
          }}
        >
          {t("Tentar novamente")}
        </button>
      )}
      {estado.fase === "erro-envio" && (
        <button
          type="button"
          onClick={() => {
            const tentativa = atual();
            if (tentativa.fase !== "erro-envio" || !ativo.current) return;
            emitir({ tipo: "retentar" });
            void transmitir(tentativa);
          }}
        >
          {t("Tentar novamente")}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          ativo.current = false;
          capturaAtual.current?.abort();
          cancelar();
        }}
      >
        {t("Cancelar")}
      </button>
    </form>
  );
}
