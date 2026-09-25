import { useEffect, useState } from "react";
import { useIdioma } from "~/modules/idiomas/idioma";
import { textos } from "./textos";
import { comando } from "./Painel";
export function Instalacao({ visto }: { visto: boolean }) {
  const { idioma } = useIdioma(),
    t = textos(idioma);
  const [fechado, setFechado] = useState(visto),
    [telefone, setTelefone] = useState(false),
    [ios, setIos] = useState(false);
  useEffect(() => {
    setTelefone(matchMedia("(max-width: 760px)").matches);
    setIos(/iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);
  if (fechado) return null;
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
      <button
        onClick={async () => {
          await comando({ acao: "aviso-visto" });
          setFechado(true);
        }}
      >
        {t("Entendi")}
      </button>
    </section>
  );
}
