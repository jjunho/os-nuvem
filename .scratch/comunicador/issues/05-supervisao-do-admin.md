# 05: Admin supervision and first-sign-in notice

**What to build:** The Admin opens any conversation, including Conversas diretas between others and private Grupos they aren't in. Every Usuário is told, at their first sign-in, that the Admin can read every conversation, Conversas diretas included. Spec: `.scratch/comunicador/spec.md` (stories 13, 14; Rights).

**Blocked by:** 03 (Grupos).

**Status:** done

- [x] The Admin lists and opens a Conversa direta between two other Usuários, and a private Grupo they weren't invited to.
- [x] A non-Admin can't do the same by URL or request.
- [x] The notice appears once at a Usuário's first sign-in, is recorded as seen, and doesn't appear again.
- [x] Strings in PT and KO.

## Comments

2026-09-25: implementado e revisado. Verificação: comunicador-parte7-instalacao.spec.ts e comunicador-parte1-conversas.spec.ts. Detalhes de operação e configuração em `docs/execucao-comunicador.md`.
