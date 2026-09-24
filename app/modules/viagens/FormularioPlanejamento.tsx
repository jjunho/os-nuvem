import { useFetcher, Link, Form } from "react-router";
import { useIdioma } from "~/modules/idiomas/idioma";
export function FormularioPlanejamento({
  conflitos,
  anexos,
  viagemId,
}: {
  viagemId: number;
  anexos: { id: number; nome: string }[];
  conflitos: { id: number; atual: string; recebido: string }[];
}) {
  const { t } = useIdioma();
  const formulario = useFetcher<{ link?: string; revogado?: boolean }>();
  return (
    <section>
      <h2>{t("Formulário de planejamento")}</h2>
      <formulario.Form method="post">
        <button name="intent" value="gerar-formulario">
          {t("Enviar formulário")}
        </button>
        <button name="intent" value="revogar-formulario">
          {t("Revogar formulário")}
        </button>
      </formulario.Form>
      {conflitos.length > 0 && (
        <section aria-label={t("Respostas conflitantes")}>
          <h3>{t("Respostas conflitantes")}</h3>
          {conflitos.map((c) => (
            <Form method="post" key={c.id}>
              <input type="hidden" name="intent" value="resolver-resposta" />
              <input type="hidden" name="respostaId" value={c.id} />
              <input type="hidden" name="atual" value={c.atual} />
              <p>
                {t("Registrado")}: {c.atual}
              </p>
              <p>
                {t("Recebido")}: {c.recebido}
              </p>
              <button name="escolha" value="usar">
                {t("Usar resposta")}
              </button>
              <button name="escolha" value="manter">
                {t("Manter registrado")}
              </button>
            </Form>
          ))}
        </section>
      )}
      <Form
        key={anexos.length}
        method="post"
        encType="multipart/form-data"
        className="lista-botoes"
      >
        <input type="hidden" name="intent" value="anexar-respostas" />
        <label>
          {t("Respostas recebidas")}
          <textarea
            aria-label={t("Respostas recebidas")}
            name="textoRecebido"
            rows={3}
          />
        </label>
        <label>
          {t("Arquivo de planejamento")}
          <input type="file" name="arquivo" />
        </label>
        <button>{t("Adicionar respostas")}</button>
      </Form>
      <ul>
        {anexos.map((a) => (
          <li key={a.id}>
            <a href={`/viagens/${viagemId}/anexos/${a.id}`}>{a.nome}</a>
          </li>
        ))}
      </ul>
      {formulario.data?.revogado && (
        <p role="status">{t("Formulário revogado")}</p>
      )}
      {formulario.data?.link && (
        <Link to={formulario.data.link}>{t("Abrir formulário")}</Link>
      )}
    </section>
  );
}
