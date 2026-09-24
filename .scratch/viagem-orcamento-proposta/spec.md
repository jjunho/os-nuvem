Status: ready-for-agent

# Spec: from first contact to Proposta

## Problem Statement

CoreaLux sells every trip by hand across three disconnected places. The pipeline spreadsheet tracks trips in a free-text "Andamento" column that mixes stages, next actions and payment. Each quote is a copy of an older spreadsheet, with hard-coded pax and room counts, broken ranges (`#REF!`, sums that skip days) and a price typed in by hand. The client-facing proposal is a slide deck with no price, while the price and conditions live in yet another spreadsheet tab. Validity and cancellation terms are almost never stated.

Leads are lost before anyone prices them. In the Respond.io history, 30 of 78 contacts never got a human reply, 33 had no owner, and one agency ready to pay chased CoreaLux five times in a week. A quote takes about three hours and the target is thirty minutes.

## Solution

Staff open a **Viagem** at the first contact, whether it comes through an Agência (B2B) or directly (B2C). A **Responsável** and a **Próxima ação** exist from the start, so no lead goes unowned or unanswered. The Viagem moves through explicit **Etapas**. The negotiation lives on the Viagem, not in a spreadsheet cell.

For a Viagem, staff build an **Orçamento** **Dia** by **Dia**, the way they already think. The system fills each **Linha de custo** with a **Valor sugerido** from the **Tabelas de referência**, and any value can be negotiated with an **Ajuste manual** (ADR-0001). One Orçamento holds several **Opções** side by side (group size, hotels, dates, category). The system computes each Opção's **Preço calculado** and **Preço por pessoa**. A person sets the **Preço enviado**.

Sending freezes a **Versão de orçamento** with its **Memória de cálculo** and produces the **Proposta**: the day-by-day Roteiro plus the commercial part (Preço enviado per Opção, Preço por pessoa, Incluso / Não incluso and Condições with validity). When the Cliente accepts one Opção, the Viagem becomes confirmada.

## User Stories

### First contact and ownership

1. As a salesperson, I want to open a Viagem the moment someone writes, so that every request exists before it has a price.
2. As a salesperson, I want a Viagem to require a Responsável on creation, so that no lead is ever unowned.
3. As a salesperson, I want a first Próxima ação "responder" created automatically with a same-business-day due date, so that the first reply is never forgotten.
4. As Carlos, I want Viagens with no human reply for 24h flagged, so that slow replies stop costing us trips.
5. As a salesperson, I want to record the Origem (Instagram, site, indicação with who referred, Agência, operadora parceira), so that we know where business comes from.
6. As a salesperson, I want to record the Meio de contato used (WhatsApp, e-mail, Respond.io, Meet, Instagram), and more than one per Viagem, so that anyone can pick up the conversation.
7. As a salesperson, I want to link Contatos to a Viagem with their role (Solicitante, Viajante), and the Cliente who pays, so that an agent, a secretary and the travellers are not confused.
8. As a salesperson, I want to record the chain Agência → Operadora → CoreaLux when there is one, with the Operadora as Cliente, so that we know who sold the trip and who pays us.
9. As a salesperson, I want to reuse an existing Contato or Agência, so that an agency sending group after group is one record.
10. As a salesperson, I want a warning when a Viagem for the same group is already open through another Agência or operadora, so that we avoid channel conflicts.
11. As a salesperson, I want to set the Canal comercial (Interep/operadora, Agência, Cliente final, Influencer), so that suggested rates match the price tier.
12. As a salesperson, I want to set the Categoria de atendimento (econômico, padrão, premium, VIP), independent of the Canal comercial, so that an Agência can buy VIP.
13. As a salesperson, I want to set the Idioma de guiamento, so that Spanish- or English-speaking requests are staffed correctly.
14. As a salesperson, I want to record trip dates, rough headcount (Pagantes and Gratuidades), ages (adults, children with their ages, infants) and cities, even if approximate, so that the lead is qualified and child and infant prices can be applied.
15. As a salesperson, I want to set the Idioma do cliente (português, espanhol, inglês), so that the Proposta and every message come out in the client's language.
16. As a salesperson, I want to send the Formulário de planejamento as a neutral link an Agência can forward to its travellers, with the answers landing on the Viagem, so that we get the profile without asking for the traveller's contact.
17. As a salesperson, I want to see the Perfil do cliente (past Viagens, preferences, restrictions, how past itineraries were received, birthday) when a known Cliente or Viajante writes again, so that returning clients are recognised.
18. As a salesperson, I want to attach the Formulário de planejamento answers to the Viagem, so that the brief is not lost in a chat.
19. As a salesperson, I want to hand a Viagem to another Responsável, and to keep the history of who owned it, so that handoffs are visible.
20. As a salesperson, I want to write negotiation notes on the Viagem with date and author, so that "Só DMZ 600 usd … usd 1600" is no longer hidden in a link cell.
21. As a salesperson, I want to close a Viagem as descartada (press, spam, partnership), so that non-leads don't pollute the pipeline.

