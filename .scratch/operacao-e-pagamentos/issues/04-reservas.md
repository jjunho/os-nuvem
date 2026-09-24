# 04: Reservas tracer

**What to build:** Each Linha de custo that needs a booking (hotel, KTX, flight, bus, restaurant, ticket, Sky Capsule) creates a Reserva to be made, with its Fornecedor chosen from a list filtered by type and region (ADR-0008). A Reserva has a state (a fazer, solicitada, em espera, confirmada, indisponível, cancelamento solicitado, cancelada), a booking code (PNR, hotel confirmation), its real cost and currency, and the cancellation terms from the Tarifário or Cotação. The sold cost from the Versão shows beside the real cost. Each hotel, flight and transfer is ours (a Reserva) or an Item de terceiros; KTX and domestic Jeju flights are always ours (K250). A waitlisted part of a group is never promoted to confirmed on its own (Grupo OM). Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 6–8, 56).

**Blocked by:** 01 (Operational plan tracer), Catálogo 17 (Fornecedores tracer).

**Status:** ready-for-agent

- [ ] Confirming a Viagem with a hotel, KTX and a ticket line creates three Reservas "a fazer".
- [ ] Recording a real cost of KRW 336,000 against a sold USD value shows the difference in USD.
- [ ] An Item de terceiros hotel creates no Reserva and still keeps its address.
- [ ] 3 of 12 waitlisted on a flight shows the split, and confirming the 9 leaves the 3 em espera.
