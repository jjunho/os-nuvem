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
- **Invoices and Pagamentos:** an **Invoice** is issued to the Cliente (or the Agência) for the Sinal, the Saldo or the whole amount, as a package or broken down by Dia, and Clients treat it as the contract. Pagamentos are recorded against it with method, currency and proof, and each one produces a **Recibo**. The **Situação de pagamento** is always visible, and the system warns before non-refundable items are bought while the Saldo is unpaid.
- **Alterações:** a change after confirmation creates a new Versão and a price difference.

During the trip the Equipe logs **Ocorrências** and **Despesas de campo**. The arrival **Receptivo** moves the Viagem to em viagem. The departure Receptivo, the send-off, moves it to concluída and suggests the goodbye and review message.

## User Stories

### Confirmação and the operational plan

1. As a salesperson, I want confirming a Viagem to start its operational plan from the accepted Opção's Dias and Linhas de custo and the Viagem's own Viajantes (the same records, never copies; ADR-0008), so that operations start from what was sold and nothing is typed again.
2. As a salesperson, I want the Código da viagem (created at first contact) printed on every operational document, so that the Voucher and the team use one identifier.
3. As an operator, I want to collect each Viajante's Dados de viagem (passport name, date of birth, passport number and validity, arrival, departure and internal flights, travel insurance company and policy number, diet, accessibility, emergency contact), so that bookings, DMZ entry and airline lists are right.
4. As an operator, I want a warning when a passport expires less than 6 months after the trip, or when data needed by a booked item is missing, so that nobody is stopped at a border or a checkpoint.
5. As an operator, I want to generate a lista de passageiros for an airline or attraction from the Dados de viagem, so that I no longer retype names and passports.

### Reservas and Pendências

6. As an operator, I want each Linha de custo that needs a booking (hotel, KTX, flight, bus, restaurant, ticket, Sky Capsule) to create a Reserva to be made, so that nothing sold is forgotten.
7. As an operator, I want each Reserva to have a Fornecedor, a state (a fazer, solicitada, confirmada, cancelada), a booking code (PNR, hotel confirmation), its real cost and currency, and its cancellation terms, so that the booking is complete in one place.
8. As an operator, I want to see the difference between the cost sold in the Versão and the real cost of each Reserva, so that the real margin can be verified.
9. As an operator, I want Reservas with booking deadlines (KTX, DMZ, Sky Capsule, Jeju flights, hotels) to show their deadline, so that we book before things sell out.
10. As an operator, I want Pendências per Dia (send train tickets, K-ETA guidance, receive hotel voucher, confirm restaurant, passport reminder for the DMZ), with a due date and done/not done, so that the checklist lives next to the Dia.
11. As an operator, I want a D-2 check per Dia (opening hours, times, programme, closures, travel time), so that the "checklist d-2" column finally gets filled.
12. As an operator, I want a list of overdue Reservas and Pendências across all Viagens, so that I start each day from what is at risk.

### Alocação and the agenda

13. As an operator, I want to allocate Guias, Assistentes, drivers and vehicles to each Dia of a Viagem, so that everyone knows who works where.
14. As an operator, I want the suggested Equipe for each Dia to come from the Categoria de atendimento and the Viajantes taking part, and the suggested Profissionais to match the Idioma de guiamento, the Dia's theme (K-Beauty, art, shopping) and the level asked for, so that the right person is sent.
15. As an operator, I want a warning when the same person or vehicle is allocated to two Viagens at the same time, so that double-booking is caught.
16. As an operator, I want to mark people as unavailable (folga, other commitments), so that the warnings know about them.
17. As an operator, I want an Alocação to be "a confirmar" until it is confirmed, and a list of Dias in the next 7 days still without a confirmed Guia, so that late staffing is visible early.
18. As an operator, I want to allocate outside professionals and external vehicles with their own contact, so that freelancers and rented vans fit the same agenda.
19. As an operator, I want a warning when the Viajantes plus Equipe exceed a vehicle's net capacity, or when luggage needs a separate truck, so that the car fits.
20. As Carlos, I want the agenda: every Dia of every Viagem by date, with city, Cliente, programme, Equipe, vehicle and whether car, tickets, lunch and hotel are confirmed, so that the tour-schedule spreadsheet can go.
21. As a Guia, I want to see my own Alocações and the Roteiro operacional of each Dia, so that I arrive prepared.

### Voucher and Roteiro operacional

