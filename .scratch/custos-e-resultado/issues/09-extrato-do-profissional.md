# 09: Profissional's statement

**What to build:** Each Profissional has a statement of what they are owed and what has been paid: their Alocações with the fee Contas (outside Profissionais only) and their reimbursements, each open or paid with date and method. Guides asked for exactly this in 2025 ("uma tabela do que estou recebendo", Kakao 23/04/2025). A Guiamento Usuário sees only their own statement, through the screen and requests (Catálogo 16). A funcionário's statement shows reimbursements and never a fee or salary. Faturamento and Admin see every statement and can export one as text or PDF for outside Profissionais, who don't sign in. Spec: `.scratch/custos-e-resultado/spec.md` (stories 16; Revisions of 2026-09-24).

**Blocked by:** 04 (Outside Profissionais' fees and bank details), 07 (Reimbursing Despesas de campo).

**Status:** ready-for-agent

- [ ] An outside Guia's statement over two Viagens lists each Alocação's fee and one reimbursement, owed and paid.
- [ ] A signed-in funcionário Guia sees their reimbursements and no fee.
- [ ] A Guia asking for another Profissional's statement by URL gets 404.
- [ ] The exported statement matches the screen.
- [ ] Vertical tests in `custos-parte4-*.spec.ts`.
