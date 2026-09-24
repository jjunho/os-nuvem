# 10: Grupo settings, DND and `/urgente` (Admin)

**What to build:** A Usuário sets, per Grupo, every Mensagem, mentions only or muted. They set DND hours in their own time zone. An urgent Mensagem gets through DND. `/urgente` at the start of a Mensagem marks it urgent after checking the right. Here, only the Admin has the right; the Responsável of a Viagem em viagem gains it in ticket 21. Anyone else is refused with the reason. Spec: `.scratch/comunicador/spec.md` (stories 56, 57, 92–94; Rights; Notifications).

**Blocked by:** 09 (Web push basics).

**Status:** ready-for-agent

- [ ] Decisão de notificação table tests gain: Grupo setting × DND across time zones and midnight × urgent.
- [ ] Every / mentions only / muted each change the pushes recorded for a Grupo Mensagem.
- [ ] With the test clock inside a Usuário's DND, no push is recorded. Unread counts still update.
- [ ] An Admin `/urgente` Mensagem records a push through DND and shows as urgent.
- [ ] A non-Admin `/urgente` is refused with the reason, in their language.
