# 06: Booking windows and deadlines

**What to build:** Each Reserva shows the date its booking window opens (KTX, Sky Capsule, DMZ, K-beauty about one month before, from the Atração's booking lead time, Catálogo 06; a hotel without a published rate can't be booked yet, K177) and its deadline: the hotel cut-off, and for airlines the Tour Code requested 1–2 days before the ticketing time limit, with all tickets issued the same day (K622). A "reservar nesta semana" list and a list of overdue Reservas across all Viagens start each day. KTX on or near a holiday warns that executive seats are scarce (K465). Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 9, 12, 61).

**Blocked by:** 04 (Reservas tracer), Catálogo 06 (Planning data and closing days).

**Status:** ready-for-agent

- [ ] A KTX Reserva for a Dia 40 days away shows its window opening in 10 days, and appears in "reservar nesta semana" when it opens.
- [ ] A Jeju Air group Reserva shows the Tour Code deadline from its ticketing time limit.
- [ ] An overdue Reserva appears in the cross-Viagem list with its Viagem.
