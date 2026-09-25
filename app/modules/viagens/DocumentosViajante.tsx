import { useState } from "react";
import { useIdioma } from "~/modules/idiomas/idioma";
export function DocumentosViajante({ id }: { id: number }) {
  const { t } = useIdioma();
  const [documentos, setDocumentos] = useState<{ id: string }[]>([]);
  return (
    <details
      onToggle={async (e) => {
        if (!e.currentTarget.open) return;
        const r = await fetch(`/comunicador/api?documentosViajante=${id}`);
        if (r.ok) setDocumentos((await r.json()).documentos);
      }}
    >
      <summary>{t("Documentos do Viajante")}</summary>
      {documentos.map((d) => (
        <a
          key={d.id}
          href={`/comunicador/midia/${d.id}`}
          target="_blank"
          rel="noreferrer"
        >
          {t("Abrir documento")}
        </a>
      ))}
    </details>
  );
}
