# 22: Draft from a pasted request

**What to build:** A salesperson pastes a client's free-text request and gets a first Orçamento draft (Dias and lines) to review, so structured requests from agencies are not retyped. What the text says about the Viagem and its Viajantes fills those same records, shown for confirmation. It is never stored as a second copy. Spec: story 90.

If an outside API (e.g. Gemini) is used, it sits behind an adapter with a recording fake, and the Orçamento screen works without it (ADR-0004).

**Blocked by:** 17 (Viajantes in the Orçamento).

**Status:** ready-for-agent

- [ ] A pasted request with dates, cities and headcount gives a draft of Dias and suggested lines to review.
- [ ] Nothing is saved until the salesperson confirms.
- [ ] Headcount already on the Viagem is matched, not duplicated.
- [ ] With the outside service down, the screen says so, and manual entry still works.
