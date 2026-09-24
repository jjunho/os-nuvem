# 01: Known options: a filtered list with an open last option

**What to build:** A prefactor that every later form uses (ADR-0008, to minimize human error). Wherever a field has known options, the person picks from a list instead of typing free text. The list is filtered first by the context the system already knows (the Viagem, the Dia's date and city, the Canal comercial, the Idioma de guiamento), and only then by what is typed. Options that don't fit the context are not shown at all: on a Busan Dia, no Seoul hotel appears. The last option is always open ("Outro…"), so an exceptional case can still be entered. An exceptional value, once entered, is known: it is offered in the list next time and never typed again. The Admin sees the exceptional values of each field and can rename one, merge it into an existing option or turn it into a regular option.

Applied here to the fields part 1 already has: Origem, Meio de contato, Canal comercial, Categoria de atendimento, Idioma do cliente, Idioma de guiamento, Marca, cities, and the Agência or Operadora and Contato pickers (which already reuse existing records). Each later ticket uses the same picker for its own fields: Período, vehicle, hotel, Atração, Fornecedor, Motivo de perda, currency and the rest.

The rest:
- **Fields that drive rules** (Canal comercial, Categoria de atendimento, Período, currency) also take an exceptional value. No rule knows it, so every value that depends on it comes back "a informar" (ADR-0001) until a person fills it, and the Admin can map it to an existing option.
- **Closed fields have no open option:** values the system works out itself (the Etapa, ADR-0007) and values that control access (the Papel).
- **Context filters** are declared per field, next to its options, so each later ticket states its own (hotels and Atrações by the Dia's city, Guias by Idioma de guiamento and dates, Linhas de custo by the Dia's Período, Fornecedores by service). The picker receives the context and the field's filter. It never guesses.
- What is typed under "Outro…" is matched against every known record, including those outside the context, so a Seoul hotel typed on a Busan Dia links to the existing record instead of creating a duplicate.
- Options are data, not code, so the Admin's changes need no developer (ADR-0002). A database enum that can't take a new value is replaced by option data where the field is open.
- Lists show the most likely option first where the system knows one (e.g. the Marca suggested from the Canal comercial), already selected when it is known (ADR-0008).

**Blocked by:** Comunicador 01 (Idioma da interface and the PT/KO catalogue).

**Status:** ready-for-agent

- [ ] Typing "ins" in Origem narrows the list to Instagram. Choosing it takes one key.
- [ ] A field with a context filter shows only the options that fit the context before anything is typed (tested here on the intermediary picker: with Canal comercial Agência it lists only Agências, never Operadoras; later tickets test their own fields).
- [ ] "Outro…" accepts "Feira em Lisboa" as an Origem. The next Viagem offers "Feira em Lisboa" in the list.
- [ ] An exceptional Canal comercial saves the Viagem. Rate-dependent values show "a informar", and nothing crashes.
- [ ] The Admin merges an exceptional value into a regular option, and the Viagens using it now show the regular one.
- [ ] The Etapa and the Papel offer no open option.
- [ ] Options and the "Outro…" label show in the Usuário's Idioma da interface. Values the person typed show as typed.
- [ ] The part 1 tests pass, adjusted only where a free-text field became a picker.
- [ ] Keyboard-only use works: type, arrow, Enter.
