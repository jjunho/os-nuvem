import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/notificacoes";
import { exigirUsuario } from "~/session.server";
import {
  guardarInscricao,
  entregarPush,
} from "~/modules/notificacoes/push.server";
import { listarNotificacoes } from "~/modules/notificacoes/leituras.server";
import { useIdioma } from "~/modules/idiomas/idioma";
import { ativarPush } from "~/modules/notificacoes/push.client";
// Protocolo §1.4: fase linear de um único campo permanece um valor de estado simples.
type FaseInscricao = "inativa" | "ativando" | "recusada" | "ativa" | "erro";
export async function loader({ request }: Route.LoaderArgs) {
  const u = await exigirUsuario(request);
  await entregarPush();
  return {
    notificacoes: await listarNotificacoes(u.id),
    chave: process.env.VAPID_PUBLIC_KEY ?? null,
  };
}
export async function action({ request }: Route.ActionArgs) {
  const u = await exigirUsuario(request);
  let entrada: unknown;
  try {
    entrada = await request.json();
  } catch {
    throw new Response("Dados inválidos", { status: 400 });
  }
  await guardarInscricao(u.id, entrada);
  return { ok: true };
}
export default function Notificacoes({ loaderData: d }: Route.ComponentProps) {
  const { t } = useIdioma();
  const [estado, setEstado] = useState<FaseInscricao>("inativa");
  const pendente = useRef(false);
  const ativo = useRef(true);
  const abortar = useRef<AbortController | null>(null);
  useEffect(() => {
    ativo.current = true;
    return () => {
      ativo.current = false;
      abortar.current?.abort();
    };
  }, []);
  async function ativar() {
    if (!d.chave || pendente.current || !ativo.current) return;
    pendente.current = true;
    const controle = new AbortController();
    abortar.current = controle;
    setEstado("ativando");
    try {
      const fase = await ativarPush(d.chave, controle.signal);
      if (ativo.current) setEstado(fase);
    } finally {
      pendente.current = false;
    }
  }
  const feedback = (
    {
      inativa: "",
      ativando: "Ativando notificações…",
      recusada: "Notificações não autorizadas",
      ativa: "Notificações ativadas",
      erro: "Não foi possível ativar notificações",
    } as const
  )[estado];

  return (
    <>
      <h1>{t("Notificações")}</h1>
      {d.chave && (
        <button disabled={estado === "ativando"} onClick={ativar}>
          {t("Ativar notificações")}
        </button>
      )}
      <p role={estado === "erro" ? "alert" : "status"}>
        {feedback && t(feedback)}
      </p>
      <ul>
        {d.notificacoes.map((n) => (
          <li key={n.id}>
            <Link to={n.url}>{n.titulo}</Link>
            <p>{n.texto}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
