# 11: Cartões and Viagem cards

**What to build:** Mensagens link to the rest of the system. Typing a Código da viagem such as `V26-0142`, pasting a link to any app screen, or picking a Viagem through `[[` (searching by Cliente) turns into a card. The card shows the thing's current state and only what the reader's Papel allows. A reader without access sees "restricted" instead, and the Mensagem's text is never filtered. Tapping a card opens the thing's screen. Spec: `.scratch/comunicador/spec.md` (stories 46, 48–54; Cartões; Cards).

The rest:
- **Cartões** is an interface every owning module implements. Given a reference and a reader, it returns the card's fields that reader's Papel may see, or "restricted". The Comunicador never reads other modules' tables.
- Viagens implements it here. Other modules implement it as they arrive: Tarefas in ticket 13, and later Operação, Catálogo, Fornecedores and Orçamentos. The `[[` picker searches whichever kinds are implemented.
- References are created on save from the segments, and rendered at read time per reader.
- Guiamento sees only Viagens of its own Dias. Until Alocação exists, it gets "restricted" for every Viagem.
- A Viagem has no price yet. The Papel rules are tested with today's fields, and the price joins the card when Orçamentos exist.

**Blocked by:** 08 (Leitura de mensagem and trigger keys).

**Status:** ready-for-agent

- [ ] `V26-…` in a Mensagem shows a Viagem card with its current Etapa. Changing the Etapa changes the card in old Mensagens.
- [ ] A pasted Viagem URL becomes the same card. A pasted URL of another site stays a plain link.
- [ ] `[[` finds a Viagem by the Cliente's name and inserts its reference.
- [ ] The same Mensagem shows the card to the Admin and Conteúdo with the fields their Papéis allow, and "restricted" to Guiamento. The text is identical for all three.
- [ ] Tapping the card opens the Viagem.
