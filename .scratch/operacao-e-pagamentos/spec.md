Status: ready-for-agent

# Spec: from confirmação to the send-off, with Pagamentos

Depends on: `.scratch/viagem-orcamento-proposta/spec.md` (a Viagem reaches confirmada with one accepted Opção and a frozen Versão de orçamento).

## Problem Statement

Once a Cliente confirms, the work scatters across more places:
- **Bookings and to-dos:** what still has to be booked or sent (hotel vouchers, KTX, K-ETA, cable-car tickets) is typed in capitals inside a Word itinerary ("COMPRAR KTX OK").
- **Staff and vehicles:** a separate tour-agenda spreadsheet assigns people and cars by date, in parallel columns, with grey cells for "a confirmar".
- **The voucher:** a Word document retyped for every trip and every change.
- **Payments:** confirmed by screenshots in WhatsApp and written in a "PGTO" cell ("Pagou 20% de sinal pelo pix. Faltam 80%").
- **Field expenses:** kept in a Korean spreadsheet per trip.
- **Evening messages:** someone types the next day's pickup time and guide phone by hand each evening, and the guide is sometimes decided only the day before.

Nothing warns when the balance is unpaid but non-refundable tickets are about to be bought. Nothing warns when a guide is booked on two trips the same day. And nothing marks the end of the trip.

## Solution

Confirming a Viagem turns the accepted Opção into its **operational plan**, and the system proposes work from that plan:

- **Reservas and Pendências:** the Reservas to make with Fornecedores, and the Pendências due before each Dia, each with a due date.
- **Alocação:** staff assign Equipe and vehicles to each Dia, and see every Alocação across Viagens by date. The system warns about double-booking and missing assignments.
- **Voucher:** generated from the plan and reissued as a new version when anything changes.
- **Aviso do dia:** prepared each evening from the Alocação.
- **Pagamentos:** recorded with method, currency and proof. The **Situação de pagamento** is always visible, and the system warns before non-refundable items are bought while the Saldo is unpaid.
- **Alterações:** a change after confirmation creates a new Versão and a price difference.

During the trip the Equipe logs **Ocorrências** and **Despesas de campo**. The arrival **Receptivo** moves the Viagem to em viagem. The departure Receptivo, the send-off, moves it to concluída and suggests the goodbye and review message.

## User Stories

### Confirmação and the operational plan

1. As a salesperson, I want confirming a Viagem to copy the accepted Opção's Dias, Viajantes and Linhas de custo into its operational plan, so that operations start from what was sold.
2. As a salesperson, I want the Código da viagem generated on confirmação, so that the Voucher and the team use one identifier.
3. As an operator, I want to collect each Viajante's Dados de viagem (passport name, date of birth, passport number and validity, flights, diet, accessibility, emergency contact), so that bookings, DMZ entry and airline lists are right.
4. As an operator, I want a warning when a passport expires less than 6 months after the trip, or when data needed by a booked item is missing, so that nobody is stopped at a border or a checkpoint.
5. As an operator, I want to generate a lista de passageiros for an airline or attraction from the Dados de viagem, so that I no longer retype names and passports.

### Reservas and Pendências

6. As an operator, I want each Linha de custo that needs a booking (hotel, KTX, flight, bus, restaurant, ticket, Sky Capsule) to create a Reserva to be made, so that nothing sold is forgotten.
7. As an operator, I want each Reserva to have a Fornecedor, a state (a fazer, solicitada, confirmada, cancelada), a booking code (PNR, hotel confirmation), its real cost and currency, and its cancellation terms, so that the booking is complete in one place.
8. As an operator, I want to see the difference between the cost sold in the Versão and the real cost of each Reserva, so that the real Margem is known.
9. As an operator, I want Reservas with booking deadlines (KTX, DMZ, Sky Capsule, Jeju flights, hotels) to show their deadline, so that we book before things sell out.
10. As an operator, I want Pendências per Dia (send train tickets, K-ETA guidance, receive hotel voucher, confirm restaurant, passport reminder for the DMZ), with a due date and done/not done, so that the checklist lives next to the Dia.
11. As an operator, I want a D-2 check per Dia (opening hours, times, programme, closures, travel time), so that the "checklist d-2" column finally gets filled.
12. As an operator, I want a list of overdue Reservas and Pendências across all Viagens, so that I start each day from what is at risk.