22. As an operator, I want each Receptivo to carry the flight, the Nível de recepção and who does it (Guia, Assistente or only the driver), and a driver sheet with the flight arrival and the name sign, so that a pickup without a Guia is still fully prepared.
23. As an operator, I want the Voucher, in the Idioma do cliente, generated from the operational plan (Código da viagem, Responsável and phone, Viajantes, emergency contact, Receptivos and deslocamentos with the person in charge and their phone, Hospedagem with check-in and check-out, Guiamento per Dia with meeting time and activities), so that I never retype it.
24. As an operator, I want any change to the plan to let me issue a new Voucher version, with previous versions kept, so that the client always has the latest one and we know what they had.
25. As an operator, I want to attach tickets and booking confirmations to the Voucher ("com os tickets"), so that the client has everything in one file.
26. As an operator, I want the Roteiro operacional for the Equipe (times, addresses, bookings, Pendências, notes), so that the internal plan is separate from the client document.

### Pagamentos

27. As a salesperson, I want the Sinal and Saldo due dates and amounts set from the accepted Proposta's Condições, so that payment follows what was agreed.
28. As a salesperson, I want to record each Pagamento with date, amount, currency, method (PIX, Wise, cartão, espécie) and proof, so that screenshots stop being the record.
29. As a salesperson, I want to issue an Invoice and receive a Pagamento in USD, BRL, EUR, KRW or JPY, with the amount converted from the USD Preço enviado at the rate of the day, plus the method's factor (PIX in BRL ×1.035, card +5%), all as editable suggestions, so that each Cliente pays in the currency they use.
30. As a salesperson, I want the Situação de pagamento (sem sinal, sinal recebido, pago) and the open Saldo always visible on the Viagem, so that nobody asks "did they pay?".
31. As a salesperson, I want a Próxima ação created before the Saldo due date and an alert when it passes, so that balances are chased on time.
32. As an operator, I want a warning when I mark a non-refundable Reserva as solicitada while the paid amount does not cover it, so that we don't pay for tickets the client hasn't covered.
33. As a salesperson, I want to collect the Cliente's Dados de faturamento (name, CPF or CNPJ or foreign tax ID, address; company data for an Agência), so that an Invoice can be issued. Today this is asked in the chat every time.
34. As a salesperson, I want to issue an Invoice for the Sinal, the Saldo or the whole amount, with Empresa emissora, Dados de faturamento, items, amount, due date, payment methods, bank details (bank, SWIFT, PIX key, Wise) and the Condições, so that the Cliente can pay and has a document that works as the contract.
35. As a salesperson, I want to choose whether the Invoice shows one package line or a breakdown by Dia and service, so that clients who ask "the value of each service" get it without a second manual document.
36. As a salesperson, I want each Invoice numbered and named consistently ("Invoice - {Cliente} - {mês ano}"), with a new version when anything changes and the old one kept, so that everybody refers to the same document.
37. As a salesperson, I want Invoices addressed to an Agência in the Agência's name, even when the Viajantes are its clients, so that B2B billing follows who pays.
38. As Carlos, I want the planned Invoice date on each Viagem (when the next Invoice should go out), and a list of Invoices due to be sent, so that "previsão de envio de invoice" is no longer tracked by memory.
39. As a salesperson, I want to generate a Recibo from each Pagamento, showing what was paid, how and what remains, so that the "Template Recibo Tour" is filled automatically.
40. As a salesperson, I want an Invoice's paid amount to follow the Pagamentos recorded against it, and the Invoice to show as open, partially paid or paid, so that we know which requests are settled.
41. As a salesperson, I want to record a Saldo collected during the trip by the Equipe, so that mid-trip payments are not lost.

### Alterações and cancelamento

42. As a salesperson, I want an Alteração after confirmação to create a new Versão de orçamento and show the price difference, so that changes are priced like the original.
43. As a salesperson, I want to record who asked for an Alteração (the Agência or the Viajante), and in B2B to mark complex or costly changes as "levar ao parceiro" so the Agência agrees the solution and any extra payment with its traveller, so that we follow the B2B rule and never surprise the partner.
44. As an operator, I want to notify the Agência early when a problem may affect its traveller, so that the partner hears it from us first.
45. As a salesperson, I want the taxa de alteração available (starting at 0), so that customised packages can be charged when agreed.
46. As a salesperson, I want to cancel a confirmada Viagem with a Motivo de perda, so that cancelada differs from perdida.
47. As a salesperson, I want the refund suggested on cancelamento: supplier penalties per Reserva, 10% processing on non-refundable third-party items, our own cancellation terms, and the smaller of the USD or BRL amount, so that refunds follow the Condições.

