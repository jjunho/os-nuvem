# 12: Resultados by period

**What to build:** Carlos lists Viagens over a period with their Resultado and real Margem (or "não verificável"), filtered and totalled by Canal comercial, Agência and Categoria de atendimento, so he sees which business is worth it; Agências are 60–80% of revenue (K181). Viagens under the 10% floor stand out. Totals say how many Viagens are still "não verificável" and exclude them from the average Margem. Admin and Faturamento only. Spec: `.scratch/custos-e-resultado/spec.md` (story 21).

**Blocked by:** 10 (Resultado da viagem tracer).

**Status:** ready-for-agent

- [ ] Three Viagens in September, two B2B and one Influencer, total by Canal comercial.
- [ ] Filtering by one Agência shows only its Viagens.
- [ ] A "não verificável" Viagem is counted apart and left out of the average.
- [ ] Speed test for the period list in `custos-velocidade.spec.ts` (ADR-0003).
