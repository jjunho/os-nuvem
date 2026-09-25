import { expect, it, vi } from "vitest";
import { criarGravacao } from "./gravacao";

function audio() {
  const pararTrilha = vi.fn();
  const stream = {
    getTracks: () => [{ stop: pararTrilha }],
  } as unknown as MediaStream;
  const recorder = {
    state: "inactive",
    mimeType: "audio/webm",
    ondataavailable: null,
    onstop: null,
    start() {
      this.state = "recording";
    },
    stop() {
      this.state = "inactive";
      this.onstop?.();
    },
  } as {
    state: string;
    mimeType: string;
    ondataavailable: ((e: BlobEvent) => void) | null;
    onstop: (() => void) | null;
    start(): void;
    stop(): void;
  };
  return { stream, recorder, pararTrilha };
}
it("soltar enquanto espera permissão encerra a mídia sem iniciar uma gravação tardia", async () => {
  const a = audio();
  let conceder!: (s: MediaStream) => void;
  const criar = vi.fn(() => a.recorder as unknown as MediaRecorder);
  const g = criarGravacao({
    obter: () =>
      new Promise((r) => {
        conceder = r;
      }),
    criar,
  });
  const enviada = vi.fn();
  const inicio = g.iniciar(2, enviada, vi.fn(), vi.fn());
  g.parar();
  conceder(a.stream);
  await inicio;
  expect(a.pararTrilha).toHaveBeenCalledOnce();
  expect(criar).not.toHaveBeenCalled();
  expect(enviada).not.toHaveBeenCalled();
});
it("cancelar uma sessão impede seu onstop de enviar áudio para outra conversa", async () => {
  const a = audio(),
    b = audio();
  const enviada = vi.fn();
  let rodada = 0;
  const g = criarGravacao({
    obter: async () => (++rodada === 1 ? a.stream : b.stream),
    criar: (s) =>
      (s === a.stream ? a.recorder : b.recorder) as unknown as MediaRecorder,
  });
  await g.iniciar(1, enviada, vi.fn(), vi.fn());
  const stopAntigo = a.recorder.onstop;
  g.cancelar();
  await g.iniciar(2, enviada, vi.fn(), vi.fn());
  stopAntigo?.();
  expect(enviada).not.toHaveBeenCalled();
  g.parar();
  expect(enviada).toHaveBeenCalledOnce();
  expect(enviada.mock.calls[0][0]).toBe(2);
  expect(a.pararTrilha).toHaveBeenCalled();
  expect(b.pararTrilha).toHaveBeenCalled();
});
it("falha ao criar recorder libera o stream e permite tentar outra vez", async () => {
  const a = audio(),
    erro = vi.fn();
  const g = criarGravacao({
    obter: async () => a.stream,
    criar: () => {
      throw Error("recorder");
    },
  });
  await g.iniciar(1, vi.fn(), vi.fn(), erro);
  expect(a.pararTrilha).toHaveBeenCalledOnce();
  expect(erro).toHaveBeenCalledOnce();
});
