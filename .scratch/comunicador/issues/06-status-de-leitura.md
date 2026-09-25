# 06: Reading status and loading older Mensagens

**What to build:** Each conversation remembers where the Usuário last read, one reading point per Usuário per conversation, and opens at the first unread Mensagem. Each conversation shows an unread count, and the menu and app icon show a total. "Seen by" avatars sit under the latest Mensagem. A Usuário can mark a conversation unread. The read state is the same on phone and computer at once. Long conversations load the latest page first and older Mensagens as you scroll up. Spec: `.scratch/comunicador/spec.md` (stories 11, 29, 31–33, 102; Reading status).

**Blocked by:** 02 (Tracer bullet: a live Conversa direta).

**Status:** done

- [x] Reopening a conversation lands on the first unread Mensagem.
- [x] Unread counts per conversation and the total update live as Mensagens arrive and are read.
- [x] "Seen by" avatars update when another member reads.
- [x] Mark as unread brings the count back.
- [x] Reading in one context, signed in as the same Usuário, clears the count in the other.
- [x] Scrolling up loads older pages, keeping the scroll position.
- [x] Vertical tests in `comunicador-parte2-*.spec.ts`.

## Comments

2026-09-25: implementado e revisado. Verificação: comunicador-parte2-leitura.spec.ts. Detalhes de operação e configuração em `docs/execucao-comunicador.md`.
