Status: ready-for-agent

# Spec: Catálogo, Fornecedores and access by Papel

Feeds both earlier specs:
- `.scratch/viagem-orcamento-proposta/spec.md`: its Proposta is written from Atração descriptions, and hotel lines take their cost from Tarifários.
- `.scratch/operacao-e-pagamentos/spec.md`: its Reservas go to Fornecedores, and its D-2 check needs Atração closing days.

## Problem Statement

What CoreaLux sells and what it buys are scattered:
- **What it sells:** the 22 Tours live in a Canva catalogue. Attraction descriptions are rewritten by hand in every slide deck; the Turis VIP and Francisco decks repeat the same Gyeongbokgung paragraph. Ready-made itineraries are links in a "Modelos de documentos" tab.
- **Hotel rates:** about 70 hotels' contacts are in one list. Each rate card is a separate PDF or spreadsheet with its own date bands, tax rule (included, +10% or +21%), breakfast and child rules and cancellation tiers. Eun Bee's hotel quotes are in a Korean calendar spreadsheet.
- **Pricing in practice:** a hotel price is looked up, converted with a fixed rate and typed into the quote. The knowledge base warns again and again: don't carry a rate card into another year, and don't pick one version of conflicting values silently.

Everyone also sees everything. Carlos wants access by area:
- Calculations only for Propostas and above.
- Itinerários may see single prices but not calculate.
- Guiamento needs care: a Guia works in the field, on a phone, with clients' personal data.
- Faturamento is the most sensitive.

## Solution

**Catálogo.** The system keeps a Catálogo of **Atrações**, **Tours**, **Módulos** and **Roteiros-modelo**. A Dia's programme is built by picking Atrações (free text stays possible). Doing so:
- puts each Atração's client-facing description and photos into the Proposta;
- suggests its tickets as Linhas de custo;
- warns when the Dia falls on a closing day.

A Viagem can start from a Roteiro-modelo, and a Módulo can be dropped into any Roteiro.

**Fornecedores.** Each hotel, transport company, restaurant, clinic or attraction operator has contacts and conditions. Hotels also have **Tarifários** per validity period. When a hotel line is added to an Orçamento, the system:
- suggests the cost from the valid Tarifário for those dates, room category and occupancy;
- adds taxes, breakfast and extra person as the Tarifário says;
- converts KRW with the rule.

If no Tarifário is valid, or one exists but a **Cotação de fornecedor** was received, the line uses the quote and records its source.

**Access by Papel.** Each staff member has one **Papel**. Money is visible only from Propostas e Orçamentos up:

| Papel | What it adds |
|---|---|
| Admin | Everything, plus users and Tabelas de referência |
| Faturamento | Pagamentos, Invoices, reconciliation, Contas a pagar, Resultado da viagem |
| Propostas e Orçamentos | Calculation, Opções, Preço enviado, Propostas |
| Itinerários e Produtos | Catálogo and Roteiros. Can see single prices but not totals or Margem |
| Guiamento | Own Alocações, the Roteiro operacional, Incluso / Não incluso, and the Dados de viagem and Observações para a Equipe needed for them. No prices |
| Conteúdo | Catálogo read-only and general content |

## User Stories

### Atrações

1. As a product person, I want to create an Atração with official name, display name, generic name ("mercado de peixe"), city, category (palace, museum, observatory, shop, market, clinic, restaurant, experience, transport), client-facing description and internal note, so that it's written once.
2. As a product person, I want an Atração's client-facing description in português, espanhol and inglês, with documents falling back to português and warning when a translation is missing, so that Spanish-speaking clients get Spanish documents.
3. As a product person, I want to attach photos to an Atração with their source and usage rights, so that proposals only use images we may use.
4. As a product person, I want to record an Atração's closing days and seasonal notes (e.g. Gyeongbokgung closed on Tuesdays, cherry blossom in April), so that itineraries avoid closed days.
5. As a product person, I want reference ticket prices per Atração by age band (adult, child, senior) and by currency, with the date they were checked, so that tickets are suggested from real data.
6. As a product person, I want to mark an Atração as free, so that the zero cost doesn't look like a missing price.
7. As a salesperson, I want to pick Atrações for the manhã, almoço and tarde of a Dia, so that the programme, tickets and descriptions come together.
8. As a salesperson, I want a warning when a Dia's date is a closing day of one of its Atrações, so that we don't send people to a closed palace.
9. As a salesperson, I want picking an Atração to suggest its ticket as a Linha de custo for the Viajantes of that Dia plus the Guia, so that tickets are not forgotten or miscounted.
10. As a salesperson, I want to still type free text in a Dia's programme, so that one-off visits don't need a catalogue entry first.
11. As a product person, I want restaurants in the Catálogo with city, cuisine, price band, Michelin distinction as declared by the source, and suitability for children, so that the restaurant guides stop being separate slide decks.

