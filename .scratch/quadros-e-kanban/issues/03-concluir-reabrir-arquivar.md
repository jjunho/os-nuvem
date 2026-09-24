# 03: Concluir, reabrir e arquivar Tarefas

**What to build:** Concluir e reabrir uma Tarefa mantém seu estado e sua posição coerentes em todos os pontos de entrada. Arquivar retira a Tarefa da lista sem concluí-la.

**Blocked by:** 02 (Organizar Quadros e listas).

**Status:** ready-for-agent

- [ ] Permitir no máximo uma lista de conclusão por Quadro; Concluído é a inicial no Quadro pessoal.
- [ ] Mover uma Tarefa pessoal à lista de conclusão a conclui; concluir por Minhas Tarefas ou pelo cartão no chat a move para essa lista.
- [ ] Reabrir devolve a Tarefa à lista de origem ou à primeira lista disponível quando a origem não puder ser usada.
- [ ] Em Quadro sem lista de conclusão, Tarefas concluídas aparecem riscadas e podem ser ocultadas.
- [ ] Arquivar uma Tarefa não muda seu estado para concluída nem apaga seu histórico.
- [ ] Registrar autor e momento das mudanças de estado, preservando os dados de conclusão exigidos por Tarefas.
- [ ] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [ ] Cobrir este recorte com testes verticais da parte 1 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.

