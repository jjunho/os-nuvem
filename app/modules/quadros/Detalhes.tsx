import { Form, Link } from "react-router";
import { useQuadrosTexto } from "./textos";
import type { extrasTarefa } from "./quadros.server";
type Props = {
  dados: Awaited<ReturnType<typeof extrasTarefa>>;
  id: number;
  responsavelId: number;
  prazo: Date | null;
  tipo: string;
  viagemId: number | null;
};
export function Detalhes({
  dados: d,
  id,
  responsavelId,
  prazo,
  tipo,
  viagemId,
}: Props) {
  const t = useQuadrosTexto();
  return (
    <>
      <nav>
        <Link to={`/quadros/${d.posicao.quadro_id}`}>{t("Abrir Quadro")}</Link>
        {" · "}
        {d.conversaId && (
          <Link to={`/?conversa=${d.conversaId}`}>
            {t("Conversa da tarefa")}
          </Link>
        )}
      </nav>
      {tipo !== "manual" && viagemId && (
        <Link to={`/viagens/${viagemId}`}>{t("Abrir tarefa")}</Link>
      )}
      <Form method="post">
        <label>
          {t("Responsável")}
          <select
            aria-label={t("Responsável")}
            name="responsavelId"
            defaultValue={responsavelId}
          >
            {d.usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <button name="intent" value="enviar">
          {t("Enviar tarefa")}
        </button>
        <button name="intent" value="arquivar">
          {t("Arquivar")}
        </button>
      </Form>
      <section>
        <h2>{t("Cópias")}</h2>
        {d.usuarios
          .filter((u) => u.em_copia)
          .map((u) => (
            <Form method="post" key={u.id}>
              {u.nome}
              <input type="hidden" name="usuarioId" value={u.id} />
              <button name="intent" value="remover-copia">
                {t("Remover cópia")}
              </button>
            </Form>
          ))}
        <Form method="post">
          <label>
            {t("Pessoa em cópia")}
            <select name="usuarioId">
              {d.usuarios
                .filter((u) => !u.em_copia && u.id !== responsavelId)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
            </select>
          </label>
          <button name="intent" value="copiar">
            {t("Adicionar cópia")}
          </button>
        </Form>
      </section>
      <section>
        <h2>{t("Checklist")}</h2>
        {d.checklist.map((c) => (
          <div key={c.id}>
            <Form method="post">
              <input type="hidden" name="itemId" value={c.id} />
              <input
                type="hidden"
                name="concluido"
                value={String(!c.concluido)}
              />
              <span
                style={{
                  textDecoration: c.concluido ? "line-through" : undefined,
                }}
              >
                {c.titulo}
              </span>
              <button name="intent" value="checklist-marcar">
                {t(c.concluido ? "Desmarcar" : "Marcar")}
              </button>
            </Form>
            {c.promovida_id ? (
              <Link to={`/tarefas/${c.promovida_id}`}>{t("Abrir tarefa")}</Link>
            ) : (
              <Form method="post">
                <input type="hidden" name="itemId" value={c.id} />
                <label>
                  {t("Responsável")}
                  <select
                    aria-label={t("Responsável")}
                    name="responsavelId"
                    defaultValue={responsavelId}
                  >
                    {d.usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t("Prazo")}
                  <input
                    name="prazo"
                    type="datetime-local"
                    defaultValue={
                      prazo
                        ? new Date(
                            new Date(prazo).getTime() -
                              new Date(prazo).getTimezoneOffset() * 60000,
                          )
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                  />
                </label>
                <button name="intent" value="checklist-promover">
                  {t("Promover a tarefa")}
                </button>
              </Form>
            )}
          </div>
        ))}
        <Form method="post">
          <label>
            {t("Título")}
            <input name="titulo" required />
          </label>
          <button name="intent" value="checklist-adicionar">
            {t("Adicionar item")}
          </button>
        </Form>
      </section>
      <section>
        <h2>{t("Etiquetas")}</h2>
        {d.etiquetas.map((e) => (
          <Form method="post" key={e.id}>
            {e.nome}
            <input type="hidden" name="etiquetaId" value={e.id} />
            <input type="hidden" name="atribuir" value={String(!e.atribuida)} />
            <button name="intent" value="etiqueta-atribuir">
              {t(e.atribuida ? "Remover" : "Atribuir")}
            </button>
          </Form>
        ))}
        <Form method="post">
          <label>
            {t("Nome")}
            <input name="nome" required />
          </label>
          <button name="intent" value="etiqueta-criar">
            {t("Criar etiqueta")}
          </button>
        </Form>
      </section>
      <section>
        <h2>{t("Anexos")}</h2>
        {d.anexos.map((a) => (
          <div key={a.id}>
            <a href={`/tarefas/${id}/anexos/${a.id}`}>{a.nome}</a>
            {a.mime.startsWith("image/") && (
              <Form method="post">
                <input type="hidden" name="anexoId" value={a.id} />
                <button name="intent" value="capa">
                  {t("Usar como capa")}
                </button>
              </Form>
            )}
          </div>
        ))}
        <Form method="post" encType="multipart/form-data">
          <label>
            {t("Arquivo")}
            <input name="arquivo" type="file" required />
          </label>
          <button name="intent" value="anexar">
            {t("Anexar")}
          </button>
        </Form>
      </section>
    </>
  );
}
