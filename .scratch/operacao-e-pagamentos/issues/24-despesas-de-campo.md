# 24: Despesas de campo

**What to build:** A Guia logs Despesas de campo on the phone: date, category (Táxi, Hotel, Estacionamento, Pedágio, Ingresso, Gasolina and others, K286), card used (company or personal), amount in KRW and a photo of the receipt. Some are billed to the Cliente (tolls, parking, fuel "cobrados à parte", K384). After the Viagem, an operator reconciles them: reports by day, type and client, personal-card totals to reimburse, and approval by Carlos. KRW totals with a fraction (fuel priced per litre) are rounded to the won, half up. Parking and tolls already suggested by the Custos spec for a vehicle Alocação are not counted twice. Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 51, 52).

**Blocked by:** 08 (Fleet and Alocação tracer).

**Status:** ready-for-agent

- [ ] Fixture Marlene/Jairo 27–30/03/2025: company card 734,620 KRW, personal card 152,943.5 → 152,944 KRW to reimburse.
- [ ] A Despesa marked "cobrar do cliente" appears as an item for the next Invoice.
- [ ] Carlos approves the reconciliation; the approval is recorded.
- [ ] A Guia sees only their own Despesas.
