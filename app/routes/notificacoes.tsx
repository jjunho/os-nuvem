import { useEffect, useRef } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/notificacoes";
import { exigirUsuario } from "~/session.server";
import {
  guardarInscricao,
  entregarPush,
} from "~/modules/notificacoes/push.server";
import { listarNotificacoes } from "~/modules/notificacoes/leituras.server";
import { useIdioma } from "~/modules/idiomas/idioma";
import { useMaquina } from "~/modules/interface/use-maquina";
import {
  transicionarInscricao,
} from "~/modules/notificacoes/estado-inscricao";
import { ativarPush } from "~/modules/notificacoes/push.client";
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
  const { estado, emitir, atual } = useMaquina(
    transicionarInscricao,
    "inativa",
  );
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
    if (!d.chave || atual() === "ativando" || !ativo.current) return;
    const controle = new AbortController();
    abortar.current = controle;
    emitir({ tipo: "ativando" });
    const fase = await ativarPush(d.chave, controle.signal);
    if (ativo.current) emitir({ tipo: "resultado", fase });
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
