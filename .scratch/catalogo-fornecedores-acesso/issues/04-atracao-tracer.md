# 04: Atração tracer

**What to build:** A product person creates an Atração once: official name, display name, generic name ("mercado de peixe") **and generic description** for use before confirmação (K199), city, category (palace, museum, observatory, shop, market, clinic, restaurant, experience, transport), client-facing description in português, and internal note. Every fact carries its source and the date it was checked (04:76). A salesperson picks Atrações for the manhã, almoço and tarde of a Dia, from a list already filtered by the Dia's city (ADR-0008). Free text in a Dia's programme still works. Spec: stories 1, 7, 10.

Access: Itinerários e Produtos and above edit the Catálogo. Conteúdo reads it.

**Blocked by:** 01 (Access by Papel: tracer), Viagem 11 (Orçamento tracer).

**Status:** ready-for-agent

- [ ] Create Gyeongbokgung with all fields. The generic name and description show apart from the real ones.
- [ ] On a Seoul Dia, the picker offers Seoul Atrações only. Typing narrows it. "Outro…" keeps free text.
- [ ] The picked Atrações show in the Dia's programme by slot.
- [ ] Conteúdo sees the Atração and can't edit it. Guiamento doesn't reach the Catálogo screens.
- [ ] Seed: the Atrações of the 22 Tours (`04-negocio-produto.md`) plus Jeju (K330), Andong (K418) and the additional destinations (repertório:15, 17), each with its source.
- [ ] Vertical tests in `catalogo-parte1-*.spec.ts`.
