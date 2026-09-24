# 19: Opções and Margem

**What to build:** One Orçamento holds several Opções side by side (group size, hotels, dates, category, vans vs bus). An Opção can be created by copying another and changing only what differs. The Margem is set per Opção, with the B2B and B2C reference values offered. The Margem shows as an estimate, marked "não verificável" while real costs are unknown. When the estimate falls under 10%, a warning asks for a recorded reason, and nothing is blocked. Spec: stories 46, 48, 49, 53.

**Blocked by:** 11 (Orçamento tracer).

**Status:** ready-for-agent

- [ ] Two Opções (10 + 2 and 12 + 2) show side by side with their own prices.
- [ ] Copying an Opção then changing its hotel changes only the copy.
- [ ] Fixture: revenue 1,000 with full costs 910 → real margin 9% under the floor. With costs unknown → "não verificável".
- [ ] Fixtures from the real quotes: Interep/Leda (13 days, 1 pax, Margem 10% vs 35%), Marcelo Xtravel (6 to 11 pax) and Carlos's Busan day trip. Where the old sheet disagrees with the rules, the fixture follows the rules and notes the difference.
- [ ] Fixture: influencer payment 1,000 → commission 50, price unchanged.
