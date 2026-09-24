import { Form, redirect } from "react-router";
import type { Route } from "./+types/aceite";
import { exigirUsuario } from "~/session.server";
import { now } from "~/clock.server";
import {
  aceitarOpcao,
  versoesParaAceite,
} from "~/modules/orcamentos/aceite.server";
import { useIdioma } from "~/modules/idiomas/idioma";
export async function loader({ request, params }: Route.LoaderArgs) {
  await exigirUsuario(request);
  const versoes = await versoesParaAceite(Number(params.id));
  if (!versoes.length)
    throw new Response("Envie uma proposta antes de registrar o aceite", {
      status: 400,
    });
  const selecionada = Number(new URL(request.url).searchParams.get("versao"));
  const versao = versoes.find((v) => v.id === selecionada) ?? versoes[0];
  return {
    versoes,
    versao,
    agora: now(request).toISOString(),
    vencida: new Date(versao.memoria!.validadeAte) < now(request),
  };
}
export async function action({ request, params }: Route.ActionArgs) {
  const u = await exigirUsuario(request);
  const f = await request.formData();
  const agora = now(request);
  const quando = String(f.get("aceitoEm") ?? "");
  await aceitarOpcao(
    Number(params.id),
    Number(f.get("orcamentoId")),
    String(f.get("opcaoId")),
    u.id,
    agora,
    quando ? new Date(quando) : agora,
  );
  return redirect(`/viagens/${params.id}`);
}
export default function Aceite({ loaderData: d }: Route.ComponentProps) {
  const { t } = useIdioma();
  return (
    <>
      <h1>{t("Registrar aceite")}</h1>
      <Form method="get">
        <label>
          {t("Versão aceita")}
          <select
            name="versao"
            aria-label={t("Versão aceita")}
            defaultValue={d.versao.id}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
          >
            {d.versoes.map((v) => (
              <option key={v.id} value={v.id}>
                {t("Versão")} {v.versao}
              </option>
            ))}
          </select>
        </label>
      </Form>
      {d.vencida && (
        <p className="alerta">
          {t("Proposta fora da validade; confira os preços")}
        </p>
      )}
      <Form key={d.versao.id} method="post">
        <input type="hidden" name="orcamentoId" value={d.versao.id} />
        <label>
          {t("Opção aceita")}
          <select
            required
            name="opcaoId"
            aria-label={t("Opção aceita")}
            defaultValue={
              d.versao.memoria!.dados.opcoes.length === 1
                ? d.versao.memoria!.dados.opcoes[0].id
                : ""
            }
          >
            <option value="">{t("Selecione")}</option>
            {d.versao.memoria!.dados.opcoes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome} — {o.pagantes} + {o.gratuidades}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Aceito em (ISO)")}
          <input name="aceitoEm" defaultValue={d.agora} required />
        </label>
        <button>{t("Confirmar aceite")}</button>
      </Form>
    </>
  );
}
