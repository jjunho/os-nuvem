# 25: Follow-ups and "sem resposta"

**What to build:** A follow-up Tarefa is created 3 days after a Proposta is sent. After the third goes unanswered, follow-ups continue every 3 days, the Viagem is marked "sem resposta" on the Pipeline, and the Responsável and the Admin get an alert (a push, once). Only a person declares perdida. Any recorded reply of the Cliente removes the mark. Spec: story 25; ADR-0007.

**Blocked by:** 24 (Sending freezes a Versão).

**Status:** done

- [x] With the test clock, follow-ups appear at 3, 6 and 9 days, then every 3 days.
- [x] After the third unanswered one, "sem resposta" shows on the Pipeline and a push is recorded for the Responsável and the Admin, once.
- [x] The system never sets perdida.
- [x] Recording a reply removes the mark and concludes the open follow-up.

## Entrega

Implementado e revisado. Verificação: parte5-followups.spec.ts.
