import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { desc, eq } from "drizzle-orm";
import type { Route } from "./+types/notificacoes";
import { exigirUsuario } from "~/session.server";
import { db } from "~/db/client.server";
import { notificacoes } from "~/db/schema";
import {
  guardarInscricao,
  entregarPush,
} from "~/modules/notificacoes/push.server";
import { useIdioma } from "~/modules/idiomas/idioma";
export async function loader({ request }: Route.LoaderArgs) {
  const u = await exigirUsuario(request);
  await entregarPush();
  return {
    notificacoes: await db
      .select()
      .from(notificacoes)
      .where(eq(notificacoes.usuarioId, u.id))
      .orderBy(desc(notificacoes.id))
      .limit(100),
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
  const [estado, setEstado] = useState<
    "inativa" | "ativando" | "recusada" | "ativa" | "erro"
  >("inativa");
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
      const permissao = await Notification.requestPermission();
      if (!ativo.current) return;
      if (permissao !== "granted") {
        setEstado("recusada");
        return;
      }
      const worker = await navigator.serviceWorker.register("/push-sw.js");
      await navigator.serviceWorker.ready;
      if (!ativo.current) return;
      const chave = Uint8Array.from(
        atob(d.chave.replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0),
      );
      const inscricao =
        (await worker.pushManager.getSubscription()) ??
        (await worker.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: chave,
        }));
      if (!ativo.current) return;
      const resposta = await fetch("/notificacoes", {
        method: "POST",
        signal: controle.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inscricao),
      });
      if (ativo.current) setEstado(resposta.ok ? "ativa" : "erro");
    } catch {
      if (ativo.current) setEstado("erro");
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
