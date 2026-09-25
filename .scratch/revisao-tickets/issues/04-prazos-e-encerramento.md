# 04: Prazos e encerramento da Viagem

**What to build:** Os requisitos de Etapa e suas Tarefas preservam os prazos comerciais existentes e só concluem a Viagem na última despedida aplicável. Alinhar Quadros 11 e 12, Operação 11 e 22 e os trechos correspondentes das specs, cobrindo os achados 2 e 10 da revisão. Este recorte documental independe da atualização do status de Viagem 07.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Os modelos iniciais de `responder` resolvem o Prazo por Canal comercial, em vez de estabelecer um prazo único de mesmo dia útil para todos.
- [ ] Preservar os exemplos já verificados no primeiro contato: B2C em 2h e Agência em 8h; não inventar calendário útil nem modificar os demais canais por inferência.
- [ ] Os critérios de Quadros exigem conservar esses comportamentos na transição de Próxima ação para Tarefa da etapa.
- [ ] Operação 22 exige a última despedida aplicável dos Viajantes para concluir a Viagem e arquivar a conversa da Equipe.
- [ ] Um cenário documentado com dois Receptivos de saída mantém a Viagem ativa e a conversa aberta após o primeiro, concluindo e arquivando somente após o último.
- [ ] Preservar o encerramento ao fim do último Dia quando não há Receptivo de saída e o uso do relógio controlado já previsto.
- [ ] Tickets, specs e definição de Etapa ficam coerentes; corrigir somente documentação, sem alterar os testes funcionais atuais ou a spec-mãe da reconciliação.