### Tours, Módulos and Roteiros-modelo

12. As a product person, I want each Tour to hold its published data (region, Atrações, duration, group size, languages, days of operation, meeting point, transport, Incluso / Não incluso), so that the catalogue lives in the system.
13. As a product person, I want to keep the Tour's published duration separate from the 9h working-day reference, so that the catalogue does not change pricing.
14. As a salesperson, I want to add a Tour to a Dia and get its Atrações, programme and suggested Linhas de custo, so that a catalogue day is priced in one step.
15. As a product person, I want to build Módulos from Atrações and Linhas de custo (e.g. "Dia de autocuidados"), so that recurring blocks are reused across proposals.
16. As a salesperson, I want to start a Viagem's Roteiro from a Roteiro-modelo and adapt it, so that common trips start 80% done.
17. As a product person, I want to save any Viagem's Roteiro as a new Roteiro-modelo, stripped of prices, Descontos and Ajustes manuais, so that good itineraries become reusable without leaking one client's negotiated values to another.
18. As a salesperson, I want to generate the B2B catalogue (Tours without prices) as a PDF from the Catálogo, so that the Canva version can be retired.

### Fornecedores and Tarifários

19. As an operator, I want each Fornecedor with type, region, contacts (role, e-mail, phone, mobile) and notes, so that the hotel list becomes searchable.
20. As an operator, I want to record a hotel's room categories (name, size, base and maximum occupancy, extra bed allowed), so that the right room is quoted.
21. As an operator, I want to enter a Tarifário with a validity period, currency, date bands (weekday, Friday, Saturday, Sunday, named special dates), rate per category and band, and whether taxes are included or added (+10%, +21%), so that the rate card is data, not a PDF.
22. As an operator, I want the Tarifário's extras (breakfast in advance vs on site, extra person, extra bed, child age rules), group threshold (e.g. from 10 rooms) and cancellation tiers, so that a quote includes everything the hotel charges.
23. As an operator, I want to mark a Tarifário value as "a confirmar" when the source is ambiguous, so that it's never used silently.
24. As an operator, I want a warning when an Orçamento date falls outside every Tarifário of the chosen hotel, so that an old year's rate is never used.
25. As a salesperson, I want a hotel line to suggest the cost from the valid Tarifário for the dates, room category, rooms and occupancy, with taxes and breakfast, and converted to USD with the rule, so that hotels are priced in seconds.
26. As a salesperson, I want to record a Cotação de fornecedor for a specific request (dates, rooms, people, price, source, date received, cut-off), and have it override the Tarifário for that line, so that e-mailed quotes are used and traceable.
27. As an operator, I want the Reserva of a hotel to show the Tarifário's cancellation tiers and the deadline for free cancellation, so that we cancel in time.
28. As an operator, I want non-hotel Fornecedores (bus company, driver, restaurant, clinic) with their own conditions (e.g. bus cancellation percentages by days before), so that their penalties feed the refund suggestion.

### Access by Papel

29. As Carlos, I want to give each staff member one Papel, so that access follows responsibility.
30. As Carlos, I want Guiamento users to see only their own Alocações, the Roteiro operacional of those Dias and the Dados de viagem they need (names, flights, emergency contact), so that personal data and prices stay protected.
31. As Carlos, I want Itinerários e Produtos users to edit the Catálogo and Roteiros and see single-line prices, but not totals, Margem or Preço enviado, so that calculation stays with Propostas.
32. As Carlos, I want only Propostas e Orçamentos and above to build Orçamentos, set Margem and Preço enviado, and send Propostas, so that pricing is done by the right people.
33. As Carlos, I want Pagamentos, Invoices, Contas a pagar and the Resultado da viagem visible only to Faturamento and Admin, so that the most sensitive data is limited.
34. ~~Atendimento Papel~~ Removed on 2026-09-24: whoever takes first contact is Propostas e Orçamentos (Juliano). The Atendimento Papel came only from an unapproved plan (K447) and is not in Carlos's list of 13/09.
35. As a Guia, I want to see what is and isn't included for each of my Dias without any value, so that I know what to do and what to refuse.
36. As Carlos, I want only Admin to manage users and Tabelas de referência, so that the rules can't be changed by accident.
37. As a user, I want screens and fields I can't access to be hidden rather than shown as errors, so that the app is simple for each Papel.
38. As Carlos, I want a record of who viewed or exported Dados de viagem, so that passport data access is traceable.

