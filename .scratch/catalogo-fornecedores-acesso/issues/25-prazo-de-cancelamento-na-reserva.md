# 25: Cancellation deadline on the Reserva

**What to build:** A hotel Reserva shows the Tarifário's cancellation tiers and the last moment to cancel for free, computed with the deadline's time of day and the supplier's office hours (ticket 20). Spec: story 27.

**Blocked by:** 20 (Tarifário extras, group rates, cancellation), Operação 04 (Reservas tracer).

**Status:** ready-for-agent

- [ ] A Hidden Cliff Reserva in high season shows the free-cancellation deadline 11 days before, and counts a request after 18h from the next working day.
- [ ] The deadline appears in the Operação spec's list of upcoming deadlines.
