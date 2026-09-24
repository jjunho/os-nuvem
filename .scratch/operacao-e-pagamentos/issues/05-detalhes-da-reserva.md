# 05: Reserva details and more Reserva types

**What to build:** The details real bookings carry:
- **Hotels:** room count and types (3 King + 2 Twin), a rooming list from the Viagem's Viajantes, a confirmation number per room, bed type, early check-in, upgrade and connecting-room requests, and "confirmation pending by e-mail" (Park Hyatt Busan, 5 rooms).
- **Trains:** each person's car and seat, and multi-leg journeys (a connection at Osong, ~30 min).
- **Equipe travel:** the Equipe's own flights, KTX and lodging away from base are Reservas too (K917, K903).
- **More types:** luggage forwarding (Jim Carry), car rental (Socar), and "Guia paga no local", which links the Reserva to a Despesa de campo.
- **How the Fornecedor is paid** (card charged automatically, pay on site), read from the Fornecedor (Catálogo 18) and by the Custos spec.
- Jeju extra baggage (+5 kg, K070).

Spec: `.scratch/operacao-e-pagamentos/spec.md` (story 62).

**Blocked by:** 04 (Reservas tracer), Catálogo 18 (Fornecedor conditions).

**Status:** ready-for-agent

- [ ] Fixture Park Hyatt Busan 14–15/10/2026: 5 rooms, one adult each, each with its own confirmation number.
- [ ] A KTX Reserva shows each Viajante's car and seat, and a two-leg journey with its connection.
- [ ] The Guia's Jeju flight is a Reserva on the Viagem.
- [ ] A "Guia paga no local" hotel Reserva appears in the Guia's Despesas de campo to fill.