### Added from the full source sweep

39. As a product person, I want Atração fields for indoor/outdoor, cost tier (free, cheap up to USD 5, expensive), near/far, opening hours, address, menu and price band (restaurants), and ticket price per person or per package, so that the catalogue supports planning and search.
40. As a product person, I want a generic "refeição" slot distinct from a specific "restaurante", and dinner and night slots in a Dia besides morning, lunch and afternoon, so that programmes can stay vague or be precise.
41. As a product person, I want Dia models from the catalogue (transfer in/out, Seul centro/moderna/museus/fronteira, Busan moderno/antigo, Gyeongju, Jeju oeste/leste/museus, Gapyeong, Andong, Wonju), so that a Roteiro is assembled from proven days.
42. As a product person, I want a Tour's status (active, hidden, beta), so that products like Suwon or Sokcho can be kept out of sale or sold cautiously.
43. As a product person, I want a Tour or Módulo to name the Profissional it requires, so that specialist products are checked for availability.
44. As a product person, I want to rate Roteiros-modelo by quality (five stars to "não dá para fazer"), so that the best ones are reused first.
45. As a product person, I want photos tagged (with or without people, season, place) and marked as ours or external (e.g. KTO), so that the right, usable image is chosen.
46. As a product person, I want service items with zero price (remote WhatsApp support on free days) and paid booking services (reserving a restaurant), so that these offers appear in quotes.
47. As a product person, I want restaurants with view, ambience, level (simple to sophisticated), queue and fame, so that the food questions in the briefing can be matched.
48. As an operator, I want Fornecedores of type taxi and driver-for-the-client's-car (USD 100/day, 60% half day, USD 12/h overtime, +15% night, Seoul area), so that these services can be quoted.
49. As an operator, I want to reuse a recent Cotação de fornecedor as a reference for another Viagem in the same season, marked as reference, so that recent real prices aren't lost.
50. As Carlos, I want a general percentage adjustment on the Tabelas de referência (e.g. +3% after the exchange rate moves), creating a new version, so that all prices move in one step.
51. ~~LGPD legal basis~~ Dropped for now (Juliano, 2026-09-24): no source in the acervo. As Carlos, I want the Perfil do cliente to record the legal basis or consent for keeping history (LGPD), so that client history is kept lawfully.

## Implementation Decisions

- **Build order is by vertical slice,** matching the parts in Testing Decisions. The Atrações part should be built before part 5 of the first spec (Versão and Proposta), so the Proposta can use Atração descriptions. Until then, the Proposta prints the Dia's free-text programme.
- **Modules** added to the earlier ones:
  - **Catálogo:** Atrações, Tours, Módulos, Roteiros-modelo. It is read by Orçamentos (to suggest lines and warn about closing days) and by Documentos (for descriptions and photos).
  - **Fornecedores:** Fornecedores, contacts, room categories, Tarifários, Cotações de fornecedor and conditions.
  - **Acesso:** users, their login and password hash (ADR-0005), and their Papel. It is checked at every command and every read, not only in the screens.
- **Hotel cost suggestion** is part of the Cálculo de orçamento. Its inputs are the hotel line (hotel, category, dates, rooms, occupancy), the valid Tarifário and any Cotação de fornecedor. Its outputs are the KRW cost per night with taxes and extras, the USD value, and warnings: out of validity, "a confirmar" value used, group threshold reached. The calculation stays pure and receives the Tarifário as data.
- **Tarifário date bands** are stored as explicit date ranges and weekday rules per validity period. Resolving a date to a band follows the Tarifário's own rules, never the CoreaLux Temporadas.
- **Photos** store their source and usage-rights note. The Proposta only uses photos marked usable.
- **Papel is one fixed profile per user,** not a free permission matrix. Carlos listed the Papéis from the highest to the lowest (13/09, S153): Admin, Faturamento, Propostas e Orçamentos, Itinerários e Produtos, Guiamento, Conteúdo. Profiles are still not a strict ladder: Guiamento sees no money and is restricted to its own Alocações, and Itinerários sees single prices only. This is the smallest model that expresses Carlos's proposal. A finer matrix can come later if needed.

## Testing Decisions

The tests are vertical first, then one transversal test at the end.