### Alocação and the agenda

13. As an operator, I want to allocate Guias, Assistentes, drivers and vehicles to each Dia of a Viagem, so that everyone knows who works where.
14. As an operator, I want the suggested Equipe for each Dia to come from the Categoria de serviço and the Viajantes taking part, so that staffing follows the sale.
15. As an operator, I want a warning when the same person or vehicle is allocated to two Viagens at the same time, so that double-booking is caught.
16. As an operator, I want to mark people as unavailable (folga, other commitments), so that the warnings know about them.
17. As an operator, I want an Alocação to be "a confirmar" until it is confirmed, and a list of Dias in the next 7 days still without a confirmed Guia, so that late staffing is visible early.
18. As an operator, I want to allocate outside professionals and external vehicles with their own contact, so that freelancers and rented vans fit the same agenda.
19. As an operator, I want a warning when the Viajantes plus Equipe exceed a vehicle's net capacity, or when luggage needs a separate truck, so that the car fits.
20. As Carlos, I want the agenda: every Dia of every Viagem by date, with city, Cliente, programme, Equipe, vehicle and whether car, tickets, lunch and hotel are confirmed, so that the tour-schedule spreadsheet can go.
21. As a Guia, I want to see my own Alocações and the Roteiro operacional of each Dia, so that I arrive prepared.

### Voucher and Roteiro operacional

22. As an operator, I want the Voucher generated from the operational plan (Código da viagem, Responsável and phone, Viajantes, emergency contact, Receptivos and deslocamentos with the person in charge and their phone, Hospedagem with check-in and check-out, Guiamento per Dia with meeting time and activities), so that I never retype it.
23. As an operator, I want any change to the plan to let me issue a new Voucher version, with previous versions kept, so that the client always has the latest one and we know what they had.
24. As an operator, I want to attach tickets and booking confirmations to the Voucher ("com os tickets"), so that the client has everything in one file.
25. As an operator, I want the Roteiro operacional for the Equipe (times, addresses, bookings, Pendências, notes), so that the internal plan is separate from the client document.

### Pagamentos

26. As a salesperson, I want the Sinal and Saldo due dates and amounts set from the accepted Proposta's Condições, so that payment follows what was agreed.
27. As a salesperson, I want to record each Pagamento with date, amount, currency, method (PIX, Wise, cartão, espécie) and proof, so that screenshots stop being the record.
28. As a salesperson, I want PIX in BRL computed from the USD amount (rate of the day × 1.035) and card payments with +5%, as editable suggestions, so that I quote the right amount for each method.
29. As a salesperson, I want the Situação de pagamento (sem sinal, sinal recebido, pago) and the open Saldo always visible on the Viagem, so that nobody asks "did they pay?".
30. As a salesperson, I want a Próxima ação created before the Saldo due date and an alert when it passes, so that balances are chased on time.
31. As an operator, I want a warning when I mark a non-refundable Reserva as solicitada while the paid amount does not cover it, so that we don't pay for tickets the client hasn't covered.
32. As a salesperson, I want to generate a receipt or invoice from a Pagamento, broken down by Dia when the Cliente asks, so that the "Template Recibo Tour" is filled automatically.
33. As a salesperson, I want to record a Saldo collected during the trip by the Equipe, so that mid-trip payments are not lost.

### Alterações and cancelamento