### During the trip and the send-off

48. As an operator, I want the Aviso do dia prepared each evening for the next Dia (meeting time and place, Guia and phone, what to bring), in the Idioma do cliente and addressed to whoever the Viagem talks to (the Viajantes, or the Agência in B2B), ready to copy into that channel, so that nobody types it from scratch.
49. As whoever does the arrival Receptivo (Guia, Assistente, driver, or the operator on their behalf), I want to confirm it, so that the Viagem moves to em viagem.
50. As a Guia, I want to log an Ocorrência (delayed flight, waiting beyond 90 minutes, no-show, change on the day, supplier incident), with a suggested charge when one applies, so that extra costs are billed and incidents are known.
51. As a Guia, I want to log Despesas de campo with the card used (company or personal), amount in KRW and a photo of the receipt, so that my expenses are reconciled without a spreadsheet.
52. As an operator, I want to reconcile a Viagem's Despesas de campo after it ends, with personal-card totals to reimburse, so that guides are repaid correctly.
53. As whoever does the departure Receptivo, I want to confirm the send-off at the airport, so that the Viagem moves to concluída.
54. As a salesperson, I want the goodbye and review-request message suggested when the Viagem becomes concluída, so that every trip ends with a thank-you and feedback.
55. As Carlos, I want a warning when a concluída Viagem still has an open Saldo, unreconciled Despesas de campo or open Ocorrências, so that nothing is left hanging.

### Added from the full source sweep

