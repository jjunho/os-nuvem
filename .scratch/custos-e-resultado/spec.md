Status: ready-for-agent

# Spec: Custos e resultado

Depends on the three earlier specs:
- `.scratch/viagem-orcamento-proposta/spec.md`: Versões, the estimated Margem.
- `.scratch/operacao-e-pagamentos/spec.md`: Reservas, Pagamentos, Invoices, Despesas de campo, Despesas a repassar, Cortesias.
- `.scratch/catalogo-fornecedores-acesso/spec.md`: Fornecedores, Profissionais, Papéis.

## Problem Statement

CoreaLux knows roughly what it charges and doesn't know what it earned. Several things are unknown or tracked by memory:

- **Supplier payments.** Hotels, bus companies, drivers and freelance guides are paid on their own terms, such as a hotel charging the agency card 24h before check-in. Nobody lists what is owed, to whom, or by when.
- **Driver meals and tips.** These are paid every day but never appear in a quote.
- **Influencer commission.** The 5% owed to an Influenciador exists only as a rule (K929).
- **Guides' pay.** Guides ask for a statement of what they are owed and what has been paid into their account.
- **Recoverable money.** Some tickets bought for an agency's clients should be billed back to the agency, and are forgotten.
- **Real margin.** Carlos's floor is a 10% real margin per Viagem, and it can't be checked without the real costs (K920). Today the only margin anyone sees is the one estimated in the spreadsheet.

## Solution

Every amount CoreaLux owes because of a Viagem becomes a **Conta a pagar**, with its beneficiary, amount, currency, due date and whether it is paid. Contas a pagar come from four sources:

- Reservas with Fornecedores;
- fees of external Profissionais per Alocação;
- recurring hire costs, such as the driver's meal and tip;
- Comissões and Despesas de campo to reimburse.

Money CoreaLux is owed besides the Cliente's price, such as a **Despesa a repassar**, becomes an amount to bill back.

When a Viagem ends, the **Resultado da viagem** compares what was received with what was actually spent, including Cortesias. It shows the real Margem against the 10% floor. Until every cost is known, it shows the margin as "não verificável". Each Profissional has a statement of what they are owed and what has been paid.

## User Stories

### Contas a pagar

