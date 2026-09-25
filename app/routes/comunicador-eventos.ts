import { exigirUsuario } from "~/session.server";
import { eventos, podeLer } from "~/modules/comunicador/comunicador.server";
export async function loader({ request }: { request: Request }) {
  await exigirUsuario(request);
  const enc = new TextEncoder();
  let fechar = () => {};
  const stream = new ReadableStream({
    start(controller) {
      let fechado = false;
      const mandar = (s: string) => {
        if (!fechado) controller.enqueue(enc.encode(s));
      };
      const listener = async (id: number, tipo: string) => {
        try {
          const u = await exigirUsuario(request);
          if (id === 0 || (await podeLer(u, id)))
            mandar(`data: ${JSON.stringify({ id, tipo })}\n\n`);
        } catch {
          fechar();
        }
      };
      eventos.add(listener);
      const timer = setInterval(async () => {
        try {
          await exigirUsuario(request);
          mandar(": heartbeat\n\n");
        } catch {
          fechar();
        }
      }, 15000);
      fechar = () => {
        if (fechado) return;
        fechado = true;
        clearInterval(timer);
        eventos.delete(listener);
        controller.close();
      };
      request.signal.addEventListener("abort", fechar, { once: true });
      mandar('retry: 1000\ndata: {"id":0,"tipo":"reconectar"}\n\n');
    },
    cancel() {
      fechar();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
