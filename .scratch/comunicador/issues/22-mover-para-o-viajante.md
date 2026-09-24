# 22: Mover para o Viajante

**What to build:** A staff Usuário uses "Mover para o Viajante" on a photo, so that a passport or personal document is filed with that Viajante's documents and removed from the chat, leaving a placeholder. Spec: `.scratch/comunicador/spec.md` (story 85; Media).

The Viajante is the one record per traveller from Viagem ticket 02 (`.scratch/viagem-orcamento-proposta/issues/02-viajantes-um-registro.md`). The document is attached to that same record, which the Operação spec's Dados de viagem also extend; it is never copied to a second store.

**Blocked by:** 15 (Photos), Viagem 02 (The Viagem's Viajantes: one record, reused everywhere).

**Status:** ready-for-agent

- [ ] The action lists the Viajantes of the conversation's Viagem, and any Viajante by search elsewhere.
- [ ] After moving, the file is among the Viajante's documents, and the chat shows a placeholder for everyone.
- [ ] Guiamento doesn't get the action.
- [ ] The file's access follows the Viajante's rules from then on.
