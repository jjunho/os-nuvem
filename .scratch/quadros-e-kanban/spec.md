Status: done

# Spec: Pipeline and Quadros

Built on the Tarefa that ships with the Comunicador (`.scratch/comunicador/spec.md`). Grilled on 2026-09-24.

## Problem Statement

The team abandoned Trello in March 2026 and keeps its to-dos in chats, heads and the Excel pipeline (K460). The Trelelê prototype Carlos validated on 13/09 showed what he wants: a Trello-like board for delegating and referencing work, integrated with the rest of the system (K876). Meanwhile, a Viagem's stage is still something someone types, so it drifts from what really happened, the way the old "Andamento" column did.

Two different things are needed. Staff need a personal task manager where anything can be written down ("dentista às 17h") and handed to a colleague. Carlos needs a board of Viagens that tells the truth by itself: where each trip really stands and what is missing for it to move on, without anyone dragging cards to keep it current.

## Solution

The **Pipeline** is the view of Viagens by Etapa, as the existing list or as a kanban whose columns are the Etapas. A Viagem is never dragged on it. Its **Etapa is inferred** from what has been recorded on it: an Orçamento exists, a Proposta was sent, a new Versão was started after it, an Aceite was recorded (ADR-0007). The Etapa only moves forward, stays where it is, or ends in success or failure. A wrong Etapa, caused by a fact recorded by mistake, is fixed by a **Correção de etapa**.

Entering an Etapa creates that Etapa's **Tarefas da etapa** from an editable template (ADR-0001). Each one asks for a fact ("enviar proposta" asks for an Envio of a Proposta), and the system concludes it when the fact is recorded. When the fact happens outside the system (the Cliente answered on WhatsApp), the person concludes the Tarefa by recording the fact, with what and why. Nobody creates a Tarefa da etapa by hand; work never starts on the kanban.

**Quadros** are Trello-style boards of lists whose cards are Tarefas. Every Usuário has a personal Quadro (Novo, Em foco, Aguardando, Concluído) where Tarefas handed to them land, and can create, share and archive more. A personal Tarefa is added straight on a Quadro, from a Mensagem or with `/tarefa`, and is concluded with a click. A Tarefa sits on exactly one list of one Quadro. Sending it to someone hands it over: they become its Responsável, it lands on their personal Quadro, and the sender stays in copy. Each Tarefa has its **Conversa da tarefa** in the Comunicador for comments and activity.

## User Stories

### Pipeline

1. As Carlos, I want the Pipeline as a kanban whose columns are the open Etapas, beside the existing list with the same filters (Responsável, Canal comercial, overdue Próxima ação), so that I see every trip's stage at a glance.
2. As Carlos, I want each Viagem's Etapa worked out from what was recorded on it, so that the Pipeline tells the truth without anyone keeping it current.
3. As a salesperson, I want no way to drag a Viagem or pick its Etapa, so that a stage never claims something that did not happen.
4. As a salesperson, I want a Viagem to enter em orçamento when its first Orçamento is created, proposta enviada when a Proposta Envio is recorded, em negociação when the Cliente asks for changes or a new Versão is started after an Envio, and confirmada when an Aceite is recorded, so that the Etapa follows the work.
5. As a salesperson, I want perdida, descartada and cancelada to be actions on the Viagem with their reason, so that endings are deliberate and explained.
6. As a salesperson, I want the follow-ups to continue every 3 days after the third one goes unanswered, with the Viagem marked "sem resposta" on the Pipeline and an alert to me and the Admin, and never an automatic perdida, so that we fight for every Viagem until a person decides it is lost.
7. As a Responsável or Admin, I want a Correção de etapa when a fact was recorded by mistake, with who, when and why, so that errors are fixed without hiding them.
8. As Carlos, I want the ended Etapas (concluída, perdida, cancelada, descartada) collapsed or filtered out of the kanban, so that the board shows live work.
9. As a Pipeline reader, I want each Viagem card to show its Código da viagem, Cliente, dates, pax, Responsável and Próxima ação (red when overdue), with the price only if my Papel allows it, so that the card is useful and safe.
10. As a Guiamento Usuário, I want no Pipeline, so that commercial work stays out of my view.
11. As a Responsável, I want a push when my Viagem changes Etapa by itself, so that I know it moved.

