# 09: Conversa da tarefa

**What to build:** Cada Tarefa tem uma Conversa da tarefa no Comunicador, formada pelo Responsável e pelas pessoas em cópia. Ali ficam comentários, menções, cartões, fotos e mensagens de voz.

**Blocked by:** 05 (Enviar uma Tarefa a outro Usuário); Comunicador 10 (Grupo settings, DND and /urgente); Comunicador 11 (Cartões and Viagem cards); Comunicador 15 (Photos); Comunicador 16 (Voice notes and transcription).

**Status:** done

- [x] Abrir a mesma conversa a partir da Tarefa ou do Comunicador, sem criar conversas duplicadas.
- [x] Reutilizar teclas de acionamento, menções, cartões de Viagem e Tarefa, fotos e voz.
- [x] Recalcular participantes quando mudar o Responsável ou as pessoas em cópia, preservando a supervisão autorizada do Admin.
- [x] Ser membro de um Quadro não concede automaticamente participação na Conversa de todas as Tarefas.
- [x] Uma menção gera a decisão de push; outras Mensagens aumentam apenas o contador de não lidas, respeitando DND e leitura atual.
- [x] Conferir autorização em leituras, publicações, SSE e downloads.
- [x] Um cartão de Viagem mostra valores somente aos Papéis autorizados; Conteúdo não recebe preços.
- [x] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [x] Cobrir este recorte com testes verticais da parte 3 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


## Implementação

Concluído com a spec Pipeline e Quadros. Evidências e instruções em
[`docs/execucao-quadros.md`](../../../docs/execucao-quadros.md).
