# 04: Outside Profissionais' fees and bank details

**What to build:** Each Alocação of an outside Profissional (Operação 08) creates a Conta a pagar to them from the fee structure on their record (Catálogo 15): full day, half day, overtime from the actual hours recorded on the Alocação, and night after 22h (K218). The Conta follows the Alocação: changed when the Período or hours change, cancelled when the Alocação is removed. A funcionário's Alocação creates no fee Conta, because salaries stay out of the app. No fee data exists in the knowledge base (every guide amount there is a sale price), so a Profissional without a fee gives a Conta "a informar", which keeps the Resultado "não verificável" (ticket 10). Each Profissional records bank details and preferred payment method (bank transfer, Wise), one per person, so a couple is paid separately (Kakao 2025); card numbers are never stored. Paying the Conta starts from those details. Only Admin edits fees and bank details (Catálogo 15). Spec: `.scratch/custos-e-resultado/spec.md` (stories 2, 17; Revisions of 2026-09-24).

**Blocked by:** 01 (Contas a pagar tracer), Operação 08 (Fleet and Alocação tracer), Catálogo 15 (Profissionais).

**Status:** ready-for-agent

- [ ] Test values (no real fee exists): an outside Guia with a fee of 200,000 KRW per full day and 25,000 KRW per overtime hour, allocated a full day with 1h over → a Conta of 225,000 KRW.
- [ ] Changing the Alocação to a morning Período changes the open Conta to the half-day fee.
- [ ] A funcionário allocated the same day creates no Conta.
- [ ] An outside Assistente with no fee recorded gives a Conta "a informar".
- [ ] Marking the Conta paid offers the Profissional's preferred method and bank.