### Etapas and the pipeline

22. As a salesperson, I want each Viagem to show exactly one Etapa (lead, em orçamento, proposta enviada, confirmada, em viagem, concluída, perdida, cancelada, descartada), so that the pipeline is readable.
23. As a salesperson, I want Próxima ação kept separate from the Etapa, with an owner and a due date, so that "preparar orçamento" is a task, not a stage.
24. As a salesperson, I want to close a Viagem as perdida with a Motivo de perda, so that we learn why we lose.
25. As a salesperson, I want a follow-up Próxima ação created 3 days after a Proposta is sent, and a suggestion to close as perdida after 3 unanswered follow-ups, so that silence is handled consistently.
26. As Carlos, I want a pipeline view of all open Viagens by Etapa, Responsável and overdue Próxima ação, so that I can see what is at risk.
27. As a salesperson, I want to link Viagens relacionadas (a group split into separately priced parts), so that the parts stay connected.

### Building an Orçamento

28. As a salesperson, I want to create an Orçamento for a Viagem, so that I can price it.
29. As a salesperson, I want to add Dias with date, city or route and Período (dia completo, meio período, dia livre, deslocamento), so that the quote follows the trip.
30. As a salesperson, I want to write the programme of each Dia (manhã, almoço, tarde), so that the same data feeds the Roteiro.
31. As a salesperson, I want to insert, remove and reorder Dias in the middle of the trip, so that changing the itinerary does not break the sums.
32. As a salesperson, I want the Dia count convention (arrival is Dia 1 or Dia 0) to be editable per Roteiro, so that both styles in use are possible.
33. As a salesperson, I want to choose which Viajantes take part in each Dia, so that "DMZ for 6, Jeju for 8" is priced correctly.
34. As a salesperson, I want Linhas de custo suggested for each Dia from its Período and the Categoria de atendimento (Guia and Assistente diárias, car, tickets, water, Cortesia), so that a quote starts filled in.
35. As a salesperson, I want the number of Guias and Assistentes suggested from the group size and Categoria de atendimento, so that staffing follows the rules without blocking me.
36. As a salesperson, I want to add any other Linha de custo (transfer, KTX, flight, hotel night, miudezas, internet, Equipe lodging, luggage, parking, restaurant), so that nothing needs a side calculation.
37. As a salesperson, I want each Linha de custo to have its own quantity, independent of pax, so that tickets can include the Guia.
38. As a salesperson, I want to mark a Linha de custo as applying to only some Viajantes, so that different hotels per traveller fit in one Viagem.
39. As a salesperson, I want the Temporada, Korean national holiday window and special events applied to the suggested rates for each date, so that seasonality is not computed by hand.
40. As a salesperson, I want the regional car surcharge suggested outside Seoul, so that I don't forget it.
41. As a salesperson, I want to enter a supplier cost in its own currency (KRW usually; JPY, EUR or BRL for trips and suppliers outside Korea) and see it converted to USD with the rule (rate × 1.10; Naver for KRW), with the rate and its date recorded, so that the Orçamento is always computed in USD.
42. As a salesperson, I want hotels priced separately from services, per room and night, with taxes, breakfast and the hotel safety factor, so that hotels stay outside the Margem.
43. As a salesperson, I want to override any Valor sugerido with a reason, and to see the original next to it, so that negotiation is fast and traceable.
44. As a salesperson, I want to mark a line as a Padrão provisório when it depends on an undecided rule, so that Carlos can see which prices rest on provisional defaults.
45. As a salesperson, I want a quick Orçamento with a single Dia and loose lines, so that a day trip is quoted in minutes.

### Opções and price

