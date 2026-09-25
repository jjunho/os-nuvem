# 07: Search

**What to build:** A Usuário searches all the Mensagens they can read, in Portuguese or Korean, finding partial words and Korean syllables. They filter by conversation, author and date. Search never returns a Mensagem from a conversation the reader can't open. The Admin's search covers every conversation. Spec: `.scratch/comunicador/spec.md` (stories 34–36, 38, 39; Search).

Uses PostgreSQL `pg_trgm` over Mensagem text, always joined with the reader's readable conversations. Voice-note transcripts join the index in ticket 16. A result opens the conversation at that Mensagem.

**Blocked by:** 03 (Grupos), 05 (Admin supervision and first-sign-in notice).

**Status:** done

- [x] A fragment of a Portuguese word and a Korean syllable each find their Mensagens.
- [x] Filters by conversation, author and date narrow the results.
- [x] A Mensagem in a private Grupo or a Conversa direta the reader isn't in is never returned. The Admin's search returns it.
- [x] Deleted Mensagens aren't found, except by the Admin.
- [x] Tapping a result opens the conversation at that Mensagem.

## Comments

2026-09-25: implementado e revisado. Verificação: comunicador-parte2-leitura.spec.ts. Detalhes de operação e configuração em `docs/execucao-comunicador.md`.