34. As a salesperson, I want an Alteração after confirmação to create a new Versão de orçamento and show the price difference, so that changes are priced like the original.
35. As a salesperson, I want the taxa de alteração available (starting at 0), so that customised packages can be charged when agreed.
36. As a salesperson, I want to cancel a confirmada Viagem with a Motivo de perda, so that cancelada differs from perdida.
37. As a salesperson, I want the refund suggested on cancelamento: supplier penalties per Reserva, 10% processing on non-refundable third-party items, our own cancellation terms, and the smaller of the USD or BRL amount, so that refunds follow the Condições.

### During the trip and the send-off

38. As an operator, I want the Aviso do dia prepared each evening for the next Dia (meeting time and place, Guia and phone, what to bring), ready to copy into the client's channel, so that nobody types it from scratch.
39. As a Guia, I want to confirm the arrival Receptivo, so that the Viagem moves to em viagem.
40. As a Guia, I want to log an Ocorrência (delayed flight, waiting beyond 90 minutes, no-show, change on the day, supplier incident), with a suggested charge when one applies, so that extra costs are billed and incidents are known.
41. As a Guia, I want to log Despesas de campo with the card used (company or personal), amount in KRW and a photo of the receipt, so that my expenses are reconciled without a spreadsheet.
42. As an operator, I want to reconcile a Viagem's Despesas de campo after it ends, with personal-card totals to reimburse, so that guides are repaid correctly.
43. As a Guia, I want to confirm the departure Receptivo (the send-off at the airport), so that the Viagem moves to concluída.
44. As a salesperson, I want the goodbye and review-request message suggested when the Viagem becomes concluída, so that every trip ends with a thank-you and feedback.
45. As Carlos, I want a warning when a concluída Viagem still has an open Saldo, unreconciled Despesas de campo or open Ocorrências, so that nothing is left hanging.

## Implementation Decisions

- **Build order is by vertical slice**, matching the parts in Testing Decisions. Each part goes from screen to database and passes its tests before the next one starts. The transversal test comes last.
- **Modules** (added to those of the first spec):
  - **Operação:** the operational plan per Viagem (Dias, Viajantes per Dia, Reservas, Pendências, Receptivos, Ocorrências). It is created from the accepted Opção on confirmação and changed only through the Viagem's own commands. It owns the em viagem and concluída transitions, driven by the arrival and departure Receptivos.
  - **Alocação:** people, vehicles, their availability and their assignment to Dias. Conflict and capacity checks are computed across all Viagens. It exposes the agenda by date.
  - **Pagamentos:** Pagamentos, due dates derived from the Condições, the Situação de pagamento and the refund suggestion. The refund suggestion is a pure calculation: inputs are the Pagamentos, the Reservas with their penalties and the Condições; outputs are amounts and reasons.
  - **Despesas de campo:** expenses per Viagem and Dia, receipts, reconciliation.
  - **Documentos** (from the first spec) gains Voucher, Roteiro operacional, receipt or invoice, lista de passageiros and Aviso do dia. As with the Proposta, each render reads a fixed snapshot, so a Voucher version always renders the same.
- An **Alteração** reuses the Orçamentos module: it creates a new Versão from the current one, and on acceptance the operational plan is updated from the new Versão. Existing Reservas are matched and kept, and removed items become Reservas to cancel.
- **Money** stays integer minor units plus currency. Pagamentos may be in USD, BRL or KRW. Each Pagamento stores the exchange rate used to count it against the Preço enviado in USD.
- **Dados de viagem** are personal data. They are stored per Viajante, shown only to logged-in staff, and exported only through the documents that need them (lista de passageiros, Voucher names).
- **Availability conflicts and capacity limits warn and never block**, in line with ADR-0001.

## Testing Decisions

The tests are vertical first, then one transversal test at the end.

