export type InscricaoPush = {
  endpoint: string;
  chaves: { p256dh: string; auth: string };
};

export type ResultadoInscricao =
  | { ok: true; inscricao: InscricaoPush }
  | { ok: false; motivo: "payload" | "endpoint" | "servico" | "chaves" };

export function analisarInscricao(valor: unknown): ResultadoInscricao {
  if (
    typeof valor !== "object" ||
    valor === null ||
    !("endpoint" in valor) ||
    !("keys" in valor)
  )
    return { ok: false, motivo: "payload" };

  const endpoint = String(valor.endpoint);
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return { ok: false, motivo: "endpoint" };
  }

  const host = url.hostname;
  if (
    url.protocol !== "https:" ||
    !(
      [
        "fcm.googleapis.com",
        "updates.push.services.mozilla.com",
        "web.push.apple.com",
      ].includes(host) || host.endsWith(".notify.windows.com")
    )
  )
    return { ok: false, motivo: "servico" };

  const chaves = valor.keys as { p256dh?: unknown; auth?: unknown };
  if (typeof chaves?.p256dh !== "string" || typeof chaves.auth !== "string")
    return { ok: false, motivo: "chaves" };

  return {
    ok: true,
    inscricao: {
      endpoint,
      chaves: { p256dh: chaves.p256dh, auth: chaves.auth },
    },
  };
}