### Tarefas da etapa

12. As an Admin, I want to edit each Etapa's template (titles, relative Prazo, who it goes to, what fact concludes it), so that the checklist of each stage follows how we work (ADR-0001).
13. As a salesperson, I want entering an Etapa to create its Tarefas da etapa on the Responsável's personal Quadro, so that what the stage needs appears by itself.
14. As a salesperson, I want the "responder" and follow-up Tarefas to be Tarefas da etapa of lead and proposta enviada, so that one mechanism covers them.
15. As a salesperson, I want a Tarefa da etapa concluded automatically when its fact is recorded (an Envio, an Aceite, a Cotação de fornecedor, a Pagamento), so that I never tick what the system already knows.
16. As a salesperson, I want concluding a Tarefa da etapa by hand to open the action that records its fact (send the Proposta, record the Aceite, write the contact note with Meio de contato, what and why), so that no box is ticked without the fact behind it.
17. As a salesperson, I want no way to create a Tarefa da etapa by hand, so that the stage's checklist stays the template's.
18. As a salesperson, I want Tarefas da etapa left open when the Etapa moves on to be concluded if their fact exists, or cancelada with "Etapa passou para …" otherwise, so that old stages leave no noise.
19. As a salesperson, I want nothing to block a fact (a Proposta can be sent with another Tarefa still open), so that the system never stops the work.
20. As a salesperson, I want the Tarefas da etapa of a Viagem that ends to become cancelada with the reason, and my personal Tarefas about it left alone, so that closed trips don't leave work behind.
21. As a new Responsável of a Viagem, I want its open Tarefas da etapa that went "to the Responsável" to move to my personal Quadro, with the previous Responsável in copy, so that a handoff hands over the work.
22. As a salesperson, I want the Viagem page to list its Tarefas grouped by Etapa, wherever each sits, so that one trip's work is in one place.

### Quadros and lists

23. As a Usuário, I want a personal Quadro created for me with Novo, Em foco, Aguardando and Concluído, which I can rename and reorder but not delete or give away, so that handed-over Tarefas always have somewhere to land.
24. As a Usuário, I want to create more Quadros, and create, rename, reorder and archive their lists, so that I organise work my way.
25. As a Usuário, I want to add a personal Tarefa straight on a list ("dentista às 17h"), so that the Quadro is my task manager.
26. As a Usuário, I want to move Tarefas between lists and Quadros by dragging and with the keyboard, so that I work fast on a computer and accessibly.
27. As a Usuário, I want one list per Quadro marked as its lista de conclusão, so that moving a card there concludes it and concluding it anywhere moves it there.
28. As a Usuário, I want reopening a Tarefa to send it back to the list it came from, or the first list, so that reopening puts it back in play.
29. As a Usuário, I want a Quadro without a lista de conclusão to show concluída Tarefas struck through, with an option to hide them, so that any Quadro handles done work.
30. As a Usuário, I want to see a Quadro's Tarefas by Prazo on a calendar, so that I see what is due when.
31. As a Usuário, I want to search and filter a Quadro by label, Responsável, Prazo and Viagem, so that big Quadros stay usable.

### Sending and sharing

