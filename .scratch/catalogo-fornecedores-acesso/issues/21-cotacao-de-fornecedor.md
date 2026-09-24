# 21: Cotação de fornecedor

**What to build:** A salesperson records a Cotação de fornecedor for a specific request: dates, rooms, people, price, source, date received, validity and cut-off. It overrides the Tarifário for that line and records its source. Its outcome can also be "indisponível" (객실 마감), "sem resposta" or "aproximado". Several hotels can be compared for one request. The public **Booking price** is a Cotação with source Booking and its date, used for the first quote when no other price exists. Hotel-line defaults follow Carlos (K103, K106, K179): Deluxe or Superior, cancellable rate, breakfast for two; a demanding Cliente gets a view room of about 40 m² or more; a single traveller is booked on Booking directly.

A recent Cotação can be reused as a reference in another Viagem, across years, marked "예상 금액" (estimate, K779). Old quotes imported from Eun Bee's sheets keep the original value and formula (the ×1000 unit, K683). A sent Versão keeps the Cotação it used. Recording a Cotação is a fact the Quadros spec's Inferência reads (its "pedir cotações" Tarefa). Spec: stories 26, 49.

**Blocked by:** 19 (Tarifário tracer).

**Status:** ready-for-agent

- [ ] Fixture Homm 18–19/07: the date is in the excluded period, so the price must come from a Cotação.
- [ ] Fixture L7 at 336,000 NET with cut-off 25/08: after the cut-off, the line warns.
- [ ] A hotel with no Tarifário or Cotação asks for the Booking price and records it as a Cotação from Booking.
- [ ] "Indisponível" shows on the line and blocks nothing.
- [ ] A 2025 Cotação reused in 2026 shows as "예상 금액".
