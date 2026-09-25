import { useEffect, useRef, useState } from "react";
import { useIdioma } from "~/modules/idiomas/idioma";
import { textos } from "./textos";
import { comando } from "./Painel";
export function Instalacao({ visto }: { visto: boolean }) {
  const { idioma } = useIdioma(),
    t = textos(idioma);
  const [estado, setEstado] = useState<
      "visivel" | "salvando" | "erro" | "fechado"
    >("visivel"),
    [telefone, setTelefone] = useState(false),
    [ios, setIos] = useState(false);
  const salvando = useRef(false);
  const ativo = useRef(true);
  useEffect(() => {
    ativo.current = true;
    const media = matchMedia("(max-width: 760px)");
    const atualizar = () => setTelefone(media.matches);
    atualizar();
    media.addEventListener("change", atualizar);
    setIos(/iPhone|iPad|iPod/.test(navigator.userAgent));
    return () => {
      ativo.current = false;
      media.removeEventListener("change", atualizar);
    };
  }, []);
  if (visto || estado === "fechado") return null;
  return (
    <section className="aviso-comunicador" aria-label={t("Boas-vindas")}>
      <p>{t("O Admin pode ler todas as conversas, inclusive as diretas.")}</p>
      {telefone && (
        <>
          <h2>{t("Instalar no celular")}</h2>
          <p>
            {t(
              ios
                ? "No Safari, toque em Compartilhar e Adicionar à Tela de Início. Abra pelo ícone para ativar notificações (iOS 16.4 ou posterior)."
                : "No menu do navegador, escolha Instalar aplicativo ou Adicionar à tela inicial.",
            )}
          </p>
          <a href="/notificacoes">{t("Ativar notificações")}</a>
        </>
      )}
      {estado === "erro" && (
        <p role="alert">{t("Não foi possível salvar. Tente novamente.")}</p>
      )}
      <button
        disabled={estado === "salvando"}
        onClick={async () => {
          if (salvando.current) return;
          salvando.current = true;
          setEstado("salvando");
          try {
            await comando({ acao: "aviso-visto" });
            if (ativo.current) setEstado("fechado");
          } catch {
            if (ativo.current) setEstado("erro");
          } finally {
            salvando.current = false;
          }
        }}
      >
        {t("Entendi")}
      </button>
    </section>
  );
}
