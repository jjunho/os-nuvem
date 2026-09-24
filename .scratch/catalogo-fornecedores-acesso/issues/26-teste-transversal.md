# 26: Transversal test with Papéis and the Catálogo

**What to build:** The end-of-spec transversal test. It reruns the first two specs' B2B case with Papéis and the Catálogo in place, checking what each Papel sees at each step. Spec: Testing Decisions.

1. A Propostas e Orçamentos Usuário starts the Viagem from a Roteiro-modelo, and the Dias arrive filled in.
2. They add a Tour, an Atração on a closing day (warned and changed), and a hotel priced from a Tarifário, with a second hotel priced from a Booking Cotação.
3. An Itinerários Usuário opens the Orçamento and sees line prices but no total.
4. They send the Proposta, which carries the Atração descriptions and usable photos.
5. After confirmação, a Guia signs in from outside the office and sees only their Dias, without prices.

**Blocked by:** 01–24 (every ticket above except 25), and Alocação from the Operação spec (step 5).

**Status:** ready-for-agent

- [ ] One transversal e2e test runs the steps above and passes.
- [ ] All vertical tests of this spec and the earlier specs still pass.
