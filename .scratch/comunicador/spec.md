Status: ready-for-agent

# Spec: Comunicador

Built right after the login, before part 2 of the Viagem spec. Grilled on 2026-09-24.

## Problem Statement

CoreaLux's internal communication is split between KakaoTalk and WhatsApp groups (K834). Nothing links a conversation to the Viagem it is about. "Which trip?" is answered by scrolling. A passport photo sent in a chat is never filed with the Viajante. A problem a Guia reports from the field lives only in a phone. The commercial talk and the operational talk share the same groups, so guides read prices and margins they shouldn't see. Next actions are typed as chat messages and forgotten. Today's Próximas ações only exist per Viagem, so the team keeps the rest of its to-dos in chats and heads.

Moving the team off KakaoTalk is hard. KakaoTalk is on every phone, opens instantly, works with a weak signal and pings at once. Any replacement that feels slower or that misses a message will be abandoned.

## Solution

The **Comunicador** is Corealux OS's own chat, built into the app and reachable from the internet (ADR-0004). Every **Usuário** (always a funcionário) talks in **Grupos** (named, public or private), **Conversas diretas** (one to one) and the two **Conversas da viagem** each Viagem has: the **Interna**, for staff only, and the **Equipe**, with the Profissionais of its Dias and its Responsável. Guides never read the commercial talk.

It is a mobile-first PWA meant to beat KakaoTalk on the phone:
- A **Mensagem** appears on screen before the server answers.
- Mensagens typed without signal wait in an outbox and go out when signal returns.
- Mentions and Conversas diretas arrive as web push.
- A guided install puts the app on the Home Screen at first sign-in.

A Mensagem links to the rest of the system. Typing `V26-0142`, `TAR-…` or a Número da proposta turns into a card. `@` mentions a Usuário, `#` a Grupo, `[[` finds anything by name, `/` runs a command, and `!` records an Ocorrência. Every card shows only what the reader's **Papel** allows.

The **Tarefa** ships with the Comunicador and generalizes today's Próxima ação. A Tarefa is a concrete thing one Usuário must do, with a Prazo, people in copy and a `TAR-…` code. It is open, concluída or cancelada (closed because nobody needs it any more) and may belong to a Viagem. Any Mensagem can become a Tarefa. The kanban of Viagens and the personal Quadros where Tarefas are the cards come in their own spec (`.scratch/quadros-e-kanban/spec.md`).

Success means this: on a date Carlos sets and announces, the internal KakaoTalk and WhatsApp groups close, and Carlos leaves them first.

## User Stories

### Grupos and Conversas diretas

1. As a Usuário, I want to create a Grupo with a name and a description, so that a topic has one place to be discussed.
2. As a Usuário, I want to make a Grupo public or private, so that open topics are open and sensitive ones stay among the invited.
3. As a Usuário, I want to browse the public Grupos and join one, so that I can follow what interests me without being invited.
4. As a Usuário, I want to invite other Usuários to a private Grupo, so that only they read it.
5. As a Usuário, I want to leave a Grupo, so that I stop receiving what no longer concerns me.
6. As a Guiamento Usuário, I want to not see the list of Grupos or be able to create one, so that my Comunicador only holds what concerns my work.
7. As a Guiamento Usuário, I want to still read and write in the Grupos I am invited to, so that I can take part when someone brings me in.
8. As a Usuário, I want to start a Conversa direta with any other active Usuário, so that I can talk one to one.
9. As a Usuário, I want exactly one Conversa direta per pair of Usuários, so that I never hunt across duplicates.
10. As a Usuário, I want one list of my conversations, with Grupos, Conversas diretas and Conversas da viagem, ordered by latest Mensagem, so that I see what moved last.
11. As a Usuário, I want an unread count on each conversation and a total on the app's menu and icon, so that I know where to look.
12. As a Usuário, I want Mensagens from a deactivated Usuário to stay with their name marked inactive, so that history is never lost (ADR-0005).
13. As a Usuário, I want to be told at my first sign-in that the Admin can read every conversation, Conversas diretas included, so that nobody is surprised later.
14. As the Admin, I want to open any conversation, including Conversas diretas and private Grupos, so that I can supervise the team's communication.
15. As a Usuário, I want to rename a Grupo I created, or edit its description, so that it stays accurate.
16. As a Usuário, I want to archive a Grupo I created, so that dead topics leave the list but keep their history.

