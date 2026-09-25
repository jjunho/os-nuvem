# 21: The Equipe conversation and `/urgente` for the Responsável

**What to build:** Each Viagem gets an Equipe conversation at its first Alocação. Its members are the Usuários linked to the Profissionais allocated to any of its Dias, plus the Responsável. Members are recomputed whenever an Alocação or the Responsável changes. It is named by the Código da viagem and the Cliente. When the Viagem ends, it is archived: read-only and out of the default list, but readable. The Responsável of a Viagem em viagem may send `/urgente` in that Viagem's conversations. Guiamento's Viagem cards show its own Viagens. Spec: `.scratch/comunicador/spec.md` (stories 56, 78–81; Conversas da viagem; Rights).

This hooks into the Alocação command and the em viagem and concluída Etapas from the Operação spec, which aren't built or ticketed yet.

**Blocked by:** 10 (Grupo settings, DND and `/urgente` (Admin)), 14 (The Interna conversation), Operação 08 (Fleet and Alocação tracer), Operação 22 (Arrival and send-off move the Etapa).

**Status:** ready-for-agent

- [ ] The first Alocação creates the Equipe conversation, with the allocated Guia's Guiamento Usuário and the Responsável.
- [ ] Adding or removing an Alocação, or handing off the Responsável, changes the members live.
- [ ] A Guiamento Usuário sees the Viagem card in its Equipe conversation, and "restricted" for other Viagens.
- [ ] `/urgente` is refused to a non-Responsável and allowed to the Responsável of a Viagem em viagem. It gets through DND.
- [ ] When the Viagem is concluída, the conversation is read-only, off the default list and still readable.

## Comments

2026-09-25: permanece pendente. Operação 08/22 ainda não fornece o vínculo Usuário–Profissional nem os comandos de chegada/despedida necessários para Equipe, autorização do Responsável e arquivamento automático. Não foi criado um atalho de mudança manual de Etapa.
