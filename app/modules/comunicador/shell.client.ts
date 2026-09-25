import { limparOffline } from "./offline.client";
import {
  guardarRecursos,
  registrarWorker,
} from "~/modules/notificacoes/push.client";

export async function prepararShell(usuarioId: number): Promise<void> {
  const idAnterior = localStorage.getItem("comunicador-usuario");
  if (idAnterior && idAnterior !== String(usuarioId)) await limparOffline();
  localStorage.setItem("comunicador-usuario", String(usuarioId));
  if (!("serviceWorker" in navigator)) return;
  await registrarWorker();
  await navigator.serviceWorker.ready;
  guardarRecursos();
}

export function guardarPaginaSessao(href: string): void {
  sessionStorage.setItem("comunicador-pagina", href);
}