### Mensagens

17. As a Usuário, I want my Mensagem to appear in the conversation the moment I send it, so that the app feels faster than KakaoTalk.
18. As a Usuário, I want Mensagens from others to appear without reloading, so that the conversation is live.
19. As a Usuário, I want a sent Mensagem that the server refused to show an error with a retry, so that nothing I wrote disappears silently.
20. As a Usuário, I want to reply quoting a Mensagem, so that it is clear what I am answering.
21. As a Usuário, I want to tap a quoted Mensagem and jump to the original, so that I can read its context.
22. As a Usuário, I want to react to a Mensagem with an emoji, so that I can acknowledge it without writing.
23. As a Usuário, I want to see who reacted with each emoji, so that an acknowledgment is attributable.
24. As a Usuário, I want to edit my own Mensagem, with an "editada" mark, so that I can fix a typo without confusing anyone.
25. As a Usuário, I want to see the earlier versions of an edited Mensagem, so that an edit never rewrites what someone already acted on.
26. As a Usuário, I want to delete my own Mensagem, leaving an "apagada" placeholder, so that the conversation's flow still makes sense.
27. As the Admin, I want to still read the original of a deleted Mensagem, so that nothing important is lost by deleting.
28. As a Usuário, I want to write in Portuguese or Korean, with no translation, so that I write the way the team already writes.
29. As a Usuário, I want long conversations to load the latest Mensagens first and older ones as I scroll up, so that opening a conversation is instant.
30. As a Usuário, I want links to outside sites to stay plain links, so that the chat doesn't fetch third-party previews.

### Reading status and search

31. As a Usuário, I want the conversation to remember where I last read, so that I open it at my first unread Mensagem.
32. As a Usuário, I want "seen by" avatars under the latest Mensagem, so that I know who has read up to it.
33. As a Usuário, I want to mark a conversation unread, so that I come back to it later.
34. As a Usuário, I want to search all Mensagens I can read, in Portuguese or Korean, so that I find what was said without scrolling.
35. As a Usuário, I want search to find partial words and Korean syllables, so that a fragment of a name or word is enough.
36. As a Usuário, I want to filter a search by conversation, author and date, so that I narrow many results down.
37. As a Usuário, I want voice-note transcripts included in search, so that what was said aloud is findable.
38. As a Usuário, I want search never to return Mensagens from conversations I can't read, so that private talk stays private.
39. As the Admin, I want search to cover every conversation, so that I can find anything.

### Trigger keys, mentions and cards

40. As a Usuário, I want an index below the message box listing the trigger keys, so that I learn them without a manual (K830).
41. As a Usuário, I want `@` to open a list of Usuários as I type, so that I mention someone without spelling their full name.
42. As a Usuário, I want `@todos` to notify everyone in the conversation, so that an announcement reaches all.
43. As a Usuário, I want `@aqui` to notify only those currently active in the conversation, so that I can ask the people who are around right now.
44. As a mentioned Usuário, I want the Mensagem highlighted and a push notification, so that I never miss being called.
45. As a Usuário, I want `#` to link a Grupo, so that I can point someone to where a topic is discussed.
46. As a Usuário, I want typing a Código da viagem such as `V26-0142` to turn into a Viagem card, so that "which trip?" is never asked.
47. As a Usuário, I want typing a `TAR-…`, `OC-…` or Número da proposta to turn into its card, so that every coded thing links itself.
48. As a Usuário, I want `[[` to open a picker that searches Tarefas, Viagens (by Cliente), Pendências, Dias, Clientes, Agências, Fornecedores, Profissionais and Tours by name, so that things without a code can also be linked.
49. As a Usuário, I want a pasted link to any screen of the app to become a card, so that sharing a screen shows what it is.
50. As a reader, I want each card to show only what my Papel allows (no prices for Conteúdo or Guiamento, only my own Dias for Guiamento), so that mentions never leak what I shouldn't see.
51. As a reader without access to a mentioned thing, I want the card to say it is restricted instead of hiding the Mensagem, so that the conversation still reads correctly.
52. As a Usuário, I want the text of a Mensagem never filtered by Papel, so that what a person wrote stays exactly what they wrote.
53. As a Usuário, I want a card to show the thing's current state (e.g. the Viagem's Etapa now), so that old Mensagens don't mislead.
54. As a Usuário, I want to tap a card to open the thing's screen, so that the chat is a way into the system.

