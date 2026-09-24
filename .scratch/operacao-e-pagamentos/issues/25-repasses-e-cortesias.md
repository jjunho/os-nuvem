# 25: Despesa a repassar and Cortesias

**What to build:** An operator records a Despesa a repassar (tickets or extras paid for the Agência's clients, e.g. Kyoto tickets) and bills it back to the Agência with an Invoice of that type. Cortesias given during the trip (a dinner on us, extra baggage, a free extra service) are recorded with their cost, so the Custos spec's Resultado sees them. Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 72, 73).

**Blocked by:** 16 (Invoice tracer), 24 (Despesas de campo).

**Status:** ready-for-agent

- [ ] A Despesa a repassar produces an Invoice to the Agência.
- [ ] A Cortesia records its cost and appears on the Viagem.
