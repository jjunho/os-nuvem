# 12: Empresa emissora, Dados de faturamento and payment instructions

**What to build:** The Empresa emissora is recorded once: COREANISSIMA CO., LTD (주식회사코레아니시마), registration 448-86-02373, the Magok address, CEO Ku Hyewon, the Gangseo-gu tourism registration of 03/12/2025 (number "a confirmar"), and contacts (K470, K476, K485). The payment instructions (bank, SWIFT, PIX key, Wise) are a register that Invoices read, with a warning when one is empty: a missing Wise account once stalled a USD 7,000 deal for six days (K575). The Cliente's Dados de faturamento (name, CPF, CNPJ or foreign tax ID, address; company data for an Agência) are collected once on the Cliente and never asked again. Spec: `.scratch/operacao-e-pagamentos/spec.md` (story 33).

**Blocked by:** 01 (Operational plan tracer).

**Status:** ready-for-agent

- [ ] The seeded Empresa emissora prints on documents.
- [ ] An Invoice offering Wise with no Wise details warns before it is issued.
- [ ] Dados de faturamento entered for an Agência appear filled in on its next Viagem.
- [ ] Only the Admin edits the Empresa emissora and the payment instructions.
