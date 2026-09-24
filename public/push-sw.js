self.addEventListener("push", event => {
 const data = event.data?.json();
 if (data) event.waitUntil(self.registration.showNotification(data.titulo, { body: data.texto, data: { url: data.url } }));
});
self.addEventListener("notificationclick", event => {
 event.notification.close();
 const url = new URL(event.notification.data?.url ?? "/notificacoes", self.location.origin);
 if (url.origin === self.location.origin) event.waitUntil(clients.openWindow(url.href));
});
