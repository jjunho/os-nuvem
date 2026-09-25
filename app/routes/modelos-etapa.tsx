import { useActionData, useNavigation } from "react-router";
import { erroDeFormulario } from "~/modules/interface/erro-formulario.server";
import { FATOS_MODELO } from "~/modules/viagens/tarefas-etapa";
import { Form } from "react-router";
import type { Route } from "./+types/modelos-etapa";
import { exigirUsuario } from "~/session.server";
import { now } from "~/clock.server";
import { listarUsuarios } from "~/modules/viagens/viagens.server";
import {
  listarModelosEtapa,
  salvarModeloEtapa,
} from "~/modules/viagens/tarefas-etapa.server";
import { useIdioma } from "~/modules/idiomas/idioma";
import { rotuloEtapa } from "~/modules/viagens/rotulos";
import type { Etapa } from "~/modules/viagens/regras";
const fatos: Record<string, string> = {
  contato: "Nota de contato",
  cotacao: "Cotação de fornecedor",
  envio: "Envio de proposta",
  aceite: "Aceite",
  pensando: "Resposta do Cliente",
  invoice: "Envio de invoice",
  pagamento: "Pagamento",
  voucher: "Envio de voucher",
};
export async function loader({ request }: Route.LoaderArgs) {
  const usuario = await exigirUsuario(request);
  if (usuario.papel !== "admin")
    throw new Response("Acesso restrito", { status: 403 });
  return {
    modelos: await listarModelosEtapa(),
    usuarios: await listarUsuarios(),
  };
}
export async function action({ request }: Route.ActionArgs) {
  try {
    const usuario = await exigirUsuario(request);
    await salvarModeloEtapa(usuario, await request.formData(), now(request));
    return { ok: true };
  } catch (erro) {
    return erroDeFormulario(erro);
  }
}
export default function ModelosEtapa({ loaderData }: Route.ComponentProps) {
  const { t, mensagem } = useIdioma();
  const resultado = useActionData<typeof action>();
  const pendente = useNavigation().state !== "idle";
  const { mensagem: mensagemErro } = useIdioma();
  return (
    <>
      {resultado && "erro" in resultado && resultado.erro && (
        <p role="alert">{mensagemErro(resultado.erro)}</p>
      )}
      <h1>{t("Modelos de etapa")}</h1>
      <p>{t("Alterações valem para as próximas entradas na Etapa.")}</p>
      {loaderData.modelos.map((m) => (
        <Form method="post" key={m.id} className="painel">
          <h2>
            {t(rotuloEtapa[m.etapa as Etapa])} · {mensagem(m.titulo)}
          </h2>
          <input type="hidden" name="id" value={m.id} />
          {!m.ativo && <p>{t("Inativo até a integração do módulo")}</p>}
          <label>
            {t("Título")}
            <input name="titulo" defaultValue={m.titulo} required />
          </label>
          <label>
            {t("Prazo relativo em horas")}
            <input
              type="number"
              name="horas"
              min="1"
              max="8760"
              defaultValue={m.horas ?? 8}
              required
            />
          </label>
          {m.horas === null && (
            <p>{t("Padrão atual: prazo por canal comercial")}</p>
          )}
          <label>
            {t("Destinatário")}
            <select
              aria-label={t("Destinatário")}
              name="destinatario"
              defaultValue={m.destinatario}
            >
              <option value="responsavel">{t("Responsável da Viagem")}</option>
              <option value="usuario">{t("Usuário nomeado")}</option>
            </select>
          </label>
          <label>
            {t("Usuário")}
            <select
              aria-label={t("Usuário")}
              name="usuarioId"
              defaultValue={m.usuarioId ?? loaderData.usuarios[0]?.id}
            >
              {loaderData.usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("Fato conclusivo")}
            <select
              aria-label={t("Fato conclusivo")}
              name="fato"
              defaultValue={m.fato}
            >
              {FATOS_MODELO.map((f) => (
                <option key={f} value={f}>
                  {mensagem(fatos[f])}
                </option>
              ))}
            </select>
          </label>
          <button disabled={pendente}>{t("Salvar")}</button>
        </Form>
      ))}
    </>
  );
}
