# 08: Leitura de mensagem and trigger keys

**What to build:** The pure Leitura de mensagem module, and what it enables in the message box. Its input is a Mensagem's text plus what it may resolve against: Usuários, Grupos, code patterns and the app's origin. Its output is ordered segments: plain text, Usuário mention, `@todos`, `@aqui`, Grupo link, coded reference (Código da viagem, TAR, OC, Número da proposta), app link, and a leading command (`/tarefa`, `/urgente`, `/bug`). It has no I/O. It runs in the browser for live highlighting and on the server, authoritatively, on save. Segments are stored with the Mensagem. Spec: `.scratch/comunicador/spec.md` (stories 40, 41, 45; Leitura de mensagem).

In the message box: an index below it lists the trigger keys (K830). `@` opens a list of Usuários as you type, and `#` a list of Grupos. Mentions show highlighted, and Grupo links open the Grupo.

**Blocked by:** 03 (Grupos).

**Status:** done

- [x] Table-driven Vitest tests: mixed PT/KO text, codes at word edges, codes inside links, `@` inside e-mail addresses, commands only at the start.
- [x] The trigger-key index shows below the box, in the Usuário's language.
- [x] `@li` suggests Lia, and choosing her inserts the mention. The Mensagem shows it highlighted for everyone, and highlighted as "you" for Lia.
- [x] `#` suggests Grupos, and the link opens the Grupo. A Guiamento reader who isn't a member sees it without access.
- [x] Segments saved by the server match what the browser showed.
- [x] Vertical tests in `comunicador-parte3-*.spec.ts`.

## Comments

2026-09-25: implementado e revisado. Verificação: leitura.test.ts e comunicador-parte3-notificacoes.spec.ts. Detalhes de operação e configuração em `docs/execucao-comunicador.md`.
