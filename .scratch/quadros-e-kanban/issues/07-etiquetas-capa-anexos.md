# 07: Etiquetas, capa e anexos

**What to build:** O Usuário reconhece e documenta Tarefas por etiquetas do Quadro, capa e anexos, reutilizando a infraestrutura de arquivos do Comunicador com autorização baseada na Tarefa.

**Blocked by:** 04 (Compartilhar Quadros); Comunicador 15 (Photos).

**Status:** done

- [x] Criar e atribuir etiquetas pertencentes ao Quadro.
- [x] Escolher uma capa e anexar arquivos à Tarefa; os membros autorizados conseguem visualizá-los e baixá-los.
- [x] Cada download confere no servidor o direito atual de ver a Tarefa, inclusive por URL conhecida.
- [x] Guiamento não acessa arquivos de Tarefas ocultas; remoção de acesso ao Quadro também impede downloads quando não houver outra autorização.
- [x] Movimentos e delegações mantêm os arquivos ligados à mesma Tarefa e recalculam seu acesso.
- [x] Não mostrar etiquetas de outro Quadro como opções locais ao mover a Tarefa; preservar a integridade das referências.
- [x] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [x] Cobrir este recorte com testes verticais da parte 3 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


## Implementação

Concluído com a spec Pipeline e Quadros. Evidências e instruções em
[`docs/execucao-quadros.md`](../../../docs/execucao-quadros.md).