32. As a Usuário, I want to send a Tarefa to another Usuário, making them the Responsável and landing it on the first list of their personal Quadro with me in copy, so that delegation is one gesture.
33. As a Usuário, I want to share a Quadro with members who all have the same rights, so that a team can run a board together.
34. As the creator of a Quadro, I want to remove members and archive it (never delete), so that its history survives.
35. As a member of a shared Quadro, I want a Tarefa there to have any member as Responsável without moving, so that shared boards work like Trello.
36. As a Guiamento member of a shared Quadro, I want to see only the cards I own or am copied on, so that commercial work never shows.
37. As a Usuário, I want my personal Quadro visible only to me (and to the Admin, as the Comunicador discloses at install), so that personal notes stay personal.

### Inside a Tarefa

38. As a Usuário, I want Itens de checklist in a Tarefa, and to promote one to its own Tarefa linked back, so that a step that needs an owner or a date becomes real work.
39. As a Usuário, I want labels (per Quadro), a cover and attachments on a Tarefa, so that cards are recognisable and carry their files.
40. As a Usuário, I want attachments downloadable only by those who can see the Tarefa, so that files follow the card's rights.
41. As a Usuário, I want to comment on a Tarefa in its Conversa da tarefa, with the Comunicador's trigger keys, mentions, cards, photos and voice notes, so that talk about a Tarefa stays with it.
42. As a Usuário, I want the Tarefa's activity (moved, handed over, checklist ticked, concluded, cancelada) shown as system lines in the same conversation, so that its history is one thread.
43. As a Usuário, I want to archive a Tarefa off its list without concluding it, so that a Quadro stays clean.
44. As a card reader, I want a Tarefa to show only what my Papel allows, as in the Comunicador, so that prices never leak through a board.

### Notifications

45. As a Usuário, I want a push when a Tarefa is handed to me, when I am put in copy, when I am mentioned in a Conversa da tarefa, and when a Prazo of mine passes, so that I miss nothing that is mine.
46. As a Usuário, I want other Mensagens in a Conversa da tarefa to raise only the unread count, and list moves or checklist ticks to raise nothing, so that boards don't spam me.

## Implementation Decisions

