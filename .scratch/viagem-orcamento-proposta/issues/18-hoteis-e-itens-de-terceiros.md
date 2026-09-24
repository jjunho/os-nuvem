# 18: Hotels and Itens de terceiros

**What to build:** Hotels are priced apart from services, per room and night, with taxes, breakfast and the hotel safety factor, and stay outside the Margem. Rooms are assigned to the Viagem's Viajantes (ticket 02), so different hotels per traveller fit in one Viagem. The Preço por pessoa is shown per room occupancy (duplo, single). A hotel, flight or transfer can be marked as an Item de terceiros (booked by the Agência or the client), with no cost, keeping details such as the hotel address for operations. A hotel already known on the Viagem (from the lead checklist or the Formulário) is prefilled as the default hotel line (ADR-0008). **Where the hotel cost comes from (Juliano, 2026-09-24):** when CoreaLux has the hotel's price (a Tarifário or a Cotação de fornecedor), the line uses it. When it doesn't, the first quote uses the public Booking price, recorded with its source and date. Until Tarifários exist (Catálogo spec), the cost is typed by hand from those sources. Spec: stories 42, 52, 82.

**Blocked by:** 17 (Viajantes in the Orçamento).

**Status:** ready-for-agent

- [ ] Fixture: hotel 3,000 with a 20% general markup → 3,150 (outside the markup, × 1.05).
- [ ] On a Busan Dia, the hotel picker offers only Busan hotels, and no Seoul hotel appears. A Seoul hotel typed under "Outro…" links to its existing record.
- [ ] A hotel recorded on the Viagem appears as the default hotel line, with its name and address already filled in.
- [ ] A hotel line without a known price takes the Booking price, and the line shows "Booking" and the date as its source.
- [ ] Preço por pessoa shows for duplo and single.
- [ ] An Item de terceiros hotel adds nothing to the price and keeps its address.
- [ ] Scenario (1): hotel not quoted gives a services-only Orçamento.
