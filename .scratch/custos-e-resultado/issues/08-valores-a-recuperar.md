# 08: Amounts to recover

**What to build:** One list, per Viagem and across all Viagens, of the money CoreaLux must bill back besides the Cliente's price: Despesas a repassar (Operação 25), Despesas de campo marked "cobrar do cliente" (Operação 24), Ocorrência charges (Operação 23), and parking, tolls and fuel charged on top (ticket 05). Each shows to whom it is billed (the Agência or the Cliente), whether it is on an Invoice yet, and whether that Invoice is paid. Items not yet invoiced can be put on one Invoice in a single step. This is what stops the Kyoto case repeating: tickets paid for a Japanese agency's clients and reimbursed only after being chased. Spec: `.scratch/custos-e-resultado/spec.md` (story 14).

**Blocked by:** 05 (Vehicle hire costs), Operação 23 (Ocorrências and their charges), Operação 25 (Despesa a repassar and Cortesias).

**Status:** ready-for-agent

- [ ] Fixture Kyoto tickets: a Despesa a repassar to the Japanese Agência shows "not invoiced", then "invoiced", then "paid".
- [ ] A waiting Ocorrência charge and a "cobrar do cliente" toll on the same Viagem go onto one Invoice together.
- [ ] The cross-Viagem list shows only amounts not yet paid, oldest first.