46. As a salesperson, I want several Opções in one Orçamento (e.g. 10 pagantes + 2 gratuidades and 12 + 2; 4-star vs 5-star; two date ranges; vans vs a bus), so that the Cliente can compare.
47. As a salesperson, I want the vehicle suggested from the group, with the van and bus alternatives both priced when the group is large, and groups over the bus capacity split into two vehicles, so that the operator chooses the configuration.
48. As a salesperson, I want to create an Opção by copying another and changing only what differs, so that variants take seconds.
49. As a salesperson, I want the Margem set per Opção, with the reference values for B2B and B2C offered, so that peak dates can carry a higher Margem.
50. As a salesperson, I want to see each Opção's Preço calculado step by step (services, Margem, hotels, total), so that I trust the number.
51. As a salesperson, I want the Preço enviado suggested as the total rounded up to the next USD 10, and editable, with the difference to the Preço calculado shown, so that I can negotiate the final figure.
52. As a salesperson, I want the Preço por pessoa shown per room occupancy (duplo, single), divided by Pagantes only, so that Gratuidades are carried by the group.
53. As a salesperson, I want the Margem shown as an estimate, marked "não verificável" while real costs are unknown, with a warning and a recorded reason when the estimate falls under 10%, without being blocked, so that the floor is visible but negotiation continues.
54. As Carlos, I want to be notified when a Proposta goes out with an estimated Margem under 10%, so that I can review it afterwards.

### Versões and Proposta

55. As a salesperson, I want to send an Orçamento, which freezes a Versão de orçamento, so that what the Cliente saw never changes.
56. As a salesperson, I want any change after sending to create a new Versão, with previous Versões and their Preços enviados kept, so that the negotiation history is complete.
57. As Carlos, I want each Versão to keep its Memória de cálculo (table versions, exchange rate and date, Margem, every Ajuste manual with who and why), so that any old price can be explained.
58. As a salesperson, I want a Proposta generated from a Versão: the Roteiro Dia by Dia with attraction descriptions, and the commercial part, so that I no longer assemble a deck and a spreadsheet by hand.
59. As a salesperson, I want the commercial part to show each Opção's Preço enviado and Preço por pessoa, Incluso and Não incluso, and the Condições, so that the Cliente sees terms together with the price.
60. As a salesperson, I want Condições filled from defaults (Sinal 20% and Saldo due on the first tour day per the current rule, validity 15 days, cancellation terms, payment methods and bank details) and editable per Proposta, so that terms are always stated but still negotiable.
61. As a salesperson, I want each Proposta to have a Número da proposta, so that the Cliente and staff refer to the same document.
62. As a salesperson, I want to download the Proposta as a PDF, named with the Cliente and date ("Proposta {Cliente} {AAAAMMDD} v{n}"), so that files are recognisable wherever they are sent.
63. As a salesperson, I want the Proposta written in the Idioma do cliente, so that Spanish-speaking clients in Mexico, Spain, Argentina and Colombia get it in Spanish.
64. As a salesperson, I want the Proposta to use generic names and descriptions for Atrações by default before confirmação ("mercado de peixe"), with the detailed Roteiro after, so that the itinerary isn't copied and sold elsewhere.
65. As a salesperson, I want hotel prices on the Proposta marked as subject to availability until the Reserva is confirmed, so that a rate-card price is never read as a guaranteed room.
66. As a salesperson, I want to export an Orçamento to Excel, so that Carlos can work with the numbers the way he is used to.
67. As a salesperson, I want sending a Proposta to move the Viagem to proposta enviada, so that the Etapa follows the work.
68. As a salesperson, I want to record which Opção the Cliente accepted, and when, so that the Viagem becomes confirmada with a single agreed price.
69. As a salesperson, I want a warning when a Proposta is accepted after its validity, so that I can re-check prices before confirming.

### Reference tables

70. As Carlos, I want to see and edit the Tabelas de referência (Guia and Assistente rates by Canal comercial, fleet and rates, Temporadas, Korean holidays by year, transfers, tickets, water and Cortesia by Categoria, payment factors), so that prices change without a developer.
71. As Carlos, I want every change to a Tabela de referência to create a new table version, so that old Orçamentos keep the values they were computed with.
72. As Juliano, I want the Tabelas de referência seeded from `negocio/05` and the Padrões provisórios, so that the first version starts from the documented rules.

### Added from the full source sweep

