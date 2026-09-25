import type { TradutorComunicador } from "./textos";
import type { GruposPainel } from "./use-painel";


type Props = Omit<
  Pick<GruposPainel["tarefa"], "atual" | "referencias" | "salvar" | "cancelar" | "carregarReferencias">,
  "atual"
> & { atual: NonNullable<GruposPainel["tarefa"]["atual"]> } &
  Pick<GruposPainel["conversas"], "pessoas"> & {
    usuarioId: number;
    traduzirErro: (erro: string) => string;
    mostrarBuscaViagem: boolean;
    t: TradutorComunicador;
  };

export function PainelTarefa({
  atual,
  pessoas,
  salvar,
  cancelar,
  carregarReferencias,
  usuarioId,
  traduzirErro,
  referencias,
  mostrarBuscaViagem,
  t,
}: Props) {
  return (
    <form
      aria-label={t("Nova tarefa")}
      onSubmit={(evento) => {
        evento.preventDefault();
        const dados = new FormData(evento.currentTarget);
        const responsavelTexto = dados.get("responsavel");
        const titulo = dados.get("titulo");
        const prazo = dados.get("prazo");
        if (
          typeof titulo !== "string" ||
          typeof responsavelTexto !== "string" ||
          typeof prazo !== "string"
        ) return;
        const responsavelId = Number(responsavelTexto);
        if (!Number.isSafeInteger(responsavelId)) return;
        const viagemTexto = dados.get("viagemId");
        const viagemId = typeof viagemTexto === "string" && viagemTexto
          ? Number(viagemTexto) || undefined
          : undefined;
        void salvar({
          titulo,
          responsavelId,
          prazo,
          copias: dados.getAll("copias").map(Number),
          ...(viagemId === undefined ? {} : { viagemId }),
        });
      }}
    >
      <fieldset disabled={atual.fase === "salvando"}>
        <label>
          {t("Título")}
          <input name="titulo" defaultValue={atual.titulo} required />
        </label>
        <label>
          {t("Responsável")}
          <select name="responsavel" defaultValue={usuarioId}>
            {pessoas.map((pessoa) => (
              <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>
            ))}
          </select>
        </label>
        {mostrarBuscaViagem && (
          <label>
            {t("Viagem (opcional)")}
            <input
              aria-label={t("Buscar viagem")}
              onChange={(evento) => { void carregarReferencias(evento.target.value); }}
            />
            <select
              name="viagemId"
              aria-label={t("Viagem")}
            >
              <option value="">—</option>
              {referencias
                .filter((referencia) => referencia.referencia.startsWith("V"))
                .map((referencia) => (
                  <option key={referencia.referencia} value={referencia.viagemId}>
                    {referencia.referencia} · {referencia.titulo}
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
            {pessoas.map((pessoa) => (
              <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>
            ))}
          </select>
        </label>
        <button>{t("Salvar")}</button>
      </fieldset>
      {atual.erro && <p role="alert">{traduzirErro(atual.erro)}</p>}
      <button type="button" onClick={cancelar}>{t("Cancelar")}</button>
    </form>
  );
}