### Commands

55. As a Usuário, I want `/tarefa` to create a Tarefa from the message box, with Responsável, Prazo and Viagem, so that a decision in chat becomes a tracked action.
56. As the Admin or the Responsável of a Viagem em viagem, I want `/urgente` to send a Mensagem that gets through DND, so that emergencies on a trip reach people.
57. As a Usuário without that right, I want `/urgente` to be refused with the reason, so that I understand why.
58. As a Usuário, I want `/bug` to fill the technical-report format (página, ação, esperado, observado, reprodução, aparelho/navegador/idioma, K940) and attach the screen I was on, so that problems reach the curators complete.
59. As a Usuário in a Viagem's Equipe conversation, I want `!` to record an Ocorrência prefilled with the Viagem and today's Dia, so that what happens in the field is recorded where it is reported (live once Ocorrência exists).

### Tarefas

60. As a Usuário, I want to create a Tarefa with a title, description, one Responsável, a Prazo and people in copy, so that every commitment has one owner and a date.
61. As a Usuário, I want a Tarefa to optionally belong to a Viagem, so that trip work and office work are one kind of thing.
62. As a Usuário, I want each Tarefa to have a `TAR-…` code, so that I can mention it anywhere.
63. As a Usuário, I want to mark a Tarefa concluída, and reopen it, so that done work leaves my list without being lost.
64. As a Usuário, I want to mark a Tarefa concluída from its card in chat, so that closing it takes a second.
65. As a Usuário, I want a simple list of Tarefas filtered by Responsável, by copy, by Viagem and by overdue Prazo, so that I see my own work or one trip's work until the Quadros arrive.
66. As a Usuário, I want "Minhas Tarefas" as the default view, so that I start from what is mine.
67. As a Usuário, I want to turn any Mensagem into a Tarefa, linked back to it, so that nothing decided in chat is forgotten.
68. As a Usuário, I want a Tarefa's card in chat to show whether it is open or concluída, its Responsável and Prazo now, so that a mention stays current.
69. As a Responsável of a Tarefa, I want a notification when I am assigned or put in copy, so that I know it exists.
70. As a Usuário, I want to be notified when a Tarefa I own or am copied on passes its Prazo, so that nothing silently goes overdue.
71. As a salesperson, I want the Próxima ação of a Viagem to be its open Tarefa with the earliest Prazo, so that the pipeline keeps working with the new model.
72. As a salesperson, I want the automatic "responder" and follow-up Próximas ações to be created as Tarefas, so that nothing changes in how leads are chased.
73. As Carlos, I want the pipeline's overdue Próxima ação view to keep working after the change, so that I still see what is at risk.
74. As a Guiamento Usuário, I want to see only the Tarefas I own or am copied on, so that I am not shown the commercial work.

### Conversas da viagem

