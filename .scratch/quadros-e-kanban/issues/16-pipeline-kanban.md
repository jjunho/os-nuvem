# 16: Pipeline em kanban

**What to build:** O Pipeline alterna entre lista e kanban por Etapa, com informações e filtros equivalentes. As mudanças inferidas aparecem ao vivo e avisam o Responsável.

**Blocked by:** 11 (Tarefa da etapa no primeiro contato); Comunicador 10 (Grupo settings, DND and /urgente); Comunicador 11 (Cartões and Viagem cards).

**Status:** ready-for-agent

- [ ] Mostrar Código da viagem, Cliente, datas, pax, Responsável e Próxima ação; Prazo vencido aparece em vermelho.
- [ ] Lista e kanban oferecem os mesmos filtros por Responsável, Canal comercial e Próxima ação atrasada.
- [ ] Recolher ou filtrar as Etapas encerradas; abrir a Viagem ao clicar, sem permitir arraste, seleção manual de Etapa ou criação de Viagem pelo kanban.
- [ ] Reutilizar Cartões e conferir direitos no servidor: Conteúdo não recebe preços e Guiamento não acessa o Pipeline nem seus eventos.
- [ ] Uma mudança causada por outro Usuário aparece sem recarregar pelo SSE do Comunicador.
- [ ] Mudança automática de Etapa gera push para o Responsável pela Decisão de notificação, respeitando DND e leitura atual.
- [ ] Exibir a marca “sem resposta” quando fornecida pelo estado da Viagem, sem implementar outra regra de follow-up.
- [ ] Manter os testes existentes do Pipeline e da Próxima ação; integrar valores reais aos cartões quando Orçamentos estiver disponível.
- [ ] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [ ] Cobrir este recorte com testes verticais da parte 5 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.

