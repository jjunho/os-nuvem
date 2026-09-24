# 19: Alterações

**What to build:** A change after confirmação creates a new Versão from the current one (Viagem 24) and shows the price difference. On acceptance the plan is updated: existing Reservas are matched and kept, removed items become Reservas to cancel, and a hotel date change suggests the supplier's penalty, since many hotels treat it as a cancellation (K642, Catálogo 20). The Alteração records who asked (the Agência or the Viajante). In B2B, a complex or costly change is marked "levar ao parceiro", and an Agência can pre-authorise small changes ("pode fazer, manda conta depois", K167). The taxa de alteração starts at 0. A hotel change inside Seoul keeps the price; outside Seoul it is re-quoted (K092). The Agência is notified early when a problem may affect its traveller. Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 42–45).

**Blocked by:** 04 (Reservas tracer), 16 (Invoice tracer), Viagem 24 (Sending freezes a Versão).

**Status:** ready-for-agent

- [ ] Adding a Dia makes Versão 3 with the difference, and the new Dia's Reservas appear "a fazer" while existing ones stay.
- [ ] Moving a hotel stay by one day suggests the hotel's penalty.
- [ ] A pre-authorising Agência's small change needs no "levar ao parceiro".