- A good test drives the system from the outside, down to a real database. It checks what the user sees: suggestions, warnings, document content and what a Papel can and can't reach. It never mocks our own modules.
- **Vertical tests, one set per part:**
  1. **Atrações:**
     - Create an Atração with photos and closing days.
     - Picking it in a Dia gives the ticket suggestion (Viajantes of that Dia plus the Guia) and a closing-day warning (Gyeongbokgung on a Tuesday).
     - The Proposta prints its description.
  2. **Tours, Módulos and Roteiros-modelo:**
     - Adding a Tour to a Dia brings its Atrações and lines.
     - A Módulo dropped into a Roteiro.
     - Starting a Viagem from a Roteiro-modelo, and saving a Roteiro as a new one.
     - The B2B catalogue PDF contains the Tours and no prices.
  3. **Fornecedores and Tarifários.** Fixtures are rebuilt from the real rate cards in `../docs/negocio/hoteis-condicoes-fornecedores.md`:
     - Paradise Busan 2026: weekday/Friday/Saturday/Sunday bands, +21%, summer excluded, so there is an out-of-validity warning in July.
     - Park Hyatt Busan 2026: +10% VAT, special high dates.
     - Maison Glad Jeju: taxes included, child rules.

     A hotel line gives the expected KRW and USD. A Cotação de fornecedor overrides the Tarifário. A value marked "a confirmar" produces a warning.
  4. **Access by Papel:** for each Papel, a fixed list of screens and commands it can and can't reach:
     - a Guiamento user sees only their own Alocações and no prices;
     - an Itinerários user sees line prices but not totals;
     - only Faturamento and Admin see Pagamentos;
     - only Admin edits Tabelas de referência.

     These are tested through the app's requests, not only by hiding buttons.
- **The transversal test is written last.** It reruns the first two specs' B2B transversal case with Papéis and Catálogo in place:
  1. A Propostas user starts the Viagem from a Roteiro-modelo.
  2. They add a Tour, an Atração on a closing day (warned and changed), and a hotel priced from a Tarifário.
  3. They send the Proposta, which carries the Atração descriptions.
  4. After confirmação, a Guia logs in from outside the office and sees only their Dias, without prices.
  5. Faturamento records the Sinal.

  At each step, it checks what that Papel sees.

## Out of Scope

- External data sources for Atrações and photos (VisitKorea, Naver, data.go.kr), weather, and live flight arrivals. These are future research topics in the docs, not decisions.
- The RH area and the Relato diário or task board mentioned in the docs. They are internal-work tools, not part of the trip flow.
- A client-facing catalogue website.
- Supplier portals, and online booking with Fornecedores.
- Machine translation. Descriptions in espanhol and inglês are written by people; the system only stores and uses them.

## Further Notes

- New glossary terms: Tour (refined), Atração, Módulo, Roteiro-modelo, Tarifário, Cotação de fornecedor, Papel.
- Sources:
  - Catálogo: `../docs/negocio/04-negocio-produto.md` and the catalogue extraction S038.
  - Hotels: `../docs/negocio/hoteis-condicoes-fornecedores.md`, `hoteis-cotacoes-e-casos.md` and `01-extracoes-do-conhecimento-bruto/hoteis/`.
  - Papéis: the 13/09/2026 meeting record in `01-extracoes-do-conhecimento-bruto/comunicacao-e-reunioes/comunicacao-2026-09-13-online-corealux-os.md`.
- **The docs themselves flag known issues.** Tarifário values with a known conflict must be entered as "a confirmar", never resolved by picking one:
  - Sokcho's description copies Gangneung's.
  - Several meeting points are marked "?".
  - Park Hyatt 2027 has three conflicting values.
  - Maison Glad's child ages disagree.

## Revisions of 2026-09-24

A full read of `../docs/negocio` found gaps, now carried by the tickets in `issues/`. Decisions taken with Juliano:
- **Hotel cost:** when CoreaLux has the hotel's price (Tarifário or Cotação de fornecedor), the line uses it; when it doesn't, the first quote uses the public Booking price, recorded with its source and date.
- **Ticket prices** live on the Atração, versioned and pinned in the Versão like the Tabelas de referência. A catalogue item starts at zero cost (K935); only a positive price needs a source and a check date. Story 6's "free" mark is replaced by that rule.
- **No Atendimento Papel** (story 34 removed).
- **The +20% outside Seoul** is on the car only (Viagem spec). Museum SAN and Sayuwon's +20% on the car is this regional rule, not a property of the Atração.
- **Story 50 stays:** a settable general percentage on the Tabelas, for when the exchange rate moves too much, separate from the ×1.10 factor (supersedes K532).
- **Story 51 (LGPD) is dropped for now.**
- **Pagamentos** don't appear in the app yet; their access rules come with them.
- **Profissionais** are built here (the Custos spec reads them).
- The known conflicts to enter as "a confirmar" are far more than the four listed above; ticket 20 lists them. Sokcho and the "?" meeting points are Catálogo fields, not Tarifário values.
