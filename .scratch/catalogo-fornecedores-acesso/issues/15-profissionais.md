# 15: Profissionais

**What to build:** The Profissional record, which the Viagem, Operação, Custos and Comunicador specs read:
- funcionário or outside professional; roles, possibly several (guia, assistente, motorista, intérprete, K438); level (assistente, guia; shopping and skincare expert at the guia A rate, K191);
- languages, including LIBRAS and Japanese (most drivers speak only Korean, K222); specialties and themes (Jessica K-Beauty, Lia art, Carlos DMZ); home city and country (the Japan team, K321);
- whether they can drive, and that a guide drives only our own car (K833, K888);
- the guide licence with number and expiry, legally required, with a warning before it expires (K265, K475);
- a bio and photo for the Proposta and the Voucher (K310, K311);
- for outside Profissionais only, the fee structure the Custos spec reads: full day, half day, overtime, night. A funcionário's salary is never recorded in the app (Juliano, 2026-09-24);
- a named substitute for a specialty (K257);
- the link to a Guiamento Usuário (login and Comunicador specs).

A Tour or Módulo can name the Profissional it requires (story 43). Spec: story 43; Custos spec.

**Blocked by:** 01 (Access by Papel: tracer), 10 (Tours).

**Status:** ready-for-agent

- [ ] Seed: the team of K473 and 03:41–79 with languages, specialties, bios and home cities. No fee data exists to seed.
- [ ] A licence expiring within 60 days shows a warning to the Admin.
- [ ] Linking a Profissional to a Guiamento Usuário is one field. The Usuário is always a funcionário.
- [ ] Only Admin edits fees. Guiamento sees only its own record.
- [ ] The Tour picker for a required Profissional offers only those with that specialty.
