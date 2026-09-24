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
8. As a salesperson, I want to reuse an existing Contato or Agência, so that an agency sending group after group is one record.
9. As a salesperson, I want a warning when a Viagem for the same group is already open through another Agência or operadora, so that we avoid channel conflicts.
10. As a salesperson, I want to set the Canal comercial (Interep/operadora, Agência, Cliente final, Influencer), so that suggested rates match the price tier.
11. As a salesperson, I want to set the Categoria de serviço (econômico, padrão, premium, VIP), independent of the Canal comercial, so that an Agência can buy VIP.
12. As a salesperson, I want to set the Idioma de guiamento, so that Spanish- or English-speaking requests are staffed correctly.
13. As a salesperson, I want to record trip dates, rough headcount (Pagantes and Gratuidades) and cities, even if approximate, so that the lead is qualified.
14. As a salesperson, I want to attach the Formulário de planejamento answers to the Viagem, so that the brief is not lost in a chat.
15. As a salesperson, I want to hand a Viagem to another Responsável, and to keep the history of who owned it, so that handoffs are visible.
16. As a salesperson, I want to write negotiation notes on the Viagem with date and author, so that "Só DMZ 600 usd … usd 1600" is no longer hidden in a link cell.
17. As a salesperson, I want to close a Viagem as descartada (press, spam, partnership), so that non-leads don't pollute the pipeline.

### Etapas and the pipeline

18. As a salesperson, I want each Viagem to show exactly one Etapa (lead, em orçamento, proposta enviada, confirmada, em viagem, concluída, perdida, cancelada, descartada), so that the pipeline is readable.
19. As a salesperson, I want Próxima ação kept separate from the Etapa, with an owner and a due date, so that "preparar orçamento" is a task, not a stage.
20. As a salesperson, I want to close a Viagem as perdida with a Motivo de perda, so that we learn why we lose.
21. As a salesperson, I want a follow-up Próxima ação created 3 days after a Proposta is sent, and a suggestion to close as perdida after 3 unanswered follow-ups, so that silence is handled consistently.
22. As Carlos, I want a pipeline view of all open Viagens by Etapa, Responsável and overdue Próxima ação, so that I can see what is at risk.
23. As a salesperson, I want to link Viagens relacionadas (a group split into separately priced parts), so that the parts stay connected.

### Building an Orçamento

24. As a salesperson, I want to create an Orçamento for a Viagem, so that I can price it.
25. As a salesperson, I want to add Dias with date, city or route and Período (dia completo, meio período, dia livre, deslocamento), so that the quote follows the trip.
26. As a salesperson, I want to write the programme of each Dia (manhã, almoço, tarde), so that the same data feeds the Roteiro.
27. As a salesperson, I want to insert, remove and reorder Dias in the middle of the trip, so that changing the itinerary does not break the sums.
28. As a salesperson, I want the Dia count convention (arrival is Dia 1 or Dia 0) to be editable per Roteiro, so that both styles in use are possible.
29. As a salesperson, I want to choose which Viajantes take part in each Dia, so that "DMZ for 6, Jeju for 8" is priced correctly.
30. As a salesperson, I want Linhas de custo suggested for each Dia from its Período and the Categoria de serviço (Guia and Assistente diárias, car, tickets, water, Cortesia), so that a quote starts filled in.
31. As a salesperson, I want the number of Guias and Assistentes suggested from the group size and Categoria de serviço, so that staffing follows the rules without blocking me.
32. As a salesperson, I want to add any other Linha de custo (transfer, KTX, flight, hotel night, miudezas, internet, Equipe lodging, luggage, parking, restaurant), so that nothing needs a side calculation.
33. As a salesperson, I want each Linha de custo to have its own quantity, independent of pax, so that tickets can include the Guia.
34. As a salesperson, I want to mark a Linha de custo as applying to only some Viajantes, so that different hotels per traveller fit in one Viagem.
35. As a salesperson, I want the Temporada, Korean national holiday window and special events applied to the suggested rates for each date, so that seasonality is not computed by hand.
36. As a salesperson, I want the regional car surcharge suggested outside Seoul, so that I don't forget it.
37. As a salesperson, I want to enter a supplier cost in its own currency (KRW usually; JPY, EUR or BRL for trips and suppliers outside Korea) and see it converted to USD with the rule (rate × 1.10; Naver for KRW), with the rate and its date recorded, so that the Orçamento is always computed in USD.
38. As a salesperson, I want hotels priced separately from services, per room and night, with taxes, breakfast and the hotel safety factor, so that hotels stay outside the Margem.
39. As a salesperson, I want to override any Valor sugerido with a reason, and to see the original next to it, so that negotiation is fast and traceable.
40. As a salesperson, I want to mark a line as a Padrão provisório when it depends on an undecided rule, so that Carlos can see which prices rest on provisional defaults.
41. As a salesperson, I want a quick Orçamento with a single Dia and loose lines, so that a day trip is quoted in minutes.

