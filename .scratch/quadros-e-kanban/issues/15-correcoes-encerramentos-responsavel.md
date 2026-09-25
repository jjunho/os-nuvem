# 15: Correções, encerramentos e troca de Responsável

**What to build:** Correções de fatos, encerramentos da Viagem e trocas de Responsável mantêm suas Tarefas da etapa coerentes, preservando histórico e Tarefas pessoais.

**Blocked by:** 05 (Enviar uma Tarefa a outro Usuário); 13 (Tarefas do Orçamento ao Aceite).

**Status:** done

- [x] Uma Correção de etapa pelo Responsável ou Admin desfaz o fato equivocado, guarda quem, quando, qual fato e por quê e recalcula Etapa e Tarefas.
- [x] Recusar Correção a terceiros; não oferecer alteração direta da Etapa.
- [x] Declarar perdida com Motivo de perda, descartada a partir de Etapa aberta e cancelada a partir de confirmada, segundo as regras da Viagem.
- [x] Encerrar a Viagem cancela suas Tarefas da etapa abertas com o motivo, mas não altera Tarefas pessoais vinculadas.
- [x] Trocar o Responsável transfere as Tarefas da etapa abertas destinadas ao Responsável para o Quadro pessoal do novo, com o anterior em cópia.
- [x] Não transferir Tarefas destinadas a Usuário nomeado pelo modelo nem Tarefas pessoais; essa transferência automática segue a regra específica da Viagem.
- [x] Recalcular após Correção não apaga histórico nem duplica Tarefas; comprovar o cenário de Aceite na Viagem errada.
- [x] Testar Correções e encerramentos combinados com fatos fora de ordem na interface pura da Inferência.
- [x] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [x] Cobrir este recorte com testes verticais da parte 4 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


## Implementação

Concluído com a spec Pipeline e Quadros. Evidências e instruções em
[`docs/execucao-quadros.md`](../../../docs/execucao-quadros.md).
