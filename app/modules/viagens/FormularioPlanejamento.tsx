import {
  assinaturaEnvio,
  prepararTentativa,
} from "./tentativa-planejamento.client";
import type { ResultadoFormulario } from "./resultado-formulario";
import { useEffect, useRef, useState } from "react";
import {
  camposReconhecidos,
  type RespostasEnviadas,
} from "./respostas-enviadas";
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
  const { t, mensagem } = useIdioma();
  const formulario = useFetcher<ResultadoFormulario>();
  const formularioEmCurso = useRef(false);
  const chaveFormulario = `planejamento:${viagemId}:formulario`;
  const chaveRespostas = `planejamento:${viagemId}:respostas`;
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);
  useEffect(() => {
    if (formulario.state === "idle") {
      if (
        formularioEmCurso.current &&
        formulario.data &&
        ("link" in formulario.data || "revogado" in formulario.data)
      ) {
        try {
          sessionStorage.removeItem(chaveFormulario);
        } catch (erro) {
          setErroLocal(erro instanceof Error ? erro.message : String(erro));
        }
      }
      formularioEmCurso.current = false;
    }
  }, [formulario.state, formulario.data, chaveFormulario]);
  const anexar = useFetcher<{ ok: true; erro?: never } | { erro: string }>();
  const texto = useRef<HTMLTextAreaElement>(null);
  const arquivo = useRef<HTMLInputElement>(null);
  const enviado = useRef<RespostasEnviadas | null>(null);
  useEffect(() => {
    if (anexar.state !== "idle" || !anexar.data || !enviado.current) return;
    if ("ok" in anexar.data && anexar.data.ok) {
      try {
        sessionStorage.removeItem(chaveRespostas);
      } catch (erro) {
        setErroLocal(erro instanceof Error ? erro.message : String(erro));
      }
      const reconhecidos = camposReconhecidos(enviado.current, {
        texto: texto.current?.value ?? "",
        arquivo: arquivo.current?.files?.[0] ?? null,
      });
      if (reconhecidos.texto && texto.current) texto.current.value = "";
      if (reconhecidos.arquivo && arquivo.current) arquivo.current.value = "";
    }
    enviado.current = null;
  }, [anexar.state, anexar.data, chaveRespostas]);
  return (
    <section>
      <h2>{t("Formulário de planejamento")}</h2>
      {erroLocal && <p role="alert">{mensagem(erroLocal)}</p>}
      <formulario.Form
        method="post"
        onSubmit={(evento) => {
          if (formularioEmCurso.current || formulario.state !== "idle") {
            evento.preventDefault();
            return;
          }
          evento.preventDefault();
          formularioEmCurso.current = true;
          setErroLocal(null);
          const submitter = (evento.nativeEvent as SubmitEvent).submitter;
          const form = new FormData(evento.currentTarget);
          const intent =
            submitter instanceof HTMLButtonElement
              ? submitter.value
              : "gerar-formulario";
          form.set("intent", intent);
          try {
            if (intent === "gerar-formulario")
              form.set(
                "tentativaId",
                prepararTentativa(
                  sessionStorage,
                  chaveFormulario,
                  "formulario",
                  () => crypto.randomUUID(),
                ),
              );
            void formulario.submit(form, { method: "post" }).catch((erro) => {
              formularioEmCurso.current = false;
              if (montado.current)
                setErroLocal(
                  erro instanceof Error ? erro.message : String(erro),
                );
            });
          } catch (erro) {
            formularioEmCurso.current = false;
            setErroLocal(erro instanceof Error ? erro.message : String(erro));
          }
        }}
      >
        <button
          disabled={formulario.state !== "idle"}
          name="intent"
          value="gerar-formulario"
        >
          {t("Enviar formulário")}
        </button>
        <button
          disabled={formulario.state !== "idle"}
          name="intent"
          value="revogar-formulario"
        >
          {t("Revogar formulário")}
        </button>
      </formulario.Form>
      {formulario.data && "erro" in formulario.data && (
        <p role="alert">{mensagem(formulario.data.erro)}</p>
      )}
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
      <anexar.Form
        onSubmit={async (evento) => {
          if (enviado.current || anexar.state !== "idle") {
            evento.preventDefault();
            return;
          }
          evento.preventDefault();
          const form = new FormData(evento.currentTarget);
          enviado.current = {
            texto: texto.current?.value ?? "",
            arquivo: arquivo.current?.files?.[0] ?? null,
          };
          setPreparando(true);
          setErroLocal(null);
          try {
            const assinatura = await assinaturaEnvio(form, (bytes) =>
              crypto.subtle.digest("SHA-256", bytes),
            );
            if (!montado.current) return;
            form.set(
              "tentativaId",
              prepararTentativa(
                sessionStorage,
                chaveRespostas,
                assinatura,
                () => crypto.randomUUID(),
              ),
            );
            await anexar.submit(form, {
              method: "post",
              encType: "multipart/form-data",
            });
          } catch (erro) {
            enviado.current = null;
            if (montado.current)
              setErroLocal(erro instanceof Error ? erro.message : String(erro));
          } finally {
            if (montado.current) setPreparando(false);
          }
        }}
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
            ref={texto}
            rows={3}
          />
        </label>
        <label>
          {t("Arquivo de planejamento")}
          <input ref={arquivo} type="file" name="arquivo" />
        </label>
        <button disabled={preparando || anexar.state !== "idle"}>
          {t("Adicionar respostas")}
        </button>
      </anexar.Form>
      {anexar.data?.erro && <p role="alert">{mensagem(anexar.data.erro)}</p>}
      <ul>
        {anexos.map((a) => (
          <li key={a.id}>
            <a href={`/viagens/${viagemId}/anexos/${a.id}`}>{a.nome}</a>
          </li>
        ))}
      </ul>
      {formulario.state === "idle" &&
        formulario.data &&
        "revogado" in formulario.data && (
          <p role="status">{t("Formulário revogado")}</p>
        )}
      {formulario.state === "idle" &&
        formulario.data &&
        "link" in formulario.data && (
          <Link to={formulario.data.link}>{t("Abrir formulário")}</Link>
        )}
    </section>
  );
}