73. As a salesperson, I want the first reply template in português, espanhol, inglês and francês, asking dates, number of people, hotel, interests and "pontos que gostaria", and explaining the team's time difference, so that first contact is fast and complete.
74. As a salesperson, I want a lead checklist showing exactly which data is still missing (dates, pax and ages, hotel, mobility, food "o que você não come", restaurant level, pace) and a ready message asking for it, so that I know what to ask before quoting.
75. As a salesperson, I want to send a "Proposta genérica" when the briefing is incomplete, marked as needing adaptation, so that the client gets something fast without us pretending to know their profile.
76. As a salesperson, I want the first-reply deadline to depend on the channel (B2C shortest, Operadora short, Agência same business day), so that the most impatient clients are answered first.
77. As a salesperson, I want to record the whole Cadeia comercial (e.g. company → agency → Operadora → CoreaLux) and what each link specified (category, promises), so that we can later show what was asked.
78. As a salesperson, I want to choose the Marca of the Viagem (CoreaLux B2B, Guia na Coreia B2C), so that documents carry the right brand.
79. As a salesperson, I want to add other staff as participants on a Viagem and mention it by its Código da viagem anywhere, so that several people can follow one case.
80. As a salesperson, I want to see while quoting whether Guias and Assistentes are free on those dates, and whether a Tour needing a specific Profissional (BTS → Jessica, art → Lia) can be served, so that I don't sell what we can't staff.
81. As a salesperson, I want warnings for minimum trip rules (Agência under 3 days, Jeju under 2 days of guide), for a service that doesn't fit the Categoria de atendimento (e.g. an own small car for VIP), and when a direct price falls below the Agência price for the same service, so that exceptions are conscious.
82. As a salesperson, I want to mark a hotel, flight or transfer as an Item de terceiros (booked by the Agência or the client), with no cost, so that a services-only Proposta is possible and operations still know the hotel address.
83. As a salesperson, I want to record the Viajantes' luggage (default two 23 kg bags plus hand luggage, reducible) and what the client authorises (bigger vehicle, second vehicle, luggage truck, public transport), so that the vehicle suggestion fits people and bags.
84. As a salesperson, I want a line to require its real cost before a Versão can be sent when it charges a positive amount (e.g. an unpriced exhibition estimated at USD 30), so that no estimate reaches the client as a price.
85. As a salesperson, I want the guide's own train or flight ticket as a separate line, so that the client sees why the price is higher.
86. As a salesperson, I want the Proposta to show prices per Dia or per service when asked, never showing Margem or Ajustes manuais, and showing a Desconto when there is one, so that clients who ask for detail get it.
87. As a salesperson, I want to add B2B notes and recommendations for the agency's seller (questions to ask the traveller, suggestions), so that the Proposta is also a consultative tool.
88. As a salesperson, I want a light B2B output (a summary of services and values in text) besides the full Proposta, so that agencies that don't need a deck get a quick answer.
89. As a salesperson, I want a list of what the client wants and what the client approved, kept on the Viagem, so that negotiation doesn't depend on chat history.
90. As a salesperson, I want to paste a client's free-text request and get a first Orçamento draft (Dias and lines) to review, so that structured requests from agencies are not retyped.
91. As a salesperson, I want to import an Orçamento from an Excel file following our template, so that quotes started in a spreadsheet can come in.
92. As a salesperson, I want the Taxa de elaboração de roteiro available as an off-by-default line for B2C, paid before the Aceite and credited as a Desconto when the client books, so that we can protect design work when Carlos turns it back on.
93. As a salesperson, I want every document sent recorded as an Envio (which version, to whom, when, on which channel), so that disputes can be settled from the record.

## Implementation Decisions

- **Build order is by vertical slice**, matching the five parts in Testing Decisions: each part goes from screen to database and passes its tests before the next one starts. The transversal test is written after part 5.
- **Stack is not chosen in this spec.** The modules below are described so that they can be implemented in any stack. The earlier SOW for this project suggested TypeScript, PostgreSQL and a modular monolith; that remains the working assumption until an ADR says otherwise.
- **Modules:**
  - **Viagens**: Viagem, Contato, Agência, Cliente, roles, Responsável history, Etapa, Próxima ação, Origem, notes, Viagens relacionadas. It owns the Etapa transitions and the automatic Próximas ações (first reply, follow-up after Proposta).
  - **Tabelas de referência**: versioned tables. They only read and write reference data; they know nothing about Orçamentos.
  - **Cálculo de orçamento** (deep module, the main seam): a pure function. Its input is an Orçamento draft (Dias, Viajantes per Dia, Linhas de custo with any Ajustes manuais, Opções, Margem, Canal comercial, Categoria de atendimento) plus a pinned version of the Tabelas de referência. Its output is, per Opção: every line with its Valor sugerido and applied value, the Preço calculado step by step, the Preço por pessoa per occupancy, the real Margem and the warnings (margin floor, Padrão provisório used, comfort capacity). It has no I/O, clock or database access.
  - **Orçamentos**: stores drafts, Opções and Versões, freezes a Versão with the Memória de cálculo (the calculation output plus pinned table version and exchange rate) and holds the Preço enviado.
  - **Documentos**: renders a Proposta from a frozen Versão to HTML and PDF. It reads only frozen data, so the same Versão always renders the same Proposta.