75. As a salesperson, I want the Interna conversation of a Viagem created on its first Mensagem, so that trips without talk don't clutter my list.
76. As a staff Usuário, I want to open a Viagem's Interna conversation from the Viagem screen, so that the trip's talk is one tap from its data.
77. As a Guiamento Usuário, I want never to see a Viagem's Interna conversation, so that I never read prices, margins or commercial talk.
78. As a Guia, I want a Viagem's Equipe conversation created at its first Alocação, with the Usuários among the Profissionais of its Dias plus its Responsável, so that the people working the trip are together from the start.
79. As a Responsável, I want the Equipe conversation's members to follow the Alocações as they change, so that nobody is left out or left in.
80. As a Usuário, I want the Equipe conversation archived when the Viagem ends, so that my list only holds live trips while the history stays readable.
81. As a Usuário, I want both Conversas da viagem named by the Código da viagem and the Cliente, so that I recognise them in my list.

### Photos, files and voice notes

82. As a Usuário, I want to send photos from the camera or the gallery, compressed before sending, so that it works on mobile data.
83. As a Usuário, I want photos kept permanently, so that a receipt or a document sent months ago is still there.
84. As a Usuário, I want to open a photo full-screen and zoom, so that I can read a document in it.
85. As a staff Usuário, I want "Mover para o Viajante" on a photo, so that a passport or a personal document is filed with that Viajante and removed from the chat.
86. As the Admin, I want to purge a photo or voice note, so that sensitive media can be removed for good.
87. As a Usuário, I want to record and send a voice note by holding a button, so that I can report from the field without typing.
88. As a Usuário, I want each voice note transcribed, with the transcript shown under it, so that I can read it in a meeting or on a bus.
89. As a Usuário, I want a voice note to play at once even when transcription is unavailable, and its transcript to appear later, so that an outside service never blocks the chat (ADR-0004).

### Notifications, install and offline

90. As a Usuário, I want a guided install to the Home Screen at my first sign-in on a phone, so that notifications work on iOS.
91. As a Usuário, I want a web push for every mention and every Mensagem in a Conversa direta, so that I am reached like on KakaoTalk.
92. As a Usuário, I want a setting per Grupo (every Mensagem / mentions only / muted), so that busy Grupos don't drown me.
93. As a Usuário, I want DND hours in my own time zone, so that I am not woken at night.
94. As a Usuário, I want an urgent Mensagem to get through my DND, so that trip emergencies still reach me.
95. As a Usuário, I want tapping a notification to open the exact Mensagem, so that I land where I was called.
96. As a Usuário, I want no push for a conversation I am currently reading, so that I am not pinged for what I see.
97. As a Usuário, I want Mensagens typed without signal to wait in an outbox, marked as pending, and send in order when signal returns, so that working in a tunnel or on a mountain loses nothing.
98. As a Usuário, I want the conversations I opened recently to be readable offline, so that I can check the plan without signal.
99. As a Usuário, I want to see the Comunicador in Portuguese or Korean per my Idioma da interface (ADR-0006), so that the interface is in my language.
100. As a Usuário on a desktop, I want the Comunicador available beside any screen, so that I can talk about a Viagem while looking at it.

### Transition

101. As Carlos, I want to set and announce the date the internal KakaoTalk and WhatsApp groups close, so that the switch happens together.
102. As a Usuário, I want to be signed in on my phone and my computer at once, with the same read state, so that I switch devices freely.

## Implementation Decisions

