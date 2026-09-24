# 23: Ocorrências and their charges

**What to build:** A Guia logs an Ocorrência (delayed flight, waiting, no-show, change on the day, supplier incident such as a hanok's heating failure), and a charge is suggested when one applies, all editable: waiting beyond 90 minutes counted from landing, 10% (how often it repeats is still open with Carlos); no-show of a transfer charged in full; a same-day change of flight or transfer +20%; luggage that doesn't fit paid by the client (upgrade, extra vehicle or taxi); overtime in whole hours, +7% an hour for Guia and Assistente and +8% for the car past 9h, with no automatic night surcharge when a day planned to end before 21h runs past it (K012–K014, K490). The actual hours come from the Alocação. A charge becomes an Invoice of type Ocorrência. Spec: `.scratch/operacao-e-pagamentos/spec.md` (story 50).

**Blocked by:** 11 (Receptivos and the driver sheet), 16 (Invoice tracer).

**Status:** ready-for-agent

- [ ] A pickup waiting 2 hours from landing suggests the 10% charge.
- [ ] A no-show transfer suggests the full value.
- [ ] A 9h day that ran to 11h suggests 2 hours of overtime at 7% and 8%.
- [ ] The suggested charge becomes an Invoice in one step.
- [ ] Vertical tests in `operacao-parte7-*.spec.ts`.
