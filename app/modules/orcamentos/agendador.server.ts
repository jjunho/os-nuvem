import { avisarPrazos } from "~/modules/tarefas/tarefas.server";
import { atualizarFollowups } from "./followups.server";
let iniciado = false;
/** One timer per server process; database event keys make multiple instances safe. */
export function iniciarFollowups() {
  if (iniciado || process.env.TEST_MODE === "1") return;
  iniciado = true;
  let executando = false;
  const executar = async () => {
    if (executando) return;
    executando = true;
    try {
      await avisarPrazos(new Date());
      await atualizarFollowups(new Date());
    } catch (e) {
      console.error("Falha ao reconciliar follow-ups", e);
    } finally {
      executando = false;
    }
  };
  const timer = setInterval(() => void executar(), 60000);
  timer.unref();
  void executar();
}
