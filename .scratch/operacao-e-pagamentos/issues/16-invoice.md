# 16: Invoice tracer

**What to build:** Propostas e Orçamentos and above issue an Invoice (Revisions of 2026-09-24). An Invoice is a request for payment: Empresa emissora, the Cliente's Dados de faturamento (an Agência's name in B2B, even when the Viajantes are its clients), items as one package or broken down by Dia and service, amount, due date, payment methods, bank details and the Condições. Types: Sinal, Saldo, whole amount, an instalment of a longer schedule, charges from Ocorrências, a Despesa a repassar, prepaid Gorjetas, and the Taxa de elaboração paid before the Aceite (Viagem 23). The amount is converted from the USD Preço enviado into USD, BRL, EUR, KRW or JPY at the rate of the day, with the method's factor: PIX in BRL ×1.035, card +5% on each instalment actually paid by card (K915), a cash discount starting at 0 — all editable. Each Invoice is numbered and named "Invoice - {Cliente} - {mês ano}", and a change makes a new version with the old kept. Its Envio is a fact the Quadros spec's "enviar invoice" Tarefa reads. Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 29, 34–37).

**Blocked by:** 12 (Empresa emissora, Dados de faturamento and payment instructions), Viagem 26 (The Proposta, HTML and PDF).

**Status:** ready-for-agent

- [ ] Fixture Ygara: USD 1,400 → an Invoice for the 30% Sinal (USD 420), redone per Dia as version 2 with version 1 kept.
- [ ] Fixture: "Invoice - Explore Travel - Out 2026" in the Agência's name.
- [ ] An Invoice in BRL by PIX shows the ×1.035 factor; by card on one instalment of 420 shows 441.
- [ ] Itinerários, Guiamento and Conteúdo can't open an Invoice.
- [ ] Vertical tests in `operacao-parte5-*.spec.ts`.
