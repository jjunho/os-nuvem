# 22: Arrival and send-off move the Etapa

**What to build:** Whoever does the arrival Receptivo (Guia, Assistente, driver, or the operator on their behalf) confirms it, and the Viagem becomes em viagem. The departure Receptivo confirms the send-off at the airport, and the Viagem becomes concluída. Without a departure Receptivo, the Viagem becomes concluída at the end of its last Dia. Both are facts passed to the Inferência de etapa (ADR-0007). The Equipe conversation is archived at concluída (Comunicador 21). Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 49, 53, 71).

**Blocked by:** 11 (Receptivos and the driver sheet), Viagem 07 (Inferência de etapa — needs-info).

**Status:** ready-for-agent

- [ ] Confirming the arrival Receptivo shows em viagem on the Pipeline.
- [ ] Confirming the send-off shows concluída.
- [ ] A Viagem without a departure Receptivo becomes concluída after its last Dia ends (test clock).