- **Money** is an integer amount in minor units plus a currency code. Suggested and applied values are both stored on every calculated value (ADR-0001).
- **Etapa** is an explicit state, not free text. The allowed moves are lead → em orçamento → proposta enviada → em negociação → confirmada (em negociação can be skipped). Perdida and descartada can happen from any open Etapa, and cancelada only from confirmada. Moving backwards (e.g. proposta enviada → em orçamento for a new Versão) is allowed and recorded. Em viagem and concluída belong to the operations spec.
- **Identifiers**: the Código da viagem is created with the Viagem at first contact and is what people mention and search ("código do caso"); the Número de cliente (`^CLX\d{6}$`, year + sequence + Luhn) is created with the Cliente; the Número da proposta with each sent Versão. All are generated by the system and never reused.
- **"A informar" values** (ADR-0001) are part of the calculation's output: a line whose value the rules leave open is returned without a suggestion and flagged, and the Orçamentos module refuses to send a Versão while any charged line is still "a informar".
- **Rules applied by the calculation** come from `negocio/05` and `docs/padroes-provisorios.md`: add-ons applied individually to the base rate without cascading; the duration factor applied as `fator × (base + soma dos adicionais)`, with half day 0.60 and 4–6h 0.80; overtime as whole hours; night surcharge; Temporada precedence with the Korean holiday ±2-day window; regional car +20% outside Seoul; VIP car +10%; hotels, KTX and flights outside the Margem; bus with its own intermediation; rounding only on the total.

## Testing Decisions

Tests are **vertical first, then one transversal test** at the end.

- **What makes a good test:** it drives the system from the outside the way a user would (a request to the app, or the screen action behind it) through every layer down to a real database, and checks what the user would see: prices, warnings, Etapa, the Proposta's content. It never checks internal steps, and it never mocks our own modules.
- **Vertical tests, one set per part.** Each part below is built and tested as a thin slice through all layers (screen or API → module → database) before the next part starts. A part is done when its vertical tests pass.
  1. **Viagem and first contact:** create a Viagem with Responsável, Origem, Contatos and roles; the first "responder" Próxima ação and its 24h alert (controllable clock); handoff of Responsável with history; close as descartada; conflict warning for the same group through another Agência.
  2. **Etapas and pipeline:** the allowed transitions, closing as perdida with a Motivo de perda, and the pipeline view showing overdue Próximas ações.
  3. **Tabelas de referência:** edit a table, get a new version, and see that the previous version is unchanged.
  4. **Orçamento and calculation:** build an Orçamento Dia by Dia and get Valores sugeridos, Ajustes manuais with reasons, Opções, the Preço calculado step by step, the Preço por pessoa and the margin-floor warning. The fixtures are rebuilt from the real quotes in `../docs/01-extracoes-do-conhecimento-bruto/precificacao/`: Interep/Leda (13 days, 1 pax, Margem 10% vs 35%), Marcelo Xtravel (the same trip for 6 to 11 pax) and Carlos's Busan day trip. Where the old spreadsheet disagrees with the rules (KTX inside the Margem, hotel ×1.03, fixed ÷1300), the fixture follows the rules and notes the difference.
  5. **Versão and Proposta:** send an Orçamento, which freezes a Versão; a later change creates a new Versão; a later table change leaves the old Versão alone; the generated Proposta contains each Opção's Preço enviado, Preço por pessoa, Incluso / Não incluso, Condições and the validity date (content checks, no pixel comparison); accepting an Opção makes the Viagem confirmada.