### Opções and price

42. As a salesperson, I want several Opções in one Orçamento (e.g. 10 pagantes + 2 gratuidades and 12 + 2; 4-star vs 5-star; two date ranges), so that the Cliente can compare.
43. As a salesperson, I want to create an Opção by copying another and changing only what differs, so that variants take seconds.
44. As a salesperson, I want the Margem set per Opção, with the reference values for B2B and B2C offered, so that peak dates can carry a higher Margem.
45. As a salesperson, I want to see each Opção's Preço calculado step by step (services, Margem, hotels, total), so that I trust the number.
46. As a salesperson, I want the Preço enviado suggested as the total rounded up to the next USD 10, and editable, with the difference to the Preço calculado shown, so that I can negotiate the final figure.
47. As a salesperson, I want the Preço por pessoa shown per room occupancy (duplo, single), divided by Pagantes only, so that Gratuidades are carried by the group.
48. As a salesperson, I want a warning when the real Margem falls under 10%, and to record why, without being blocked, so that the floor is visible but negotiation continues.
49. As Carlos, I want to be notified when a Proposta goes out under the 10% real-margin floor, so that I can review it afterwards.

### Versões and Proposta

50. As a salesperson, I want to send an Orçamento, which freezes a Versão de orçamento, so that what the Cliente saw never changes.
51. As a salesperson, I want any change after sending to create a new Versão, with previous Versões and their Preços enviados kept, so that the negotiation history is complete.
52. As Carlos, I want each Versão to keep its Memória de cálculo (table versions, exchange rate and date, Margem, every Ajuste manual with who and why), so that any old price can be explained.
53. As a salesperson, I want a Proposta generated from a Versão: the Roteiro Dia by Dia with attraction descriptions, and the commercial part, so that I no longer assemble a deck and a spreadsheet by hand.
54. As a salesperson, I want the commercial part to show each Opção's Preço enviado and Preço por pessoa, Incluso and Não incluso, and the Condições, so that the Cliente sees terms together with the price.
55. As a salesperson, I want Condições filled from defaults (Sinal 30%, Saldo due 30 days before arrival, validity 15 days, cancellation terms, payment methods and bank details) and editable per Proposta, so that terms are always stated but still negotiable.
56. As a salesperson, I want each Proposta to have a Número da proposta, so that the Cliente and staff refer to the same document.
57. As a salesperson, I want to download the Proposta as a PDF, so that I can send it on any Meio de contato.
58. As a salesperson, I want sending a Proposta to move the Viagem to proposta enviada, so that the Etapa follows the work.
59. As a salesperson, I want to record which Opção the Cliente accepted, and when, so that the Viagem becomes confirmada with a single agreed price.
60. As a salesperson, I want a warning when a Proposta is accepted after its validity, so that I can re-check prices before confirming.

### Reference tables

61. As Carlos, I want to see and edit the Tabelas de referência (Guia and Assistente rates by Canal comercial, fleet and rates, Temporadas, Korean holidays by year, transfers, tickets, water and Cortesia by Categoria, payment factors), so that prices change without a developer.
62. As Carlos, I want every change to a Tabela de referência to create a new table version, so that old Orçamentos keep the values they were computed with.
63. As Juliano, I want the Tabelas de referência seeded from `negocio/05` and the Padrões provisórios, so that the first version starts from the documented rules.

## Implementation Decisions

