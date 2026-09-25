type Dependencias = {
  obter: () => Promise<MediaStream>;
  criar: (stream: MediaStream) => MediaRecorder;
};
export type FaseGravacao = "ociosa" | "permissao" | "gravando";
// Recursos do navegador pertencem à sessão que os criou, nunca à conversa do último render.
export function criarGravacao(
  deps: Dependencias = {
    obter: () => navigator.mediaDevices.getUserMedia({ audio: true }),
    criar: (stream) => {
      const mimeType = ["audio/webm", "audio/mp4", "audio/ogg"].find((m) =>
        MediaRecorder.isTypeSupported(m),
      );
      return new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    },
  },
) {
  type Sessao = {
    recorder?: MediaRecorder;
    stream?: MediaStream;
    fase: (f: FaseGravacao) => void;
  };
  let atual: Sessao | null = null;
  function cancelar() {
    const sessao = atual;
    atual = null;
    if (!sessao) return;
    if (sessao.recorder?.state === "recording") sessao.recorder.stop();
    sessao.stream?.getTracks().forEach((t) => t.stop());
    sessao.fase("ociosa");
  }
  return {
    cancelar,
    parar() {
      if (atual?.recorder?.state === "recording") atual.recorder.stop();
      else cancelar();
    },
    async iniciar(
      conversaId: number,
      enviar: (conversaId: number, arquivo: File) => void,
      fase: (f: FaseGravacao) => void,
      falhou: (erro: unknown) => void,
    ) {
      if (atual) return;
      const sessao: Sessao = { fase };
      atual = sessao;
      fase("permissao");
      try {
        const stream = await deps.obter();
        if (atual !== sessao) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        sessao.stream = stream;
        const recorder = deps.criar(stream);
        sessao.recorder = recorder;
        const partes: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size) partes.push(e.data);
        };
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          if (atual !== sessao) return;
          atual = null;
          fase("ociosa");
          enviar(
            conversaId,
            new File(partes, "voz", { type: recorder.mimeType }),
          );
        };
        recorder.onerror = (e) => {
          if (atual !== sessao) return;
          cancelar();
          falhou(e);
        };
        recorder.start();
        fase("gravando");
      } catch (e) {
        if (atual !== sessao) return;
        cancelar();
        falhou(e);
      }
    },
  };
}
