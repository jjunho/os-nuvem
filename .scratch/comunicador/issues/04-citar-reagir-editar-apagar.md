# 04: Quote, reactions, edit, delete

**What to build:** A Usuário replies quoting a Mensagem and taps the quote to jump to the original. They react with emojis and see who reacted with each. The author edits their own Mensagem, which shows "editada" and keeps earlier versions anyone can see. The author, or the Admin, deletes a Mensagem, which leaves an "apagada" placeholder while the Admin still reads the original. Mensagens from a deactivated Usuário stay, with their name marked inactive. Spec: `.scratch/comunicador/spec.md` (stories 12, 20–27; Mensagem storage).

Edits append a version and never overwrite. A delete sets a mark and keeps the original. A reaction is one row per Usuário × emoji × Mensagem. All changes reach other windows live.

**Blocked by:** 02 (Tracer bullet: a live Conversa direta), Login 07 (Deactivate and reactivate a Usuário).

**Status:** done

- [x] Quote-reply shows the quoted Mensagem, and tapping it scrolls to the original, loading it if needed.
- [x] Reactions show counts and who reacted. The same Usuário can't add the same emoji twice.
- [x] Only the author can edit. The other window shows "editada" and the version history.
- [x] After a delete, members see "apagada", the Admin sees the original, and the server never sends the original to others.
- [x] A deactivated author's Mensagens stay, with their name marked inactive.

## Comments

2026-09-25: implementado e revisado. Verificação: comunicador-parte1-conversas.spec.ts. Detalhes de operação e configuração em `docs/execucao-comunicador.md`.
