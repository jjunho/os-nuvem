# 04: Formulário de planejamento

**What to build:** A salesperson sends the Formulário de planejamento as a neutral link, with no CoreaLux prices or contacts, that an Agência can forward to its travellers. Opening it needs no sign-in. The answers land on the Viagem: in the Viagem's own fields and its Viajantes (ticket 02), not as a separate copy. Answers that arrive another way can be pasted or attached to the Viagem. Spec: stories 16, 18.

Answers never create a second record of a person or a date. When an answer disagrees with what is already recorded, the salesperson sees both and chooses. The form is in the Idioma do cliente and asks only what isn't known yet.

**Blocked by:** 02 (The Viagem's Viajantes: one record, reused everywhere).

**Status:** done

- [x] "Enviar formulário" gives a link with an unguessable token, tied to one Viagem. It can be revoked.
- [x] Signed out, the link opens the form in the Idioma do cliente, without asking what the Viagem already knows.
- [x] Submitting fills the Viagem and its Viajantes. A second submission updates the same records.
- [x] A conflicting answer is shown beside the recorded value for the salesperson to choose.
- [x] The form shows no price, no internal note, and no data from any other Viagem.
- [x] Pasted answers or an attached file can be added to the Viagem.

## Entrega

Implementado e revisado. Verificação: parte1-formulario.spec.ts.
