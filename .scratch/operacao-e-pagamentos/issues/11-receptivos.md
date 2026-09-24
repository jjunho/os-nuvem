# 11: Receptivos and the driver sheet

**What to build:** Each Receptivo carries the flight (or ship or bus: cruise ports and bus terminals too), the Nível de recepção and who does it (Guia, Assistente or only the driver). Groups on different flights are split into separate Receptivos. A driver sheet shows the flight's arrival and the name sign. It is also in Korean, since most drivers speak only Korean (K222), and exports as text, because outside Profissionais don't sign in. Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 22, 70).

**Blocked by:** 08 (Fleet and Alocação tracer).

**Status:** ready-for-agent

- [ ] A group on two flights gets two Receptivos with their own times.
- [ ] The driver sheet prints in Korean with the name sign.
- [ ] A Receptivo with only the driver still has everything the driver needs.
