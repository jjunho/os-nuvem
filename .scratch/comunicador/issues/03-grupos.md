# 03: Grupos

**What to build:** Usuários create Grupos with a name and description, public or private. Public Grupos can be browsed and joined. Private ones are reached by invitation. Members can leave. The creator, and the Admin, rename, edit the description, change privacy, manage members and archive. An archived Grupo leaves the list but keeps its history. Guiamento Usuários can't browse or create Grupos, but read and write in those they're invited to. Spec: `.scratch/comunicador/spec.md` (stories 1–7, 15, 16; Rights).

**Blocked by:** 02 (Tracer bullet: a live Conversa direta).

**Status:** done

- [x] Create a public and a private Grupo. Another Usuário finds and joins the public one, but not the private one.
- [x] An invited Usuário reads and writes in the private Grupo. After leaving, they no longer receive it.
- [x] Only the creator and the Admin can rename, edit, change privacy, manage members and archive.
- [x] An archived Grupo leaves the default list and stays readable.
- [x] A Guiamento Usuário sees no Grupo list and no create button, and gets refused by the server too. Once invited, they read and write.
- [x] Mensagens in Grupos are live, like in ticket 02.
- [x] Strings in PT and KO.

## Comments

2026-09-25: implementado e revisado. Verificação: comunicador-parte1-conversas.spec.ts e comunicador-parte1-permissoes.spec.ts. Detalhes de operação e configuração em `docs/execucao-comunicador.md`.
