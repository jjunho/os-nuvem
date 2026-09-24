# 19: Tarifário tracer: a hotel line priced

**What to build:** A hotel's rate card becomes data, and a hotel line takes its cost from it. **Where the cost comes from (Juliano, 2026-09-24):** when CoreaLux has the hotel's price (a Tarifário or a Cotação de fornecedor), the line uses it. When it doesn't, the first quote uses the public Booking price (Viagem ticket 18). The Tarifário holds:
- its source document attached, and its status: proposal, signed contract (Playce) or preliminary guidance ("2026 + 20.000++", Paradise);
- room categories (name, size, base and maximum occupancy, extra bed allowed);
- a validity period and currency, with excluded periods inside it and no-sell dates (Homm 17/07–16/08, Signiel's list, Park Hyatt's fireworks);
- a grid of season × day type (weekday, Friday, Saturday, Sunday, "Fri+Sun"), with overrides ("treated as Saturday", "treated as Friday", 31/12 on its own);
- the tax rule **per price**: included, "+" (tax apart), "++" (tax and service), +10%, +21%, or unknown;
- rates by occupancy (2, 3, 4 guests), room-only or with breakfast, and relative rates (Family Twin = Double + 88,000).

The hotel cost suggestion is part of the pure Cálculo de orçamento. It receives the Tarifário as data and returns the KRW cost per night with taxes, the USD value, and warnings (outside validity, no-sell date, unknown tax). Resolving a date follows the Tarifário's own bands, never the CoreaLux Temporadas. A sent Versão keeps the Tarifário it used (K921). Spec: stories 20, 21, 24, 25.

**Blocked by:** 18 (Fornecedor conditions), Viagem 16 (Supplier costs in other currencies), Viagem 18 (Hotels and Itens de terceiros).

**Status:** ready-for-agent

- [ ] Fixture Paradise Busan 2026, Deluxe City: 180/250/320/210 thousand (Mon–Thu/Fri/Sat/Sun), 500 on 31/12, +21%. A date on or after 17/07 inside the summer exclusion warns "outside validity"; 1–16/07 prices normally.
- [ ] Fixture Park Hyatt Busan 14/10/2026 (Wed): High Ocean 390 +10%.
- [ ] Fixture Shinshin Worldcup: 60 / 90 thousand with breakfast, by occupancy.
- [ ] Expired cards (Wyndham, Seaes) warn on any date.
- [ ] Changing the Tarifário after a Versão is sent leaves the Versão's price unchanged.
- [ ] Table tests for the hotel cost suggestion.
