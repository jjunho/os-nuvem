# 11: Estimate vs real, line by line

**What to build:** Beside the Resultado, each Linha de custo of the accepted Versão (its Memória de cálculo, Viagem 24) is shown against the real Contas that came from it: the Reserva made for the line, the Alocações of that Dia's staff lines, the vehicle hire costs. Contas with no line (a Cortesia, an Ocorrência, an Equipe flight added later) are listed apart. Each row shows the difference in USD, so Carlos sees where the estimate was wrong, such as a hotel whose negotiated discount became real margin (K340). An Alteração compares against the Versão in force (Operação 19). Spec: `.scratch/custos-e-resultado/spec.md` (story 20).

**Blocked by:** 10 (Resultado da viagem tracer), 05 (Vehicle hire costs).

**Status:** ready-for-agent

- [ ] A hotel line sold at USD 1,200 with a real cost of USD 1,100 shows −100.
- [ ] A Guia line compared with the outside Guia's fee Conta shows the difference.
- [ ] A Cortesia appears under "not in the Versão".
- [ ] After an Alteração, the comparison uses the new Versão.
