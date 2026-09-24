# 09: Restaurants and meal slots

**What to build:** Restaurants are Atrações of category restaurant, with the fields of the real sources:
- from S154 (47 restaurants in Seoul and Busan, K936): district, address, cuisine, minimum and maximum price in BRL and KRW, average price, website, Instagram, dress code, "recomendado para", Michelin distinction as the source declares it, Estrela Verde, "novo 2026";
- from the guides (S077, 22 rows): hours, last order, afternoon break, and "listed in the Kids guide" (not "suitable for children");
- view, ambience, level (simple to sophisticated), queue and fame (story 47).

A last order printed after closing time is flagged (K608). The guides are not merged with S154 (guias:42). A Dia has a generic "refeição" slot apart from a specific restaurant, and dinner and night slots besides manhã, almoço and tarde. Service items can have zero price (remote WhatsApp support on free days) or be a paid booking service (reserving a restaurant). Spec: stories 11, 40, 46, 47.

**Blocked by:** 04 (Atração tracer).

**Status:** ready-for-agent

- [ ] The seed brings the 47 S154 rows and the 22 guide rows as separate sources.
- [ ] Guide rows 26–27 (last order after closing) show the flag.
- [ ] A Dia can hold "refeição" without choosing a restaurant, and a dinner slot.
- [ ] A restaurant booking service adds its fee line. Remote support adds a zero line that still prints as included.
