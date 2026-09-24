# 09: Web push basics

**What to build:** Usuários are reached like on KakaoTalk. A web push goes out for every Mensagem in a Conversa direta and for every mention: `@usuário`; `@todos` to every member; `@aqui` only to those with the conversation open or active in the last few minutes. A member currently viewing the conversation gets no push. Tapping a push opens the exact Mensagem. Spec: `.scratch/comunicador/spec.md` (stories 42–44, 91, 95, 96; Decisão de notificação; Notifications; Adapters at the edge).

The rest:
- **Decisão de notificação** lives in the same pure module as ticket 08. Its inputs are the segments, the conversation kind, the members and whether each is reading now. It takes the time as an input and never reads a clock. This ticket builds it with the inputs above. Ticket 10 adds Grupo settings, DND and urgent.
- **Envio de push** adapter: Web Push with VAPID keys. The recording fake is selected in the test build and read through a test-only route, like `/test/reset`.
- Push subscriptions are stored per device and removed when the push service rejects them.

**Blocked by:** 08 (Leitura de mensagem and trigger keys).

**Status:** ready-for-agent

- [ ] Table tests of the decision: conversation kind × mention kind × currently reading.
- [ ] A Mensagem in a Conversa direta records a push for the other person, with the Mensagem's link.
- [ ] `@lia` in a Grupo records a push for Lia only. `@todos` for every member but the author. `@aqui` only for those active.
- [ ] No push is recorded for a member with the conversation open.
- [ ] Opening the push's link lands on that Mensagem.
- [ ] A subscription the push service rejects is removed.
