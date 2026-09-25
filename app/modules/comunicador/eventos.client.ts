export type EventoComunicador = { id?: number; tipo?: string };

export function abrirEventos(args: { aoEvento: (evento: EventoComunicador) => void }): () => void {
  const stream = new EventSource("/comunicador/eventos");
  stream.onmessage = (message) => {
    let evento: EventoComunicador;
    try {
      evento = JSON.parse(message.data) as EventoComunicador;
    } catch {
      // Ignore malformed event frames; the stream remains usable.
      return;
    }
    args.aoEvento(evento);
  };
  return () => stream.close();
}
