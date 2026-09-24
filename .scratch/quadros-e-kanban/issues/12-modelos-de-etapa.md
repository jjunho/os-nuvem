# 12: Modelos de etapa editáveis

**What to build:** O Admin edita os Modelos de etapa que geram Tarefas, sem mudar retroativamente trabalho já criado.

**Blocked by:** 11 (Tarefa da etapa no primeiro contato).

**Status:** ready-for-agent

- [ ] Editar título, Prazo relativo à entrada, destinatário e tipo de fato conclusivo de cada item.
- [ ] Permitir destinatário “Responsável da Viagem” ou um Usuário nomeado, guardando essa diferença para futuras transferências.
- [ ] Disponibilizar os modelos comerciais iniciais previstos na spec; os modelos de módulos futuros ficam inativos até sua integração.
- [ ] Somente Etapas iniciadas após a alteração usam o novo modelo; Tarefas existentes conservam seus dados.
- [ ] Uma Tarefa registra o item do modelo e a entrada na Etapa que a originaram.
- [ ] Recusar alterações de modelo por Usuário que não seja Admin.
- [ ] Escolher Usuários e tipos conhecidos sem redigitação; os padrões continuam editáveis conforme ADR-0001.
- [ ] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [ ] Cobrir este recorte com testes verticais da parte 4 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.