- **Calculation fixtures from Carlos's decisions** (13/09/2026 update, `../docs/docs/prompt-corealux-os-atualizacao-2026-09-13.md`), each an expected output:
  base 320 + 20% add-on, half day → 230.40; car base 200 at 9h / 9h30 / 10h → overtime 0 / 0 / 16; hotel 3,000 with a 20% general markup → 3,150 (hotel outside the markup, ×1.05); team flight 200 with markup 20% → 230; 632,000 KRW at 1,350 ×1.10 → USD 514.96; bus eligible base 468 → 538.20 with no second markup; 4 clients Busan kit 30 + 1 Sky Capsule → 180, 5 clients → 2 capsules; Premium staffing 7 / 14 / 21 pax → 1+0 / 1+1 / 2+1; Jeju Saturday flight → 100; tip padrão 4 clients → 44, Premium/VIP → 80; card on total 2,100 → 2,205, on one 420 instalment → 441; PIX USD 100 at 5 BRL → BRL 517.50; revenue 1,000 with full costs 910 → real margin 9% under the floor, with costs unknown → "não verificável"; influencer payment 1,000 → commission 50, price unchanged; bus penalty 100 → 110; new B2C quote → no USD 200 fee; a Proposta on table v1 keeps v1 after the table changes.
- **Scenario fixtures from "DADOS DE INPUT PARA TESTE DO CALCULADOR"**, updated to the current rules: (1) Operadora, Premium, 12 women including seniors of 67 and 71, 28/10–01/11/2026, hotel not quoted, arrival with sign and meet & greet by an assistant, a 09–13h half day at Changdeokgung with senior tickets only if foreigners qualify, departure with check-in help; (2) incomplete input → the lead checklist asks the missing questions; (3) Agência, VIP, 11 pax over Chuseok, Seoul→Busan; (4) holiday on 15/08 with services on 14–16/08 → all inside the ±2-day window (the original fixture expected otherwise and is inverted); (5) 14 pax Premium in a Solati → seat warning, the luggage truck is not a fix; (6) "manhã" without hours → hours are asked, not assumed; (7) VIP 13 pax in a Sprinter → capacity warning (11 seated); (8) an unlisted exhibition → estimate allowed in the draft, sending blocked until the real cost is entered.
- **Inside a part,** the Cálculo de orçamento may also have fast table-driven tests at its own interface, because its combinations (season × holiday × category × pax) are too many to cover only through the screen. These add to the vertical tests and don't replace them.
- **One transversal test, written last,** passes through every step in order, using one realistic B2B case (an Agência requesting 10 pagantes + 2 gratuidades and 12 + 2 at premium) and one B2C case:
  first contact → Viagem with Responsável → first reply → Orçamento built Dia by Dia → two Opções → Ajuste manual with reason → Preço enviado → send (Versão frozen, Etapa proposta enviada, follow-up created) → negotiation creates Versão 2 → Proposta PDF → Cliente accepts one Opção → Viagem confirmada.
  It checks the state the user sees at each step, not only the end.
- There is no prior art: this is the first code in the repo.

## Out of Scope

- Operations after confirmation: Reservas, Pendências, Alocação of Equipe and vehicles, Roteiro operacional, Voucher, Aviso do dia, the em viagem and concluída stages, and the send-off. These belong to the next spec.
- Pagamentos, receipts and invoices, and the Situação de pagamento.
- Integration with Respond.io, WhatsApp, Typeform or e-mail. Conversations stay in their channel. The Formulário de planejamento answers are pasted or attached.
- Exchange-rate API, intercity-cost API and any supplier API. Rates are typed with their date.
- Client or agency portal, e-signature, a polished PDF design (the first Proposta is plain and correct), and importing old spreadsheets.
- Access by Papel, the Catálogo of Atrações, and hotel Tarifários: see `.scratch/catalogo-fornecedores-acesso/spec.md`. Until those parts exist, the Proposta prints the Dia's free-text programme and hotel lines are typed by hand.

## Further Notes

- Glossary: `CONTEXT.md`. Decisions: ADR-0001 (every rule is an editable default) and ADR-0002 (Tabelas de referência live in the system). Defaults and practice-vs-rule notes: `docs/padroes-provisorios.md`.
- Several values are Padrões provisórios (the 4–6h band at 0.80, the bus formula, the KTX holiday surcharge, children following each supplier's rules, the refund comparison in USD, the margin-floor approvers). The calculation marks every line that used one, so changing it later is a table edit. VAT is "a informar" per Proposta until Carlos decides.
