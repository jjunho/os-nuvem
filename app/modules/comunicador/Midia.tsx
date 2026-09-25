import type { TradutorComunicador } from "./textos";
import type { GruposPainel } from "./use-painel";
type Props = Pick<
  GruposPainel["midia"],
  "foto" | "midiaEmMovimento" | "zoom" | "viajantes" | "faseGravacao" | "enviarArquivo" | "iniciarGravacao" | "pararGravacao" | "carregarViajantes" | "moverMidia" | "cancelarMovimento" | "fecharFoto" | "definirZoom"
> & {
  habilitada: boolean;
  t: TradutorComunicador;
};

export function Midia({
  foto,
  midiaEmMovimento,
  zoom,
  viajantes,
  habilitada,
  faseGravacao,
  t,
  enviarArquivo,
  iniciarGravacao,
  pararGravacao,
  carregarViajantes,
  moverMidia,
  cancelarMovimento,
  fecharFoto,
  definirZoom,
}: Props) {
  return (
    <>
      {foto && (
        <div className="midia-ampliada" role="dialog" aria-label={t("Foto")}>
          <button onClick={fecharFoto}>{t("Fechar")}</button>
          <label>
            {t("Zoom")}
            <input
              type="range"
              min="1"
              max="4"
              step=".1"
              value={zoom}
              onChange={(evento) => definirZoom(Number(evento.target.value))}
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
      {habilitada && (
        <div>
          <label>
            {t("Foto")}
            <input
              type="file"
              accept="image/*"
              onChange={(evento) => {
                if (evento.target.files?.[0]) void enviarArquivo(evento.target.files[0]);
                evento.target.value = "";
              }}
            />
          </label>
          <label>
            {t("Câmera")}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(evento) => {
                if (evento.target.files?.[0]) void enviarArquivo(evento.target.files[0]);
              }}
            />
          </label>
          <button
            type="button"
            onPointerDown={(evento) => {
              evento.currentTarget.setPointerCapture(evento.pointerId);
              iniciarGravacao();
            }}
            onPointerUp={pararGravacao}
            onPointerCancel={pararGravacao}
            onKeyDown={(evento) => {
              if (evento.key === " " && !evento.repeat) iniciarGravacao();
            }}
            onKeyUp={(evento) => {
              if (evento.key === " ") pararGravacao();
            }}
          >
            {t(faseGravacao === "gravando" ? "Gravando" : "Segure para gravar")}
          </button>
        </div>
      )}
      {midiaEmMovimento !== null && (
        <div>
          <label>
            {t("Buscar Viajante")}
            <input onChange={(evento) => void carregarViajantes(evento.target.value)} />
          </label>
          {viajantes.map((viajante) => (
            <button
              type="button"
              key={viajante.id}
              onClick={() => void moverMidia(midiaEmMovimento, viajante.id)}
            >
              {viajante.nome} · {viajante.codigo}
            </button>
          ))}
          <button type="button" onClick={cancelarMovimento}>
            {t("Cancelar")}
          </button>
        </div>
      )}
    </>
  );
}