- **Build order is by vertical slice**, matching the five parts in Testing Decisions: each part goes from screen to database and passes its tests before the next one starts. The transversal test is written after part 5.
- **Stack is not chosen in this spec.** The modules below are described so that they can be implemented in any stack. The earlier SOW for this project suggested TypeScript, PostgreSQL and a modular monolith; that remains the working assumption until an ADR says otherwise.
- **Modules:**
  - **Viagens**: Viagem, Contato, Agência, Cliente, roles, Responsável history, Etapa, Próxima ação, Origem, notes, Viagens relacionadas. It owns the Etapa transitions and the automatic Próximas ações (first reply, follow-up after Proposta).
  - **Tabelas de referência**: versioned tables. They only read and write reference data; they know nothing about Orçamentos.
  - **Cálculo de orçamento** (deep module, the main seam): a pure function. Its input is an Orçamento draft (Dias, Viajantes per Dia, Linhas de custo with any Ajustes manuais, Opções, Margem, Canal comercial, Categoria de serviço) plus a pinned version of the Tabelas de referência. Its output is, per Opção: every line with its Valor sugerido and applied value, the Preço calculado step by step, the Preço por pessoa per occupancy, the real Margem and the warnings (margin floor, Padrão provisório used, comfort capacity). It has no I/O, clock or database access.
  - **Orçamentos**: stores drafts, Opções and Versões, freezes a Versão with the Memória de cálculo (the calculation output plus pinned table version and exchange rate) and holds the Preço enviado.
  - **Documentos**: renders a Proposta from a frozen Versão to HTML and PDF. It reads only frozen data, so the same Versão always renders the same Proposta.
- **Money** is an integer amount in minor units plus a currency code. Suggested and applied values are both stored on every calculated value (ADR-0001).
- **Etapa** is an explicit state, not free text. The allowed moves are lead → em orçamento → proposta enviada → confirmada. Perdida and descartada can happen from any open Etapa, and cancelada only from confirmada. Moving backwards (e.g. proposta enviada → em orçamento for a new Versão) is allowed and recorded. Em viagem and concluída belong to the operations spec.
- **Identifiers**: Número de cliente (`CLX` + 2-digit year + sequence + Luhn), Número da proposta and Código da viagem are generated by the system and never reused.
- **Rules applied by the calculation** come from `negocio/05` and `docs/padroes-provisorios.md`: add-ons applied individually to the base rate without cascading; half-day and the 4–6h band; overtime as whole hours; night surcharge; Temporada precedence with the Korean holiday ±2-day window; regional car +20% outside Seoul; VIP car +10%; hotels, KTX and flights outside the Margem; bus with its own intermediation; rounding only on the total.

## Testing Decisions

Tests are **vertical first, then one transversal test** at the end.

- **What makes a good test:** it drives the system from the outside the way a user would (a request to the app, or the screen action behind it) through every layer down to a real database, and checks what the user would see: prices, warnings, Etapa, the Proposta's content. It never checks internal steps, and it never mocks our own modules.
- **Vertical tests, one set per part.** Each part below is built and tested as a thin slice through all layers (screen or API → module → database) before the next part starts. A part is done when its vertical tests pass.
  1. **Viagem and first contact:** create a Viagem with Responsável, Origem, Contatos and roles; the first "responder" Próxima ação and its 24h alert (controllable clock); handoff of Responsável with history; close as descartada; conflict warning for the same group through another Agência.
  2. **Etapas and pipeline:** the allowed transitions, closing as perdida with a Motivo de perda, and the pipeline view showing overdue Próximas ações.
  3. **Tabelas de referência:** edit a table, get a new version, and see that the previous version is unchanged.
  4. **Orçamento and calculation:** build an Orçamento Dia by Dia and get Valores sugeridos, Ajustes manuais with reasons, Opções, the Preço calculado step by step, the Preço por pessoa and the margin-floor warning. The fixtures are rebuilt from the real quotes in `../docs/01-extracoes-do-conhecimento-bruto/precificacao/`: Interep/Leda (13 days, 1 pax, Margem 10% vs 35%), Marcelo Xtravel (the same trip for 6 to 11 pax) and Carlos's Busan day trip. Where the old spreadsheet disagrees with the rules (KTX inside the Margem, hotel ×1.03, fixed ÷1300), the fixture follows the rules and notes the difference.
  5. **Versão and Proposta:** send an Orçamento, which freezes a Versão; a later change creates a new Versão; a later table change leaves the old Versão alone; the generated Proposta contains each Opção's Preço enviado, Preço por pessoa, Incluso / Não incluso, Condições and the validity date (content checks, no pixel comparison); accepting an Opção makes the Viagem confirmada.
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
- Several defaults are provisional and depend on Carlos (30% Sinal / D-30, margin-floor approval, 4–6h band, KTX, bus, VAT, children). The calculation must mark every line that used a Padrão provisório, so that changing one later is a table edit rather than a code change.
