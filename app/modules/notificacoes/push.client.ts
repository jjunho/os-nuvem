export async function registrarWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register("/push-sw.js");
}

export function guardarRecursos(): void {
  if (!("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.ready
    .then((registro) => {
      registro.active?.postMessage({
        type: "cache-assets",
        urls: performance.getEntriesByType("resource").map((recurso) => recurso.name),
      });
    })
    .catch(() => {});
}

export async function ativarPush(
  chaveBase64Url: string,
  sinal?: AbortSignal,
): Promise<"ativa" | "recusada" | "erro"> {
  try {
    const permissao = await Notification.requestPermission();
    if (sinal?.aborted) return "erro";
    if (permissao !== "granted") return "recusada";

    const worker = await registrarWorker();
    await navigator.serviceWorker.ready;
    if (sinal?.aborted) return "erro";
    const chave = Uint8Array.from(
      atob(chaveBase64Url.replace(/-/g, "+").replace(/_/g, "/")),
      (caractere) => caractere.charCodeAt(0),
    );
    const inscricao =
      (await worker.pushManager.getSubscription()) ??
      (await worker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: chave,
      }));
    if (sinal?.aborted) return "erro";
    const resposta = await fetch("/notificacoes", {
      method: "POST",
      signal: sinal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inscricao),
    });
    return resposta.ok && !sinal?.aborted ? "ativa" : "erro";
  } catch {
    return "erro";
  }
}
