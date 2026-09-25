self.addEventListener("push", (event) => {
  const data = event.data?.json();
  if (data)
    event.waitUntil(
      self.registration.showNotification(data.titulo, {
        body: data.texto,
        data: { url: data.url },
      }),
    );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(
    event.notification.data?.url ?? "/notificacoes",
    self.location.origin,
  );
  if (url.origin === self.location.origin)
    event.waitUntil(clients.openWindow(url.href));
});
// Only cache the Comunicador shell and immutable build assets. Conversation data
// and the outbox live in IndexedDB, partitioned by the signed-in user.
const SHELL = "corealux-shell-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
self.addEventListener("message", (event) => {
  if (event.data?.type === "cache-assets")
    event.waitUntil(
      (async () => {
        const cache = await caches.open(SHELL);
        const urls = event.data.urls.filter((u) => {
          try {
            const x = new URL(u, self.location.origin);
            return (
              x.origin === self.location.origin &&
              x.pathname.startsWith("/assets/")
            );
          } catch {
            return false;
          }
        });
        await Promise.all(
          urls.map(async (u) => {
            try {
              await cache.add(u);
            } catch {}
          }),
        );
      })(),
    );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  const asset = url.pathname.startsWith("/assets/");
  const shell =
    url.pathname === "/comunicador" || url.pathname === "/comunicador.data";
  if (!asset && !shell) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(SHELL);
      try {
        const response = await fetch(event.request);
        if (response.ok && !response.redirected)
          await cache.put(event.request, response.clone());
        return response;
      } catch (e) {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        throw e;
      }
    })(),
  );
});
