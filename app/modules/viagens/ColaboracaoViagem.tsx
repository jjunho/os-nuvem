import { Form, Link } from "react-router";
import { useIdioma } from "~/modules/idiomas/idioma";
import { Seletor } from "~/modules/opcoes/Seletor";
import type { colaboracaoDaViagem } from "./colaboracao.server";
export function ColaboracaoViagem({
  dados,
  usuarios,
}: {
  dados: Awaited<ReturnType<typeof colaboracaoDaViagem>>;
  usuarios: { id: number; nome: string }[];
}) {
  const { idioma, t } = useIdioma();
  const quando = (data: string | Date) =>
    new Date(data).toLocaleString(idioma === "ko" ? "ko-KR" : "pt-BR");
  return (
    <>
      <section aria-label={t("Participantes")}>
        <h2>{t("Participantes")}</h2>
        <Form method="post" className="linha">
          <input type="hidden" name="intent" value="participante-adicionar" />
          <label>
            {t("Participante")}
            <select aria-label={t("Participante")} name="participanteId">
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
          <button>{t("Adicionar participante")}</button>
        </Form>
        <ul>
          {dados.participantes.map((p) => (
            <li key={p.id}>
              <span>{p.nome}</span> — {quando(p.desde)}{" "}
              {p.removidoEm ? (
                `${t("Removido")} ${quando(p.removidoEm)}`
              ) : (
                <Form method="post">
                  <input type="hidden" name="participacaoId" value={p.id} />
                  <button name="intent" value="participante-remover">
                    {t("Remover participante")}
                  </button>
                </Form>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section aria-label={t("Viagens relacionadas")}>
        <h2>{t("Viagens relacionadas")}</h2>
        <Form method="post" className="linha">
          <input type="hidden" name="intent" value="relacionar" />
          <Seletor
            nome="relacionada"
            rotulo={t("Viagem relacionada")}
            opcoes={dados.conhecidas.map((v) => ({
              valor: String(v.id),
              nome: v.codigo,
            }))}
          />
          <button>{t("Vincular viagem")}</button>
        </Form>
        <ul>
          {dados.relacionadas.map((v) => (
            <li key={v.id}>
              <Link to={`/viagens/${v.id}`}>{v.codigo}</Link>
              <Form method="post">
                <input type="hidden" name="relacionada" value={v.id} />
                <button name="intent" value="desvincular">
                  {t("Desvincular")}
                </button>
              </Form>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label={t("Desejos e aprovações")}>
        <h2>{t("Desejos e aprovações")}</h2>
        <Form key={dados.desejos.length} method="post" className="linha">
          <input type="hidden" name="intent" value="desejo-adicionar" />
          <label>
            {t("Desejo do cliente")}
            <input name="desejo" required />
          </label>
          <button>{t("Adicionar desejo")}</button>
        </Form>
        <ul>
          {dados.desejos.map((d) => (
            <li key={d.id}>
              {d.texto} —{" "}
              {d.descartadoEm
                ? t("Descartado")
                : d.aprovadoEm
                  ? `${t("Aprovado por")} ${d.aprovadoPor} · ${quando(d.aprovadoEm)}`
                  : t("Desejado")}
              {!d.descartadoEm && (
                <Form method="post">
                  <input type="hidden" name="desejoId" value={d.id} />
                  {!d.aprovadoEm && (
                    <button name="intent" value="desejo-aprovar">
                      {t("Aprovar")}
                    </button>
                  )}
                  <button name="intent" value="desejo-descartar">
                    {t("Descartar desejo")}
                  </button>
                </Form>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