56. As an operator, I want each hotel, flight and transfer marked as ours (a Reserva) or as an Item de terceiros, so that we don't chase, warn about or take blame for what the Agência or client booked, while still knowing the hotel and flights.
57. As an operator, I want the Voucher to list only the Hospedagem we booked, and to show Items de terceiros only when I choose, so that the Voucher states what we are responsible for.
58. As an operator, I want the Voucher's dates to be the authoritative schedule and every sent version kept as an Envio, so that "as datas do voucher são as datas que valem" can be proven.
59. As an operator, I want the Voucher to introduce the Equipe (name, photo, role) and list every booking code and ticket, so that clients trust the guide as our staff and have everything at hand.
60. As an operator, I want the Voucher to use generic names ("bondinho") and to allow "horário a confirmar" for items whose booking window hasn't opened, so that the first Voucher can go out early and is updated later.
61. As an operator, I want each Reserva to have the date its booking window opens (KTX and some experiences: one month before) and a "reservar nesta semana" list, so that we book the moment it's possible.
62. As an operator, I want a Reserva to hold bed type, early check-in and upgrade requests, hotel confirmation number, and train car and seat numbers per person, so that the guide can meet clients on the platform and the hotel request is complete.
63. As an operator, I want Observações para a Equipe on each Viajante (topics to avoid, mistrust, mobility, food), visible to the Equipe and never to the client, so that guides are briefed.
64. As an operator, I want to allocate Profissionais per Período of a Dia (morning and afternoon can have different Guias), so that a guide can hand over a group mid-day.
65. As an operator, I want a suggestion to keep the same Guia across the whole Viagem and a warning when it changes, so that clients don't have to switch guides.
66. As an operator, I want a warning when a Profissional is allocated in two cities on the same day, not only at overlapping times, so that impossible schedules are caught.
67. As an operator, I want recurring unavailability (every Tuesday, a class timetable, a period), so that availability reflects real life.
68. As an operator, I want vehicle capacity suggestions that depend on the Categoria de atendimento (econômico can fill the car; VIP uses fewer seats) and on luggage, so that allocation follows how we actually sell.
69. As an operator, I want the medical-tourism limit (3 people per clinic per shift, Guia plus acompanhante) checked, so that clinic days are staffed right.
70. As an operator, I want Receptivos at cruise ports and bus terminals too, and groups on different flights split into separate Receptivos, so that every real pickup fits.
71. As an operator, I want the Viagem to become concluída at the end of its last Dia when there is no departure Receptivo (clients going to the airport alone), so that trips close anyway.
72. As an operator, I want to record a Despesa a repassar (tickets or extras we paid for the Agência's clients) and bill it back to the Agência, so that these amounts are recovered.
73. As an operator, I want to record Cortesias given during the trip (a dinner on us, extra baggage, a free extra service) with their cost, so that goodwill is visible in the Resultado da viagem.
74. As a salesperson, I want the Pagamento schedule to allow more than Sinal and Saldo (e.g. hotels in two or three instalments), so that real payment plans fit.
75. As an operator, I want a "Sugestões" document for the Viagem (apps, money, K-ETA, hotel address in Hangul, restaurants per city), exportable as formatted PDF or plain text for agencies that use their own layout, so that travel tips stop being written from scratch.
76. As a salesperson, I want the review request after concluída to be sent only to clients we choose, with a question about publishing photos, so that reviews come while the trip is fresh and photo use is consented.
77. As an operator, I want to record feedback about Fornecedores after the trip (e.g. an old, worn-out hotel room), so that the next quote knows it.

## Implementation Decisions

- **Build order is by vertical slice**, matching the parts in Testing Decisions. Each part goes from screen to database and passes its tests before the next one starts. The transversal test comes last.
- **Modules** (added to those of the first spec):
  - **Operação:** the operational plan per Viagem (Dias, Viajantes per Dia, Reservas, Pendências, Receptivos, Ocorrências). It is created from the accepted Opção on confirmação and changed only through the Viagem's own commands. It owns the em viagem and concluída transitions, driven by the arrival and departure Receptivos.
  - **Alocação:** people, vehicles, their availability and their assignment to Dias. Conflict and capacity checks are computed across all Viagens. It exposes the agenda by date.
  - **Pagamentos:** Pagamentos, Invoices (with their versions and paid status), Recibos, Dados de faturamento, due dates derived from the Condições, the Situação de pagamento and the refund suggestion. An Invoice is a request and a Pagamento is money received; a Pagamento is recorded against an Invoice, and one Invoice can be settled by several Pagamentos. The refund suggestion is a pure calculation: inputs are the Pagamentos, the Reservas with their penalties and the Condições; outputs are amounts and reasons.
  - **Despesas de campo:** expenses per Viagem and Dia, receipts, reconciliation.
  - **Documentos** (from the first spec) gains Voucher, Roteiro operacional, receipt or invoice, lista de passageiros and Aviso do dia. As with the Proposta, each render reads a fixed snapshot, so a Voucher version always renders the same.
- An **Alteração** reuses the Orçamentos module: it creates a new Versão from the current one, and on acceptance the operational plan is updated from the new Versão. Existing Reservas are matched and kept, and removed items become Reservas to cancel.
- **Money** stays integer minor units plus currency (JPY and KRW have no minor unit). The Orçamento and the Preço enviado are always in USD. Invoices and Pagamentos may be in USD, BRL, EUR, KRW or JPY. Each one stores the exchange rate and date used to count it against the USD Preço enviado. Supplier costs and Despesas de campo keep their own currency.
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
     - Invoices and Pagamentos in USD, BRL (PIX ×1.035), EUR, KRW and JPY, and by card (+5%); a Saldo computed correctly when the Sinal was paid in BRL and the Saldo in USD.
     - The Situação de pagamento, the Saldo reminder and the non-refundable-without-cover warning.
     - Dados de faturamento collected; an Invoice for the Sinal issued in the Cliente's name (and one in an Agência's name for a B2B case), as a package and broken down by Dia; a change gives Invoice version 2 with version 1 kept.
     - Pagamentos recorded against the Invoice move it from open to partially paid to paid; a Recibo is generated from each Pagamento.
     - The list of Invoices due to be sent.
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
  6. Invoice for the Sinal issued in the Agência's name, and the Sinal recorded against it with a Recibo;
  7. an Alteração adds a day, giving a new Versão, Voucher v2 and a price difference;
  8. Invoice for the Saldo issued, and the Saldo recorded before the first tour day;
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
- The Korean electronic tax invoice (세금계산서) and any tax filing. The Invoice here is a commercial invoice; VAT on it follows the provisional default (off unless switched on).
- Accounting and payroll for guides. The reconciliation only lists what to reimburse.
- A mobile app. The Guia's screens are the web app on a phone.
- A client or agency portal, and e-signature.

## Further Notes

- New glossary terms: Dados de viagem, Receptivo, Alteração, Ocorrência and Despesa de campo in `CONTEXT.md`.
- Relevant defaults are in `docs/padroes-provisorios.md`:
  - Sinal 20% and Saldo on the first tour day (current rule), with warnings when the paid amount does not cover committed penalties or a non-refundable purchase.
  - Waiting charge of 10% after 90 minutes, charged once.
  - Refunds compared in USD.
  - Supplier penalty plus 10% processing.
  - Capacity stored as physical seats, net of Equipe.
- Spending autonomy (about USD 30–50 reported afterwards, close to USD 1,000 needs a heads-up first) is recorded in `negocio/06` but not enforced. Despesas de campo only show totals against those references.
