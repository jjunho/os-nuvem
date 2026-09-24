import { Form, Link } from "react-router";
import { useIdioma } from "~/modules/idiomas/idioma";
import type { perfisDaViagem } from "./perfil.server";
export function PerfilCliente({
  perfis,
}: {
  perfis: Awaited<ReturnType<typeof perfisDaViagem>>;
}) {
  const { t } = useIdioma();
  return (
    <>
      {perfis.map((p) => (
        <section key={p.id} aria-label={`${t("Perfil do cliente")}: ${p.nome}`}>
          <h2>
            {t("Perfil do cliente")}: {p.nome}
          </h2>
          <p data-testid="numero-cliente">{p.numero}</p>
          {p.viagens.length > 0 && <p>{t("Cliente conhecido")}</p>}
          <ul>
            {p.viagens.map((v) => (
              <li key={v.id}>
                <Link to={`/viagens/${v.id}`}>{v.codigo}</Link>
              </li>
            ))}
          </ul>
          <p>
            {t("Mobilidade")}: {p.mobilidade || "—"} ·{" "}
            {t("O que você não come")}: {p.alimentacao || "—"}
          </p>
          {p.aniversarios.map((data) => (
            <p key={data} className="aviso">
              {t("Aniversário durante a viagem")}: {data}
            </p>
          ))}
          <Form key={p.retornos.length} method="post" className="linha">
            <input type="hidden" name="intent" value="perfil" />
            <input type="hidden" name="contatoId" value={p.id} />
            <label>
              {t("Nascimento")}
              <input
                type="date"
                name="nascimento"
                defaultValue={p.nascimento ?? ""}
              />
            </label>
            <label>
              {t("Preferências")}
              <input name="preferencias" defaultValue={p.preferencias ?? ""} />
            </label>
            <label>
              {t("Como o roteiro foi recebido")}
              <textarea name="retornoRoteiro" />
            </label>
            <button>{t("Salvar perfil")}</button>
          </Form>
          <ul>
            {p.retornos.map((r) => (
              <li key={r.id}>
                {r.texto} — {r.autor}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
