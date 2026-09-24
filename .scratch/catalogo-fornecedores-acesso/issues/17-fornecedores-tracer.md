# 17: Fornecedores tracer

**What to build:** Each Fornecedor is one searchable record: type (hotel, group lodging 단체 숙소, bus company, driver, taxi, restaurant, clinic, attraction operator, airline), region, address with Hangul, star rating, check-in and check-out times, and notes. One Fornecedor can have several units with their own rules (Shinshin's 6 units, Nostalgia's 6 houses, "não misturar unidades"). Contacts carry role and purpose (reservas, comercial, MICE), e-mail, phone, mobile, fax, the year they're valid for, reservation hours, and "send to both e-mails". Similar names warn (the two Pullmans). Pickers offer Fornecedores filtered by type and the Dia's region (ADR-0008). Spec: story 19.

Access: Propostas e Orçamentos and above edit. Itinerários reads names and contacts.

**Blocked by:** 01 (Access by Papel: tracer).

**Status:** ready-for-agent

- [ ] Seed: the ~70 hotels in 7 regions and the group lodgings (S037, K288), with the contacts in `hoteis-condicoes-fornecedores.md`.
- [ ] A hotel line on a Busan Dia offers Busan hotels only.
- [ ] Creating "Pullman Seoul" when another Pullman exists warns.
- [ ] A Shinshin unit shows its own rules apart from the other units.
- [ ] Vertical tests in `catalogo-parte3-*.spec.ts`.
