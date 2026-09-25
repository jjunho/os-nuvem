import { inteiroEntrada, idOpcional } from "~/modules/validacao/entrada";
import { Form, redirect, useNavigation } from "react-router";
import { erroDeFormulario } from "~/modules/interface/erro-formulario.server";
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
  const versoes = await versoesParaAceite(inteiroEntrada(params.id));
  if (!versoes.length)
    throw new Response("Envie uma proposta antes de registrar o aceite", {
      status: 400,
    });
  const selecionada = idOpcional(
    new URL(request.url).searchParams.get("versao"),
  );
  const versao =
    selecionada === undefined
      ? versoes[0]
      : versoes.find((v) => v.id === selecionada);
  if (!versao)
    throw new Response("Selecione uma versão enviada", { status: 400 });
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
  try {
    await aceitarOpcao(
      inteiroEntrada(params.id),
      inteiroEntrada(f.get("orcamentoId")),
      String(f.get("opcaoId")),
      u.id,
      agora,
      quando ? new Date(quando) : agora,
    );
    return redirect(`/viagens/${params.id}`);
  } catch (erro) {
    return erroDeFormulario(erro);
  }
}
export default function Aceite({
  loaderData: d,
  actionData,
}: Route.ComponentProps) {
  const { t, mensagem } = useIdioma();
  const enviando = useNavigation().state !== "idle";
  return (
    <>
      <h1>{t("Registrar aceite")}</h1>
      {actionData?.erro && <p role="alert">{mensagem(actionData.erro)}</p>}
      <Form method="get">
        <label>
          {t("Versão aceita")}
          <select
            name="versao"
            aria-label={t("Versão aceita")}
            value={d.versao.id}
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
      <Form key={`aceite-${d.versao.id}`} method="post">
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
        <button disabled={enviando}>{t("Confirmar aceite")}</button>
      </Form>
    </>
  );
}