- **Build order is by vertical slice,** matching the parts in Testing Decisions. Sequencing follows dependencies, not effort: the whole v1 is built at once. Pendência, Ocorrência and the `!` trigger arrive when the Operação spec builds them. The Equipe conversation's creation and membership hook into the Alocação command, so that part is blocked by Alocação. The rest ships together.
- **Built in-house, inside the one Node process** (ADR-0003, ADR-0004). No Mattermost, Zulip, Redis or message broker. Real-time delivery uses one long-lived server-to-browser stream per open app (Server-Sent Events) and ordinary requests to send. Fan-out happens in the process's memory, since there is one process. A client that reconnects asks for everything after the last Mensagem it holds, so a dropped stream loses nothing.
- **Modules:**
  - **Comunicador** (new): conversations (Grupo, Conversa direta, Conversa da viagem Interna and Equipe), membership, Mensagens with edits, deletes, quotes and reactions, reading points, search, media, per-Usuário notification settings. It owns who may read and write each conversation. It asks Acesso for the reader's Papel and asks each owning module to render a card.
  - **Leitura de mensagem** (new, deep module, pure): its input is the text of a Mensagem plus the lists it may resolve against (Usuários, Grupos, code patterns, the app's origin). Its output is the Mensagem as ordered segments: plain text, mention of a Usuário, `@todos`, `@aqui`, Grupo link, coded reference (Código da viagem, TAR, OC, Número da proposta), app link, and a leading command (`/tarefa`, `/urgente`, `/bug`). It has no I/O and runs in the browser (live highlighting as you type) and on the server (authoritative, on save).
  - **Decisão de notificação** (inside the same pure module): its inputs are the Mensagem's segments, the conversation kind, each member's per-Grupo setting, DND hours and time zone, whether they are reading the conversation now, and whether the Mensagem is urgent. Its output is who gets a push and who gets only the unread count. It takes the time as an input and never reads a clock.
  - **Tarefas** (new, replaces `proximas_acoes`): Tarefa, open, concluída or cancelada (with who and why), Responsável, people in copy, Prazo, optional Viagem, source Mensagem, TAR code. The Viagens module stops owning Próximas ações. It creates its automatic "responder" and follow-up items as Tarefas, and reads the Próxima ação as the open Tarefa of the Viagem with the earliest Prazo. Its interface is built so the Quadros spec can place Tarefas on lists and turn the automatic ones into Tarefas da etapa, concluded by the fact they ask for (ADR-0007), without changing it. The Quadros spec also adds the Conversa da tarefa, a conversation kind for each Tarefa's comments and activity. The existing part-1 tests of the Viagem spec must keep passing unchanged, apart from wording where the screen now says Tarefa.
  - **Cartões** (an interface every owning module implements): given a reference and a reader, return the card's fields that reader's Papel may see, or "restricted". Viagens, Tarefas and later Operação, Catálogo, Fornecedores and Orçamentos implement it. The Comunicador never reads their tables directly.
  - **Acesso** (from the login work): Papel and the Usuário–Profissional link for Guiamento. The Comunicador checks read and write rights on every request and on every stream event, not only in the screens.
  - **Adapters at the edge** (the only new seams): **Envio de push** (Web Push with VAPID keys, no third-party service beyond the browsers' push endpoints) and **Transcrição** (Gemini). Each has a real implementation and a recording fake. The fake is selected in the test build and read through a test-only route, like `/test/reset`.
- **Names:** Comunicador, Grupo, Conversa direta, Conversa da viagem (Interna and Equipe), Mensagem, Tarefa. Never "Canal", which is taken by Canal comercial (see `CONTEXT.md`).
- **Participants:** every conversation member is a Usuário, and a Usuário is always a funcionário. A funcionário Guia has a Guiamento Usuário linked to their Profissional. Outside Profissionais never sign in. Today no outside Guia works CoreaLux Viagens, so every Equipe conversation reaches the whole Equipe. If that changes, this spec is revisited.
- **Rights:**
  - Any Usuário but Guiamento creates and browses Grupos. Guiamento joins only by invitation.
  - The creator of a Grupo manages its name, description, privacy, members and archiving, and so does the Admin.
  - Only the author edits a Mensagem. The author deletes it, and so does the Admin.
  - The Admin reads every conversation.
  - Only the Admin, and the Responsável of a Viagem em viagem in that Viagem's conversations, may send urgent Mensagens.
- **Conversas da viagem:** the Interna is created on its first Mensagem, staff only (every Papel but Guiamento can open it from the Viagem). The Equipe is created on the Viagem's first Alocação. Its members are the Usuários linked to the Profissionais allocated to any of its Dias, plus the Responsável, and they are recomputed whenever an Alocação or the Responsável changes. It is archived (read-only, out of the default list) when the Viagem ends.
- **Mensagem storage:**
  - A Mensagem keeps its author, conversation, time, text, parsed segments, optional quoted Mensagem, and its media.
  - Edits append a version and never overwrite.
  - A delete sets a deleted mark. The original is kept and returned only to the Admin.
  - Reactions are one row per Usuário × emoji × Mensagem.
- **Reading status:** one "last read" Mensagem per Usuário per conversation. Unread counts and "seen by" are derived from it. It syncs across devices.
- **Search:** PostgreSQL `pg_trgm` over Mensagem text and voice-note transcripts, which works for Korean without a tokenizer. The query is always joined with the reader's readable conversations.
- **Media:**
  - Photos are compressed in the browser before upload.
  - Files are stored on the server's disk. The database holds their metadata, owner and conversation.
  - Every download checks the reader's right to the conversation.
  - "Mover para o Viajante" attaches the file to that Viajante's documents and leaves a placeholder in the chat.
  - The Admin purge deletes the file from disk and leaves a placeholder.
- **Voice notes:** recorded in the browser (the format each browser produces, including iOS), stored like photos, and playable at once. Transcription is queued. When Gemini is unavailable the job is retried later with backoff, and the voice note never waits for it. The transcript is stored with the Mensagem and indexed for search.
- **Optimistic sending and the outbox:**
  - Each Mensagem gets a client-generated id, so a retry never duplicates it.
  - Sending shows the Mensagem immediately as pending. The server's answer confirms it or marks it failed.
  - Offline, pending Mensagens are kept in the browser (IndexedDB) and sent in order when the connection returns.
  - A service worker caches the app shell and recently opened conversations.
- **Notifications:**
  - A web push goes out for mentions (`@usuário`, `@todos`, `@aqui` for those active), for every Mensagem in a Conversa direta, and per the Grupo setting (every Mensagem / mentions only / muted).
  - DND hours are set in the Usuário's own time zone, and urgent Mensagens get through them.
  - A member currently viewing the conversation gets no push.
  - Push subscriptions are stored per device and removed when the push service rejects them.
- **Install:** at the first sign-in on a phone, a guided screen explains how to add the app to the Home Screen (with iOS-specific steps), and then asks for notification permission. The same screen tells the Usuário that the Admin can read every conversation.
- **Commands:** `/tarefa` opens the Tarefa form prefilled from the Mensagem and the conversation's Viagem. `/urgente` marks the Mensagem urgent after checking the right. `/bug` opens a form with the K940 fields (página, ação, esperado, observado, reprodução, aparelho/navegador/idioma), prefilled with the last app screen's address, the device, browser and interface language, and a capture of that screen taken in the browser. It posts the report as a Mensagem in the conversation where it was typed.
- **Cards:** created when a Mensagem is saved (from its segments), rendered at read time per reader through the Cartões interface, so they always show the current state and the reader's Papel.
- **Layout:** on a phone, the Comunicador is its own full screen. On a desktop it is a panel that can be opened beside any screen. "The screen I was on" for `/bug` is the last non-Comunicador screen.
- **Interface language:** every Comunicador string is available in Portuguese and Korean per Usuário (ADR-0006). Mensagens are never translated.

## Testing Decisions

Tests are **vertical first, then one transversal test** at the end, as in the other specs. Seams agreed: Playwright through the production build and the real test database as the main seam; one pure module with fast table tests; recording fakes only for the two outside services.

- **What makes a good test:** it drives the app from the outside the way a Usuário would, through every layer down to the real database, and checks what the Usuário sees: the Mensagem in the other person's window, the unread count, the card's fields for that Papel, the push that was recorded. It never checks internal steps, and it never mocks our own modules. Only Web Push delivery and Gemini are replaced, by recording fakes read through a test-only route.
- **Real-time is tested with two or more browser contexts,** one per Usuário, signed in with different Papéis. The clock is controlled with the existing `x-test-now` cookie (the Viagem spec's part 1 helpers). Offline is tested with the browser context set offline, then online again.
- **Vertical tests, one set per part.** Each part below is built and tested as a thin slice (screen → module → database) before the next starts. Files are named `comunicador-parteN-*.spec.ts`, to avoid clashing with the Viagem spec's `parteN` files.
  1. **Conversations and Mensagens:**
     - Create public and private Grupos, join, leave and invite. Guiamento can't browse or create.
     - Start a Conversa direta, only one per pair.
     - Send, and see it appear in the other context without reload.
     - Quote-reply, reactions, and edits with visible history.
     - Delete with the "apagada" placeholder while the Admin still reads the original.
     - The Admin opens a Conversa direta between two others.
     - The first-sign-in notice.
  2. **Reading and search:**
     - Reading point and first-unread positioning, unread counts, "seen by" avatars, mark as unread, the same read state on two devices.
     - Search in Portuguese and Korean with partial words.
     - Search never returns Mensagens from a conversation the reader can't open, while the Admin's search does.
  3. **Trigger keys and cards:**
     - The index below the box.
     - `@` mention with a push recorded. `@todos` versus `@aqui`.
     - `#` Grupo. `V26-…` becomes a Viagem card, and a pasted app link becomes a card. `[[` finds a Viagem by Cliente.
     - The same Mensagem shows the Viagem card with the price to the Admin and without it to Conteúdo. Guiamento gets "restricted" for a Viagem not its own, and the text is unchanged for all three.
     - A card shows the Etapa current at read time.
  4. **Tarefas:**
     - Create a Tarefa with copy and a Prazo, get its TAR code, mark it concluída and reopen it, and filter the list by Responsável and overdue.
     - `/tarefa` from the box. Mensagem → Tarefa linked back.
     - A Viagem's Próxima ação is its earliest open Tarefa. The automatic "responder" Tarefa is created on a new Viagem.
     - The pipeline's overdue view still works: the Viagem spec's part 1 tests pass unchanged.
  5. **Conversas da viagem** (blocked by Alocação):
     - The Interna is created on the first Mensagem, and Guiamento can't open it.
     - The Equipe is created on the first Alocação with the right members. Members follow an Alocação change and a Responsável handoff.
     - The Equipe conversation is archived when the Viagem ends and stays readable.
  6. **Media and voice notes:**
     - Send a photo, which is compressed and viewable, and a download is refused to a non-member.
     - "Mover para o Viajante" files it with the Viajante and leaves a placeholder. Admin purge.
     - A voice note plays at once, gets its transcript from the fake, and the transcript is searchable.
     - With the fake transcription failing, the voice note still plays and is transcribed on a later retry.
  7. **Notifications, commands and offline:**
     - Push for a Conversa direta and for a mention. Per-Grupo settings (every / mentions / muted).
     - DND in the Usuário's time zone holds a push, and an urgent Mensagem gets through.
     - `/urgente` refused to a non-Responsável and allowed to the Responsável of a Viagem em viagem.
     - No push while reading the conversation.
     - `/bug` posts the K940 fields with the previous screen's address and a capture.
     - Offline: typed Mensagens show as pending, arrive in order when back online and are never duplicated after a retry.
     - The interface in Korean for a Korean-preferring Usuário.
- **Speed budgets** (ADR-0003) in `comunicador-velocidade.spec.ts`, against a database seeded with realistic volume (tens of Usuários, hundreds of conversations, hundreds of thousands of Mensagens):
  - a sent Mensagem visible in its sender's window within 100 ms;
  - visible in another Usuário's window within 300 ms;
  - opening a conversation within 300 ms;
  - the latest page of Mensagens and a search, each a server read within 100 ms.
- **The pure module** (Leitura de mensagem and Decisão de notificação) has fast table-driven Vitest tests at its own interface, like the Viagens rules, because its combinations are too many to cover through the screen:
  - segments for mixed PT/KO text, codes at word edges, codes inside links, `@` in e-mail addresses, commands only at the start;
  - notification decision for conversation kind × Grupo setting × DND across time zones and midnight × urgent × mention × currently reading.

  These add to the vertical tests and don't replace them.
- **One transversal test, written last,** runs one realistic day through every part in order:
  1. A lead arrives, and its "responder" Tarefa appears.
  2. The salesperson talks about it in the Interna with a `V26-…` card.
  3. Carlos, as the Admin, is mentioned and replies from a push.
  4. The Viagem is confirmed and allocated, and the Equipe conversation appears with the Guia.
  5. The Guia, as Guiamento, sends a photo and a voice note from the field while offline, and both go out when back online.
  6. The Responsável sends an urgent Mensagem through the Guia's DND.
  7. A Mensagem becomes a Tarefa that is marked concluída.
  8. The Viagem ends, and the Equipe conversation is archived.

  The test checks what each Usuário sees at each step, not only the end.
- **Prior art:** the Viagem spec's part 1 vertical and speed tests (Playwright helpers for reset, clock and sign-in; bulk seeding in SQL for volume) and the Viagens rules' Vitest table tests.

## Out of Scope

- Threads (quote-reply only in v1).
- Translation of Mensagens.
- The documentation-page trigger, which is reserved for a future spec.
- Outside Profissionais in conversations. They never sign in. This is revisited if an outside Guia starts working CoreaLux Viagens.
- Talking to Clientes, Agências or Viajantes. Respond.io, WhatsApp Business and e-mail integration stay in their channels.
- Voice or video calls, screen sharing, stories, and message scheduling.
- Native iOS or Android apps. The PWA is the phone app.
- End-to-end encryption. The Admin reads everything by design.
- The Pipeline's kanban, the Tarefas da etapa and the Quadros (lists, moving and sending Tarefas, checklists, labels, attachments, the Conversa da tarefa). They have their own spec: `.scratch/quadros-e-kanban/spec.md`.
- Pendência and Ocorrência themselves, which belong to the Operação spec. The `!` trigger and `OC-…` cards go live when Ocorrência exists.
- Retention rules beyond the Admin purge.
- How the Pi is exposed to the internet, and its backups (ADR-0004).
- Importing KakaoTalk or WhatsApp history.

## Further Notes

- **Sources:**
  - Glossary: `CONTEXT.md` (Comunicação interna, Tarefa, Próxima ação, Usuário, Papel).
  - Decisions: ADR-0003 (stack and speed budgets), ADR-0004 (Pi, internet-reachable, no extra services, external APIs only when the app works without them), ADR-0005 (login, deactivation), ADR-0006 (interface in PT and KO).
  - Acervo: K834 (move internal communication off KakaoTalk and WhatsApp), K830 (trigger-key index below the message box), K940 (technical-report format; Juliano and Bruno curate reports) in `../docs/negocio/`.
- **Choices made in writing this spec, not in the grilling. Revisit if they are wrong:**
  - Server-Sent Events for real-time delivery.
  - Photos compressed in the browser.
  - Media stored on the server's disk.
  - Guiamento sees only the Tarefas it owns or is copied on.
  - The creator of a Grupo, and the Admin, manage it.
  - `/bug` posts in the conversation where it was typed rather than in a dedicated Grupo.
  - `@aqui` reaches those with the conversation open or active in the last few minutes.
- **Replacing `proximas_acoes` with Tarefas** touches code already built for the Viagem spec's part 1. The migration moves existing rows into Tarefas with the same Responsável, Prazo and Viagem.
- **Web push on iOS** works only for an app installed to the Home Screen (iOS 16.4 or later). This is why the guided install is part of the first sign-in, not an optional tip.
