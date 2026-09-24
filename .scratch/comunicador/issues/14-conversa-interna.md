# 14: The Interna conversation

**What to build:** Each Viagem has an Interna conversation for staff, opened from the Viagem screen and created on its first Mensagem, so Viagens without talk don't clutter the list. It is named by the Código da viagem and the Cliente. Every Papel but Guiamento can open it. Guiamento never sees it. Spec: `.scratch/comunicador/spec.md` (stories 75–77, 81; Conversas da viagem).

**Blocked by:** 11 (Cartões and Viagem cards).

**Status:** ready-for-agent

- [ ] "Conversa interna" on the Viagem screen opens it. It appears in the list only after the first Mensagem.
- [ ] It is named "V26-… · Cliente".
- [ ] Every staff Papel can open it. Guiamento never sees it in the list, search or by URL.
- [ ] `/tarefa` in it prefills the Viagem.
- [ ] Vertical tests in `comunicador-parte5-*.spec.ts`.
