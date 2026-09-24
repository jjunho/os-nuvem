# 13: Tarefas in the chat

**What to build:** Decisions in chat become tracked Tarefas. A `TAR-…` code in a Mensagem becomes a card with the current status, Responsável and Prazo, and a button to mark it concluída. `/tarefa` opens the Tarefa form prefilled from the Mensagem and the conversation's Viagem. Any Mensagem can be turned into a Tarefa, linked back to it. The Responsável and people in copy get a push when assigned or copied, and when the Prazo passes. Spec: `.scratch/comunicador/spec.md` (stories 47 for TAR, 55, 64, 67–70; Commands).

**Blocked by:** 09 (Web push basics), 11 (Cartões and Viagem cards), 12 (Tarefas replace Próximas ações).

**Status:** ready-for-agent

- [ ] Tarefas implement Cartões. A TAR card follows the Tarefa's current state and the reader's rights.
- [ ] Marking concluída from the card works, and every window's card updates.
- [ ] `/tarefa` in a Viagem's conversation opens the form with that Viagem. Saving posts the Tarefa's card.
- [ ] "Transformar em Tarefa" on a Mensagem creates a Tarefa that links back to the Mensagem.
- [ ] Pushes are recorded on assignment, on copy, and when the test clock passes the Prazo of an open Tarefa, once.
- [ ] `[[` also finds Tarefas by title.
