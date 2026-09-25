import { useEffect, useRef, useState } from "react";
import type { ChaveTraducao } from "~/modules/idiomas/catalogo";
import { copiarResumo } from "./copiar-resumo";

type CopiarResumoProps = { url: string; t: (chave: ChaveTraducao) => string };

export function CopiarResumo({ url, t }: CopiarResumoProps) {
  const [estado, setEstado] = useState<"idle" | "copiando" | "copiado" | "erro">(
    "idle",
  );
  const tentativa = useRef(0);
  const montado = useRef(true);
  const copiando = useRef(false);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      tentativa.current++;
    };
  }, []);

  const copiar = async () => {
    if (copiando.current) return;
    copiando.current = true;
    const id = ++tentativa.current;
    setEstado("copiando");
    try {
      const copiou = await copiarResumo(url, {
        buscar: fetch,
        escrever: (texto) => navigator.clipboard.writeText(texto),
        atual: () => montado.current && id === tentativa.current,
      });
      if (copiou && montado.current && id === tentativa.current)
        setEstado("copiado");
    } catch {
      if (montado.current && id === tentativa.current) setEstado("erro");
    } finally {
      if (montado.current && id === tentativa.current) copiando.current = false;
    }
  };

  return (
    <>
      <button disabled={estado === "copiando"} onClick={copiar}>
        {t("Copiar resumo B2B")}
      </button>
      {estado === "copiado" && <p role="status">{t("Texto copiado")}</p>}
      {estado === "erro" && (
        <p role="alert">{t("Não foi possível copiar. Tente novamente.")}</p>
      )}
    </>
  );
}