- **Build order is by vertical slice,** matching the parts in Testing Decisions, after the Comunicador's Tarefas part. The whole v1 is built at once; sequencing follows dependencies only. Tarefas da etapa of confirmada and later that need modules not built yet (Invoice, Pagamento, Voucher, Receptivo) switch on when those modules exist.
- **Modules:**
  - **Inferência de etapa** (new, deep module, pure): its input is a Viagem's recorded facts with their times, its Correções de etapa, its declared ending if any, the Etapa templates and the time now. Its output is the Etapa, the Tarefas da etapa to create, the ones to conclude (with the fact that concluded each) and the ones to cancel (with the reason), and whether the Viagem is "sem resposta". It has no I/O and never reads a clock. The Viagens module calls it after every fact is recorded, and a scheduled job calls it for time-based outcomes (the next follow-up, the "sem resposta" mark).
  - **Viagens** (existing): records the facts (Orçamento created, Proposta Envio, Versão started after an Envio, contact notes with Meio de contato, the Cliente's reply, Aceite, declared endings, Correções) and stores the inferred Etapa with its history. It no longer has an operation that sets the Etapa. It owns the Pipeline read (list and kanban).
  - **Modelos de etapa** (new): the editable templates, one per Etapa. Each entry has a title, a Prazo relative to entering the Etapa, who it goes to (the Responsável, or a named Usuário) and the fact kind that concludes it (Envio of a document kind, Aceite, Cotação de fornecedor, Pagamento, contact note, reply of the Cliente). Edits apply to Etapas entered afterwards, never to Tarefas already created.
  - **Tarefas** (from the Comunicador): gains the *cancelada* state with who and why, the Tarefa da etapa marker (template entry, Viagem, concluding fact kind, concluding fact), the handoff operation and the Itens de checklist. It refuses to create a Tarefa da etapa from any caller but the Inferência's results, and refuses a plain tick on one.
  - **Quadros** (new): Quadro, list (with position and the lista de conclusão mark), the Tarefa's single position, membership, labels, cover, attachments, archiving. It asks Tarefas to conclude or reopen when a card crosses the lista de conclusão, and reacts to Tarefas' conclusion, reopening and handoff by moving the card.
  - **Comunicador** (existing): gains the Conversa da tarefa as a conversation kind. Its members are the Tarefa's Responsável and people in copy, recomputed on handoff and copy changes. Activity lines are system Mensagens.
  - **Cartões**: Tarefas and Viagens already implement it. The Pipeline card and the Tarefa card on a Quadro are rendered through it, per reader.
- **Default Etapa templates** (editable, ADR-0001):

  | Etapa | Entered when… | Default Tarefas da etapa, and what concludes each one |
  |---|---|---|
  | lead | the Viagem is created | *responder* (same business day): a contact note with the Cliente |
  | em orçamento | the first Orçamento is created | *pedir cotações*: a Cotação de fornecedor; *enviar proposta*: an Envio of a Proposta |
  | proposta enviada | a Proposta Envio is recorded | *follow-up* 1, 2 and 3 (every 3 days): a contact note with the Cliente; any recorded reply of the Cliente concludes the open ones |
  | em negociação | a reply asking for changes is recorded, or a new Versão is started after an Envio | *enviar nova versão*: an Envio of a Proposta (which returns the Viagem to proposta enviada) |
  | confirmada | an Aceite is recorded | *enviar invoice*: an Invoice Envio; *receber sinal*: a Pagamento; *enviar voucher*: a Voucher Envio |
  | em viagem / concluída | the arrival Receptivo happens / the last send-off or the last Dia ends | Operação spec |

- **The Cliente's reply** is recorded on the Viagem as one of: aceitou (records the Aceite), pediu mudanças (em negociação), recusou (perdida, with a Motivo de perda), or still thinking (nothing moves). This is the path for the facts that happen outside the system.
- **Endings:** descartada (from any open Etapa) and cancelada (from confirmada) are declared by a person with a reason. Perdida is declared only by a person, with a Motivo de perda; the system never sets it. Instead, the follow-ups never stop: after the third one goes unanswered, the system creates a new follow-up every 3 days, marks the Viagem "sem resposta" on the Pipeline and alerts the Responsável and the Admin (a push, once). Any recorded reply of the Cliente removes the mark.
- **Correção de etapa:** only the Responsável or an Admin. It undoes the mistaken fact (e.g. an Aceite recorded on the wrong Viagem), and the Inferência recomputes the Etapa. Who, when, which fact and why are kept, and the Tarefas da etapa are recomputed the same way. It is the only way the Etapa moves back.
- **Etapa history** keeps every change with the fact (or Correção) that caused it.
- **Tarefa position:** one Quadro, one list, an ordering key per list (fractional, so a move writes one row). A handoff moves the card to the first list of the new Responsável's personal Quadro, unless the Tarefa sits on a shared Quadro the new Responsável is a member of, where it stays.
- **Personal Quadro:** created with the Usuário. It cannot be deleted, archived, shared or given away. Its lists can be renamed and reordered; Concluído is its lista de conclusão.
- **Rights:**
  - Any Usuário, Guiamento included, has a personal Quadro and creates and shares Quadros.
  - Members of a shared Quadro have equal rights over lists and cards. The creator (and the Admin) removes members and archives the Quadro.
  - Guiamento sees on any Quadro only the Tarefas it owns or is copied on; the others are hidden, not shown as restricted. Guiamento has no Pipeline.
  - A personal Quadro is visible only to its owner and to the Admin.
  - Every read checks rights on the server, including the real-time stream and attachment downloads.
- **Real-time:** Quadros and the Pipeline use the Comunicador's Server-Sent Events stream. Moves appear at once for the mover and stream to other members.
- **Notifications** go through the Decisão de notificação, with DND and "reading now": push on handoff, on being put in copy, on a mention in a Conversa da tarefa, on a passed Prazo and, for the Responsável, on an Etapa change the system made. Other Mensagens in a Conversa da tarefa raise only the unread count. List moves and checklist ticks raise nothing.
- **Names:** Pipeline, Quadro, lista, lista de conclusão, Tarefa, Tarefa da etapa, Item de checklist, Correção de etapa, Conversa da tarefa (see `CONTEXT.md`). Never "Trelelê", "board" or "card" in the interface.
- **Interface language:** every string in Portuguese and Korean (ADR-0006).

## Testing Decisions

Tests are **vertical first, then one transversal test**, as in the other specs. Files are named `quadros-parteN-*.spec.ts`.

- **What makes a good test:** it drives the app from the outside the way a Usuário would, through every layer down to the real test database, and checks what the Usuário sees: the card on the right list, the Etapa on the Pipeline, the push that was recorded, what a Papel can't see. It never checks internal steps and never mocks our own modules. Several browser contexts, one per Usuário, check real-time and rights. The clock is controlled with the `x-test-now` cookie.
- **Vertical tests, one set per part:**
  1. **Quadros and lists:**
     - The personal Quadro exists with its four lists and can't be deleted.
     - Add a personal Tarefa on a list; create, rename, reorder and archive lists; create a second Quadro.
     - Move a card by dragging and by keyboard, within a list, across lists and across Quadros.
     - Moving to Concluído concludes; concluding from Minhas Tarefas moves the card there; reopening returns it to its previous list.
     - A Quadro without a lista de conclusão shows concluída cards struck through and hides them on request.
     - Calendar by Prazo; search and filters.
  2. **Sending and sharing:**
     - Sending a Tarefa makes the other Usuário the Responsável, lands it on their Novo with the sender in copy, and records a push.
     - A shared Quadro: another member sees a move without reload; the creator removes a member; archiving keeps it readable.
     - A Guiamento member sees only its own cards on a shared Quadro.
     - Another Usuário can't open someone's personal Quadro; the Admin can.
  3. **Inside a Tarefa:**
     - Itens de checklist, and promoting one to a Tarefa linked back.
     - Labels, cover, attachments; a download refused to someone who can't see the Tarefa.
     - Commenting with a mention and a `V26-…` card in the Conversa da tarefa; activity lines for a move, a handoff and a conclusion.
     - A Tarefa card with a Viagem shows the price to Propostas e Orçamentos and not to Conteúdo.
  4. **Inferência de etapa and Tarefas da etapa:**
     - A new Viagem is lead with *responder* on the Responsável's Quadro; a contact note concludes it.
     - Creating an Orçamento moves it to em orçamento and creates that template.
     - Sending the Proposta moves it to proposta enviada, concludes *enviar proposta* and cancels an unmet leftover with its reason; nothing blocked the send.
     - Ticking *enviar proposta* by hand opens the send instead.
     - A reply "pediu mudanças", and separately a new Versão started, give em negociação; the new Envio gives proposta enviada again.
     - An Aceite gives confirmada.
     - Three follow-ups with no reply, then 3 days: the Viagem stays proposta enviada, marked "sem resposta", a fourth follow-up appears, and the Responsável and the Admin get a push. A recorded reply removes the mark. The system never sets perdida.
     - Descartada and a declared perdida with Motivo; their Tarefas da etapa become cancelada and a personal Tarefa about the Viagem stays open.
     - A Correção de etapa undoes a wrong Aceite with a reason; refused to a Usuário who is neither Responsável nor Admin.
     - A Responsável handoff moves the open Tarefas da etapa to the new Responsável's Quadro.
     - An Admin edits a template; only Etapas entered afterwards use it.
     - There is no way to create a Tarefa da etapa by hand, in the screen or through a request.
  5. **Pipeline:**
     - The kanban and the list show the same Viagens and filters; ended Etapas are collapsed.
     - A Viagem can't be dragged; clicking opens it.
     - Conteúdo sees no prices on the cards; Guiamento has no Pipeline.
     - An Etapa change made by another Usuário's action appears without reload.
     - The Viagem spec's part 1 pipeline tests still pass.
- **The Inferência de etapa** has fast table-driven Vitest tests at its own interface: facts in different orders × Correções × endings × templates × time, including facts arriving out of order and facts recorded twice. These add to the vertical tests.
- **Speed budgets** (ADR-0003) in `quadros-velocidade.spec.ts`, with realistic volume (tens of Usuários, hundreds of Quadros, tens of thousands of Tarefas, hundreds of open Viagens): opening a Quadro and opening the Pipeline within 300 ms; a card move visible to its mover within 100 ms and to another member within 300 ms.
- **One transversal test, written last:**
  1. A lead arrives, and *responder* appears on Ana's Quadro.
  2. Ana records the reply on WhatsApp; the Tarefa is concluded.
  3. Ana builds an Orçamento (em orçamento) and sends the Proposta (proposta enviada); Carlos watches the Viagem move on his Pipeline without reload.
  4. The Cliente asks for changes (em negociação); Ana sends a new Versão (proposta enviada).
  5. The Viagem is handed to Bruno; the follow-ups move to his Quadro.
  6. Bruno records an Aceite on the wrong Viagem, then corrects it with a Correção de etapa, and records it on the right one (confirmada).
  7. Meanwhile Ana's personal "dentista" Tarefa, and a Tarefa she sent to Bruno from a Mensagem, are untouched by any of it.

  It checks what each Usuário sees at each step.
- **Prior art:** the Comunicador's multi-context Playwright tests and the Viagem spec's part 1 helpers (reset, clock, sign-in, bulk SQL seeding).

## Out of Scope

- A Quadro per Viagem. The Pipeline is the Viagem board, and the Viagem page lists its Tarefas.
- Creating a Viagem from the Pipeline, and moving one by hand.
- Automation rules beyond the Etapa templates (Trello's Butler), card templates, recurring Tarefas, votes, stickers, power-ups, e-mail-to-board.
- Em viagem and concluída facts, which belong to the Operação spec.
- Tarefas da etapa that need Invoice, Pagamento or Voucher until those modules exist.

## Further Notes

- **Sources:**
  - Glossary: `CONTEXT.md` (Etapa, Pipeline, Tarefa, Tarefa da etapa, Quadro, Item de checklist, Correção de etapa, Conversa da tarefa, Próxima ação).
  - Decisions: ADR-0001 (templates are editable defaults), ADR-0003 (stack and speed budgets), ADR-0006 (PT and KO), ADR-0007 (the Etapa is inferred from facts).
  - Acervo: K460 (Trello abandoned, Trelelê prototype), K876 (Carlos validated the Trelelê direction and delegation on 13/09/2026) in `../docs/negocio/`.
- **Choices made for the user during the grilling, at their request. Revisit if they are wrong:**
  - Facts move the Etapa; a Tarefa da etapa only prompts for its fact and is concluded by it.
  - After the third unanswered follow-up: a follow-up every 3 days with no limit, the "sem resposta" mark and one alert to the Responsável and the Admin. (Settled by the user: no automatic perdida.)
  - The Tarefa state *cancelada*, for work nobody needs any more.
  - Correção de etapa limited to the Responsável and the Admin.
  - Guiamento has no Pipeline, and sees only its own cards on shared Quadros.
  - A personal Quadro visible to the Admin, consistent with the Comunicador. (Confirmed by the user.)
  - The Trello features in v1 (calendar by Prazo included; recurring Tarefas and automation left out).
- **Changes to other specs** made with this one: the Viagem spec's Etapa rules (no hand moves, em negociação inferred, perdida only by a person, Correção de etapa) and the Comunicador spec's Tarefa (the *cancelada* state, the Conversa da tarefa).
