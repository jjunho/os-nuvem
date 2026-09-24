# 08: Proposta from the Catálogo

**What to build:** The Proposta prints each Dia's Atrações from the Catálogo in the Idioma do cliente: the generic name and description before confirmação, the real ones after (Viagem ticket 27), with photos marked usable only. A Dia with free text keeps printing it. A clinic Atração carries the dermatologist-responsibility text (K756), and the Proposta prints it. Spec: stories 2, 3; Viagem spec story 64.

**Blocked by:** 05 (Translations and photos), Viagem 26 (The Proposta, HTML and PDF).

**Status:** ready-for-agent

- [ ] A Proposta before confirmação shows "mercado de peixe" and its generic description. After confirmação, the real name and description.
- [ ] A photo not marked usable never appears.
- [ ] A Spanish Proposta uses the Spanish descriptions, with the missing-translation warning shown to the salesperson, not the Cliente.
- [ ] A Dia with a clinic Atração prints its disclaimer.
