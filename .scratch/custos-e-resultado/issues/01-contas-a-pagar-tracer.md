# 01: Contas a pagar tracer: from Reservas

**What to build:** Every confirmed Reserva with a real cost becomes a Conta a pagar to its Fornecedor, with amount and currency as recorded on the Reserva (never retyped, ADR-0008) and a due date read from the Fornecedor's payment terms (Catálogo 18): card charged 24h before check-in (Park Hyatt Busan, K633), charged when the card is registered (Lotte City, K290b), bank deposit confirmed at least 1 day before (Hidden Cliff, K642), 30% up front (Bene, K785), pay at the hotel (Paradise). A "Guia paga no local" Reserva (Operação 05) is paid through the Guia's Despesa de campo and is not counted twice. An Item de terceiros creates no Conta (K107). The Equipe's own flights, KTX and lodging are Reservas (Operação 05), so they arrive here too.

Faturamento marks a Conta paid with date, method (card, transfer, cash, Wise), currency, the amount actually paid, the rate to USD on that date, and proof. The Viagem shows its Contas a pagar, open and paid. Only Faturamento and Admin reach Contas a pagar (Catálogo 01), through screens and requests.

This ticket builds the one place where facts from other modules (a Reserva confirmed, an Alocação recorded, a Pagamento confirmed, a Despesa reconciled) create or change Contas, without the Contas module editing those modules. Every later source in this spec plugs into it. Spec: `.scratch/custos-e-resultado/spec.md` (stories 1, 4; Revisions of 2026-09-24).

**Blocked by:** Operação 04 (Reservas tracer), Operação 05 (Reserva details and more Reserva types), Catálogo 18 (Fornecedor conditions and contract restrictions).

**Status:** ready-for-agent

- [ ] Fixture Park Hyatt Busan 14–15/10/2026, 5 rooms confirmed at a real cost in KRW → one Conta in KRW due 13/10/2026, "card charged 24h before".
- [ ] A Hidden Cliff Reserva is due the day before arrival; a Paradise Reserva shows "pay at the hotel".
- [ ] An Item de terceiros hotel creates no Conta.
- [ ] Changing the real cost on the Reserva changes the open Conta; a paid Conta keeps what was paid and shows the difference.
- [ ] Marking paid records who, when, method, rate and proof.
- [ ] Propostas e Orçamentos, Itinerários, Guiamento and Conteúdo get 404 on Contas a pagar, by screen and by request.
- [ ] Vertical tests in `custos-parte1-*.spec.ts`.
