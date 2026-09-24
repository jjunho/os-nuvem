# 26: The Proposta, HTML and PDF

**What to build:** A Proposta generated from a frozen Versão, so nobody assembles a deck and a spreadsheet by hand. It holds the Roteiro Dia by Dia, printing the Dia's free-text programme until Atrações exist (Catálogo spec), and the commercial part: each Opção's Preço enviado and Preço por pessoa, Incluso and Não incluso, and the Condições. Condições are filled from editable defaults (Sinal 30% and Saldo due 30 days before the trip, validity 15 days, cancellation terms, payment methods and bank details) and can be changed per Proposta. VAT is an adjustable field, not charged by default. Hotel prices are marked subject to availability. It is written in the Idioma do cliente and downloads as a PDF named "Proposta {Cliente} {AAAAMMDD} v{n}". Spec: stories 58–63, 65.

It renders only frozen data, so the same Versão always renders the same Proposta. Everything on it (Cliente, Viajantes' names, dates, hotels, language) comes from what the Viagem and the Versão already hold, and nothing is typed for the document (ADR-0008). The PDF comes from HTML through headless Chromium (ADR-0003). The first design is plain and correct.

**Blocked by:** 24 (Sending freezes a Versão).

**Status:** ready-for-agent

- [ ] The Proposta shows each Opção's Preço enviado, Preço por pessoa, Incluso and Não incluso, the Condições and the validity date (content checks, no pixel comparison).
- [ ] Editing the Condições on one Proposta leaves the defaults unchanged.
- [ ] A Spanish-speaking Cliente gets the Proposta in Spanish.
- [ ] The PDF downloads with the expected name, and re-rendering the same Versão gives the same content.
- [ ] Fixtures: card on total 2,100 → 2,205, on one 420 instalment → 441; PIX USD 100 at 5 BRL → BRL 517.50.
- [ ] Margem and Ajustes manuais never appear.
- [ ] Speed test for opening the Proposta in `parte5-velocidade.spec.ts`.