1. As Faturamento, I want a Conta a pagar created from each Reserva with its real cost, currency and the Fornecedor's payment terms (e.g. card charged 24h before check-in, pay locally at the hotel), so that supplier payments are planned.
2. As Faturamento, I want a Conta a pagar created for each external Profissional's Alocação from their agreed fee (full day, half day, overtime, night), so that freelancers are paid for what they worked.
3. As Faturamento, I want recurring hire costs suggested with each vehicle Alocação (driver's meal and tip per day, parking, tolls) as Contas a pagar, so that these daily costs stop being invisible.
4. As Faturamento, I want to mark a Conta a pagar as paid with date, method, currency and proof, so that what was paid is recorded.
5. As Faturamento, I want a list of Contas a pagar due this week across all Viagens, by beneficiary, so that I pay on time.
6. As Faturamento, I want a warning when a Conta a pagar is due before the Cliente's payments cover it, so that we don't finance trips unknowingly.
7. As Faturamento, I want a cancelled Reserva to turn its Conta a pagar into the supplier's penalty, or cancel it, so that cancellations are reflected in what we owe.

### Comissões

8. As Faturamento, I want a Comissão of 5% (editable) created for the Influenciador when the Cliente's Pagamento is received, so that the commission follows the money received and never changes the Cliente's price.
9. As Faturamento, I want each Influenciador's statement of Comissões owed and paid, so that they are paid correctly.

### Gorjetas

Stories 10–12 are dropped (Revisions of 2026-09-24): a Gorjeta is only suggested text in the Proposta.

### Despesas and recovery

13. As Faturamento, I want each Despesa de campo on a personal card to become a Conta a pagar to that Profissional, so that reimbursement is tracked.
14. As Faturamento, I want each Despesa a repassar to become an amount to bill to the Agência or Cliente, issued as an Invoice, so that money spent for them is recovered.
15. As Carlos, I want Despesas de campo shown against the spending references (about USD 30–50 reported afterwards, close to USD 1,000 needs a heads-up), without blocking, so that unusual spending is visible.

### Profissionais

16. As a Profissional, I want a statement of my Alocações, fees and reimbursements owed and paid, so that I know what I am owed.
17. As Faturamento, I want to record each Profissional's bank details and preferred payment method, so that payments go to the right account.

### Resultado da viagem

18. As Carlos, I want the Resultado da viagem: Pagamentos received (in USD at their recorded rates), minus Contas a pagar (paid and open), minus Cortesias, plus Despesas a repassar recovered, so that I see what each Viagem really earned.
19. As Carlos, I want the real Margem compared with the 10% floor, shown as "não verificável" while any cost is still estimated or missing, so that the floor is checked honestly.
20. As Carlos, I want the Resultado side by side with the estimate from the accepted Versão, line by line, so that I see where the estimate was wrong.
21. As Carlos, I want a list of Viagens by Resultado and real Margem over a period, by Canal comercial, Agência and Categoria de atendimento, so that I see which business is worth it.
22. As Faturamento, I want a Viagem closed financially only when all Contas a pagar are paid, all Pagamentos are received or written off, and Despesas are reconciled, so that "concluída" and "financially closed" are different and both known.

## Implementation Decisions

- **Build order is by vertical slice,** matching the parts in Testing Decisions. The transversal test comes last.
- **Modules:**
  - **Contas a pagar** is a new module. It creates Contas from Reservas, Alocações, Comissões and Despesas through their modules' events, and never edits those modules.
  - **Pagamentos** (from the operations spec) gains amounts to bill back (Despesas a repassar).
  - **Resultado** is a pure calculation. Its input is a Viagem's Pagamentos, Contas a pagar, Cortesias, Despesas a repassar and the accepted Versão. Its output is the Resultado, the real Margem or "não verificável", and the per-line comparison with the estimate. It has no I/O.
- **Money** follows the earlier specs: integer minor units plus currency, and a recorded rate to USD for every amount that enters the Resultado.
- **Access:** only Faturamento and Admin see Contas a pagar, Comissões and the Resultado. A Profissional sees only their own statement (Papel Guiamento, scoped to themselves).
- **Financial closing** is a separate state from the Etapa. A Viagem can be concluída and still financially open.

## Testing Decisions

The tests are vertical first, then one transversal test at the end.

- **A good test** drives the system from the outside, down to a real database, and checks what Faturamento, Carlos or a Profissional would see. It never mocks our own modules.
- **Vertical tests, one set per part:**
  1. **Contas a pagar:**
     - Created from a hotel Reserva with "card charged 24h before", from an external Guia's Alocação (full day plus 1h overtime), and from a vehicle Alocação with the driver's meal and tip.
     - Marking as paid, the due-this-week list, and the not-covered warning.
     - A cancelled bus Reserva turning into its penalty.
  2. **Comissões:** an Influencer Viagem with payment 1,000 gives a Comissão of 50 when the payment is received, and the price stays 1,000.
  3. **Despesas and recovery:**
     - A personal-card Despesa de campo becomes a reimbursement to the Profissional.
     - A Despesa a repassar becomes an Invoice to the Agência.
     - A Despesa above the reference is flagged.
  4. **Profissionais:** a Guia's statement shows Alocações, fees and reimbursements, owed and paid, and nothing about other Profissionais.
  5. **Resultado:**
     - Revenue 1,000 with all costs 910 → real Margem 9%, under the floor.
     - One cost still estimated → "não verificável".
     - A Cortesia lowers the Resultado.
     - A Despesa a repassar recovered doesn't count as revenue.
     - The per-line comparison with the Versão.
     - The period list by Canal comercial.
- **The transversal test is written last.** It continues the B2B transversal case of the earlier specs:
  1. Reservas give Contas a pagar.
  2. An external Assistente is paid.
  3. The driver's daily costs are recorded.
  4. A Guia's personal-card expense is reimbursed.
  5. A ticket bought for the Agência is billed back.
  6. A dinner Cortesia is recorded.
  7. Every Conta is paid.

  It checks the Resultado and the real Margem against the floor, and finally closes the Viagem financially. A second, Influencer, Viagem checks the Comissão.

## Out of Scope

- Accounting and tax books, the Korean tax invoice (세금계산서), and payroll or labour obligations for employees.
- Paying suppliers through bank integrations. Payments are recorded, not executed.
- Company-wide overheads (office, salaries, marketing) and their allocation to Viagens. The Resultado covers trip costs only.
- Approval workflows for Despesas. The references are shown, not enforced.

## Further Notes

- **Sources:**
  - K920 (margin floor), K929 and K146 (Influencer commission);
  - K448–K449 (spending autonomy);
  - `negocio/06` (field expenses S036);
  - the 29/06/2026 meeting (driver's meal and tip, overtime);
  - Kakao 2025 (tickets billed back to a Kyoto agency; guides asking for payment statements).
- New glossary terms used here: Conta a pagar, Comissão, Resultado da viagem, Despesa a repassar, Cortesia (both senses).

## Revisions of 2026-09-24

A full read of `../docs/negocio` before ticketing, with decisions taken with Juliano. Every value is an editable default (ADR-0001). The tickets in `issues/` carry them:
- **Gorjetas stay out of the app's money.** A Gorjeta is only suggested text in the Proposta (Viagem spec). CoreaLux never records it as a Pagamento, an Invoice or a Conta a pagar, never splits it and keeps no back-office fund. Stories 10–12 are dropped, and the Profissional's statement has no Gorjetas. The driver's daily tip paid with the hire (K216/K219) is a different thing: a hire cost, kept in story 3.
- **Driver's hire costs:** meal ≈ 10,000 KRW and tip ≈ 10,000 KRW per day for every kind of transport, buses included; external-driver overtime by the hour; night after 22h (29/06/2026 meeting, K216–K220). Parking, tolls and fuel charged to the client on top of the car price (K384) are also amounts to bill.
- **Outside Profissionais' fees have no data.** Every guide amount in the knowledge base is a sale price. Fees start empty, and a Conta from an Alocação without a fee is "a informar", which keeps the Resultado "não verificável".
- **A funcionário creates no fee Conta** (salaries stay out of the app), but still gets reimbursements for their Despesas de campo.
- **Cancellation:** the 10% processing on the supplier's penalty (K919) is already in the Operação spec's refund calculation. Here a cancelled Reserva only turns its Conta into the penalty owed.
- **The only commission is the Influenciador's** (K146, S152 B51). Agências get net prices and add their own margin; referrals earn no commission.
- **Items paid by someone else** (Item de terceiros, a hotel the client books) bring neither cost nor revenue into the Resultado (K107).
- **Financial closing** needs every open Invoice balance either received or written off, with who and why, by Faturamento or Admin.

