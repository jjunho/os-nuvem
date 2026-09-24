import { useState } from "react";
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
  await guardarInscricao(u.id, await request.json());
  return { ok: true };
}
export default function Notificacoes({ loaderData: d }: Route.ComponentProps) {
  const { t } = useIdioma();
  const [estado, setEstado] = useState("");
  async function ativar() {
    try {
      if (!d.chave) return;
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") {
        setEstado(t("Notificações não autorizadas"));
        return;
      }
      const worker = await navigator.serviceWorker.register("/push-sw.js");
      await navigator.serviceWorker.ready;
      const chave = Uint8Array.from(
        atob(d.chave.replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0),
      );
      const inscricao = await worker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: chave,
      });
      const resposta = await fetch("/notificacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inscricao),
      });
      setEstado(
        t(
          resposta.ok
            ? "Notificações ativadas"
            : "Não foi possível ativar notificações",
        ),
      );
    } catch {
      setEstado(t("Não foi possível ativar notificações"));
    }
  }
  return (
    <>
      <h1>{t("Notificações")}</h1>
      {d.chave && <button onClick={ativar}>{t("Ativar notificações")}</button>}
      <p role="status">{estado}</p>
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
