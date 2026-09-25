# 23: Transversal test of the Comunicador

**What to build:** The end-of-spec transversal test that runs one realistic day through every part in order, checking what each Usuário sees at each step, not only the end. Spec: `.scratch/comunicador/spec.md` (Testing Decisions).

The steps:
1. A lead arrives, and its "responder" Tarefa appears.
2. The salesperson talks about it in the Interna with a `V26-…` card.
3. Carlos, as the Admin, is mentioned and replies from a push.
4. The Viagem is confirmed and allocated, and the Equipe conversation appears with the Guia.
5. The Guia, as Guiamento, sends a photo and a voice note from the field while offline, and both go out when back online.
6. The Responsável sends an urgent Mensagem through the Guia's DND.
7. A Mensagem becomes a Tarefa that is marked concluída.
8. The Viagem ends, and the Equipe conversation is archived.

**Blocked by:** 01–21 (every ticket above except 22, which the day doesn't use).

**Status:** ready-for-agent

- [ ] One transversal e2e test runs the steps above against the production build and test database, and passes.
- [ ] All vertical and speed tests of this spec, the Viagem part 1 tests and the login tests still pass.

## Comments

2026-09-25: permanece pendente. Operação 08/22 ainda não fornece o vínculo Usuário–Profissional nem os comandos de chegada/despedida necessários para Equipe, autorização do Responsável e arquivamento automático. Não foi criado um atalho de mudança manual de Etapa.
