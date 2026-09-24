# 07: Ticket prices and suggestions

**What to build:** Ticket prices live on the Atração, versioned and pinned in the Versão like the Tabelas de referência (Juliano, 2026-09-24). Picking an Atração suggests its ticket as a Linha de custo for the Viajantes of that Dia plus the Guia. The rules:
- **Zero by default (K935).** A catalogue item starts at zero cost, which needs no source. A zero-cost item doesn't replace the city's ticket kit; only a positive price does. A positive price needs its source and check date, and an estimate is flagged (Viagem ticket 15).
- **Age bands per Atração,** not fixed: adult, child, senior, infant, with limits set per Atração (months where the source uses them, K925). Senior rates apply only when the Viajante qualifies, e.g. foreigners (K391).
- **Pricing unit:** per person, per package or per block of N people (Sky Capsule USD 60 per capsule of up to 4, K081c).
- **"Guia paga"** when the guide's ticket is charged too (Haenyeo Kitchen, K072). A meal included in the ticket is marked.
- **Effect on another line:** an Atração can add a surcharge to another line for the stay, e.g. Injeodae +20% on the Jeju guide (K085, Carlos). Museum SAN and Sayuwon's +20% on the car is the regional rule outside Seoul (Viagem 13), not an Atração effect.
- **Included or optional:** optional items are never added on their own (hanbok USD 40 only on request, K390).
- **In the Margem base or not,** per Atração (K495).

Spec: stories 5, 6, 9, 39; Revisions of 2026-09-24.

**Blocked by:** 04 (Atração tracer), Viagem 14 (Tickets, Kit, Cortesia, gorjetas and transport lines), Viagem 17 (Viajantes in the Orçamento).

**Status:** ready-for-agent

- [ ] Picking DMZ (USD 20) on a Dia with 6 of 8 Viajantes suggests 7 tickets (6 + Guia).
- [ ] 5 Viajantes at Sky Capsule suggest 2 capsules.
- [ ] A zero-cost Atração leaves the city kit in place. A positive-priced one replaces it.
- [ ] A senior of 67 from Brazil gets the senior rate only if the Atração's rule allows foreigners.
- [ ] Injeodae in a Jeju Viagem raises the guide's Jeju line by 20%.
- [ ] Hanbok is offered, never added on its own.
- [ ] Changing a price creates a new version. A sent Versão keeps the old price.
- [ ] Seed, marked "a confirmar" where the acervo conflicts: the K745 block, Nanta KRW 75,000, Jeju premium 40, Songdo Cable Car 25. K411 is not used.
