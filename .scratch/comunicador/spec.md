Status: ready-for-agent

# Spec: Comunicador

To be grilled in its own session. Built right after the login, before part 2 of the Viagem spec.

## Known so far

- Carlos wants all internal communication, today split between KakaoTalk and WhatsApp, moved into Corealux OS's own chat (K834).
- Slack-style: channels and direct conversations.
- Triggers in the message box: mention a Usuário, a task, a documentation page (K830 records the trigger-key index below the message box).
- Essential: it is the reason the app is reachable from the internet (ADR-0004).
- Nothing is in use today; this is built from scratch.

## Decided (grilling, 2026-09-24)

- Names: the feature is the Comunicador. A named conversation is a Grupo, a one-to-one one is a Conversa direta, the unit is a Mensagem. Never "Canal" (taken by Canal comercial).
- Built in-house, inside the one Node process (ADR-0004: no extra services). No Mattermost/Zulip. The competitor is KakaoTalk on the phone: mobile-first PWA, Mensagens shown before the server answers, an offline outbox that sends when signal returns, and a guided install to the Home Screen on first sign-in (iOS web push needs it).
- Participants are all Usuários, and a Usuário is always a funcionário. A funcionário Guia gets a Guiamento Usuário linked to their Profissional. Outside Profissionais never sign in; today no outside Guia works CoreaLux Viagens, so every Equipe conversation reaches the whole Equipe. If that changes, this is revisited. Guiamento can't browse or create Grupos.
- Grupos: any Usuário but Guiamento creates them, public or private. Text is never filtered; mention cards render per the reader's Papel.
- Each Viagem has two Conversas da viagem: Interna (staff only, created on the first Mensagem) and Equipe (the Usuários among the Profissionais of its Dias + Responsável, created on the first Alocação, archived when the Viagem ends).
- Tarefa (Trelelê) ships with the Comunicador. It generalizes today's proximas_acoes: Viagem optional, people in copy, columns Novo / Em foco / Aguardando / Concluído, TAR code, mentioned with `[[`. The Próxima ação of a Viagem is its open Tarefa with the earliest Prazo. Mensagem → Tarefa is included.
- Trigger keys (the index below the message box lists them): `@` a Usuário, with `@todos` and `@aqui`; `#` a Grupo; `/` commands (`/tarefa`, `/urgente`, and `/bug`, which fills the K940 report format and attaches the current screen); `!` records an Ocorrência from the conversation (prefilled with the Viagem and today's Dia in its Equipe conversation), live once Ocorrência exists; `[[` a picker that searches anything by name (Tarefa, Viagem by Cliente, Pendência, Dia, Cliente, Agência, Fornecedor, Profissional, Tour) and inserts a card. The documentation-page trigger is reserved for a future spec.
- Codes turn into cards when typed: `V26-0142` (Viagem), `TAR-…` (Tarefa), `OC-…` (Ocorrência), the Número da proposta. Things without a code come through `[[`, and any pasted link to a screen of the app becomes a card. Every card shows only what the reader's Papel allows.
- Quote-reply, no threads in v1. Reactions. Edits keep history. Deleting leaves an "apagada" placeholder, and Admin still sees the original. Search with pg_trgm (Korean-safe).
- Read status: one "last read" point per Usuário per conversation, shown as "seen by" avatars under the latest Mensagem.
- Media: photos kept permanently, compressed. "Mover para o Viajante" files personal documents where they belong, and Admin can purge. Voice notes in v1, transcribed by Gemini, and the transcript is searchable.
- Notifications: web push for mentions and Conversas diretas, a per-Grupo setting (every Mensagem / mentions only / muted), DND hours in the Usuário's time zone. Urgent gets through DND, and only Admin and the Responsável of a Viagem em viagem can send it.
- The Admin Papel reads every conversation, Conversas diretas included. Every Usuário is told so at first sign-in.
- Success criterion: on a date Carlos sets and announces, the internal KakaoTalk and WhatsApp groups close, and he leaves them first.
- No translation of Mensagens: the team writes in PT or KO and most read both. The interface is PT or KO per Usuário (ADR-0006).
- Pendência and Ocorrência (and `!`) arrive when the Operação spec builds them; the rest ships together.
- Sequencing is by dependency, not effort: the whole v1 is built at once.
