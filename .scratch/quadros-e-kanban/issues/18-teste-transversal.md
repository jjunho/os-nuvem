# 18: Validar o fluxo transversal

**What to build:** Validar, por último, o percurso completo de uma Viagem e suas Tarefas com vários Usuários, do primeiro contato ao Aceite e sua Correção, preservando o trabalho pessoal.

**Blocked by:** 17 (Verificar velocidade com volume realista).

**Status:** done

- [x] Criar lead: “responder” aparece no Quadro de Ana; registrar contato por WhatsApp conclui a Tarefa.
- [x] Ana cria Orçamento e envia Proposta; Carlos vê a Etapa mudar no Pipeline sem recarregar.
- [x] Registrar pedido de mudanças e enviar nova Versão: em negociação e depois proposta enviada.
- [x] Transferir a Viagem para Bruno: follow-ups abertos vão para seu Quadro e Ana permanece em cópia.
- [x] Bruno registra Aceite na Viagem errada, faz Correção justificada e registra o Aceite na correta.
- [x] A Tarefa pessoal “dentista” de Ana e uma Tarefa delegada a Bruno a partir de Mensagem permanecem intactas durante as mudanças da Viagem.
- [x] Verificar o que cada Usuário pode ver, incluindo ausência de preços para Conteúdo e restrições de Guiamento.
- [x] Exercitar a app real e PostgreSQL real com vários contextos e relógio controlado, sem simular módulos próprios.
- [x] Confirmar que formulários já trazem os dados conhecidos e que a regressão do primeiro contato continua passando.
- [x] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [x] Executar este teste após os testes verticais e de velocidade dos recortes.


## Implementação

Concluído com a spec Pipeline e Quadros. Evidências e instruções em
[`docs/execucao-quadros.md`](../../../docs/execucao-quadros.md).
