import { useEffect, useState } from "react";
import { useIdioma } from "~/modules/idiomas/idioma";
import { textos } from "./textos";
export function Reporte({
  enviar,
  cancelar,
}: {
  enviar: (texto: string, arquivo: File) => Promise<void>;
  cancelar: () => void;
}) {
  const { idioma } = useIdioma(),
    t = textos(idioma);
  const [captura, setCaptura] = useState<Blob | null>(null),
    [erro, setErro] = useState("");
  const [pagina] = useState(
    () => sessionStorage.getItem("comunicador-pagina") ?? location.href,
  );
  async function capturar() {
    let frame: HTMLIFrameElement | undefined;
    try {
      setErro("");
      const { toBlob } = await import("html-to-image");
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
          const timeout = setTimeout(
            () => reject(Error("Captura indisponível")),
            10000,
          );
          frame!.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        frame.src = anterior.href;
        document.body.appendChild(frame);
        await pronto;
        if (frame.contentDocument) documento = frame.contentDocument;
      }
      const main = documento.querySelector<HTMLElement>("main.pagina");
      if (!main) throw Error(t("Não foi possível capturar a página"));
      const blob = await toBlob(main, {
        pixelRatio: 1,
        backgroundColor: "#ffffff",
        skipFonts: true,
      });
      if (!blob) throw Error(t("Não foi possível capturar a página"));
      setCaptura(blob);
    } catch {
      setErro(t("Não foi possível capturar a página"));
    } finally {
      frame?.remove();
    }
  }
  useEffect(() => {
    void capturar();
  }, []);
  return (
    <form
      aria-label={t("Reportar problema")}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!captura) return;
        const f = new FormData(e.currentTarget);
        const linhas = [
          `Página: ${f.get("pagina")}`,
          `Ação: ${f.get("acao")}`,
          `Esperado: ${f.get("esperado")}`,
          `Observado: ${f.get("observado")}`,
          `Reprodução: ${f.get("reproducao")}`,
          `Aparelho/navegador/idioma: ${navigator.userAgent} · ${idioma}`,
        ];
        await enviar(
          linhas.join("\n"),
          new File([captura], "captura.png", { type: "image/png" }),
        );
      }}
    >
      <h3>{t("Reportar problema")}</h3>
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
      <p role="status">
        {erro || t(captura ? "Captura pronta" : "Capturando página")}
      </p>
      {erro && (
        <button type="button" onClick={capturar}>
          {t("Tentar novamente")}
        </button>
      )}
      <button disabled={!captura}>{t("Enviar reporte")}</button>
      <button type="button" onClick={cancelar}>
        {t("Cancelar")}
      </button>
    </form>
  );
}