- **A good test** drives the system from the outside, through a request to the app or the screen action behind it, down to a real database. It checks what the user sees: stages, warnings, amounts and document content. It never mocks our own modules.
- **Vertical tests, one set per part.** Each part is built and passing before the next one starts:
  1. **Confirmação and Dados de viagem:**
     - The accepted Opção becomes the operational plan, and the Código da viagem is generated.
     - Passport and missing-data warnings.
     - The lista de passageiros export.
  2. **Reservas and Pendências:**
     - Reservas are created from Linhas de custo, with states and booking codes.
     - The real-cost vs sold-cost difference.
     - Deadline and overdue lists, and the D-2 check.
  3. **Alocação and agenda:**
     - Allocating Equipe and vehicles, and unavailability.
     - Double-booking and capacity warnings across two Viagens.
     - "A confirmar" and the 7-day list without a Guia.
     - The agenda by date.
  4. **Voucher and Roteiro operacional:**
     - The generated Voucher contains the Receptivos, Hospedagem and Guiamento with the right people and phones.
     - A change followed by reissue gives version 2, and version 1 is kept.
  5. **Pagamentos:**
     - Due dates come from the Condições.
     - Pagamentos in USD, BRL (PIX ×1.035) and card (+5%).
     - The Situação de pagamento, the Saldo reminder and the non-refundable-without-cover warning.
     - A receipt broken down by Dia.
  6. **Alterações and cancelamento:**
     - An Alteração creates a new Versão and a price difference, and the plan is updated with its Reservas matched.
     - Cancelamento gives cancelada, with the refund suggestion. Fixtures cover a bus penalty (20% at D-4, up to 100% on the day), a non-refundable KTX ticket with 10% processing, and a BRL vs USD refund.
  7. **During the trip and send-off:**
     - The Aviso do dia is prepared from the Alocação.
     - The arrival Receptivo moves the Viagem to em viagem.
     - A waiting Ocorrência produces a suggested charge.
     - Despesas de campo are logged and reconciled.
     - The departure Receptivo moves the Viagem to concluída, and the goodbye message is suggested.
     - A warning for an open Saldo after concluída.
- **The transversal test is written last.** It continues the first spec's transversal case, the B2B Agência with 10 pagantes + 2 gratuidades, through every step:
  1. confirmação;
  2. Dados de viagem;
  3. Reservas made, including KTX and a Jeju flight;
  4. Equipe and vehicles allocated, with a double-booking warning resolved;
  5. Voucher v1;
  6. Sinal recorded;
  7. an Alteração adds a day, giving a new Versão, Voucher v2 and a price difference;
  8. Saldo recorded by D-30;
  9. Aviso do dia;
  10. arrival Receptivo, so em viagem;
  11. an Ocorrência and Despesas de campo;
  12. departure Receptivo, so concluída;
  13. goodbye message suggested, and no open items.

  It checks the state the user sees at each step. The same test keeps a cancelada branch for a second Viagem, which is cancelled after the Sinal, with the refund checked.
- There is no prior art beyond the first spec's tests.

## Out of Scope

- Sending messages from the system through WhatsApp, Respond.io or e-mail. The system prepares the text, and people send it in the client's channel.
- Supplier APIs: airline, KTX, hotels, bus. Reservas are recorded by hand.
- Payment gateways and bank integration. Pagamentos are recorded, not collected.
- Accounting, taxes and payroll for guides. The reconciliation only lists what to reimburse.
- A mobile app. The Guia's screens are the web app on a phone.
- A client or agency portal, and e-signature.

## Further Notes

- New glossary terms: Dados de viagem, Receptivo, Alteração, Ocorrência and Despesa de campo in `CONTEXT.md`.
- Relevant defaults are in `docs/padroes-provisorios.md`:
  - Sinal 30% and Saldo by D-30.
  - Waiting charge of 10% after 90 minutes, charged once.
  - Refunds compared in USD.
  - Supplier penalty plus 10% processing.
  - Capacity stored as physical seats, net of Equipe.
- Spending autonomy (about USD 30–50 reported afterwards, close to USD 1,000 needs a heads-up first) is recorded in `negocio/06` but not enforced. Despesas de campo only show totals against those references.
