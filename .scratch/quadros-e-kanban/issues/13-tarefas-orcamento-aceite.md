# 13: Tarefas do Orçamento ao Aceite

**What to build:** O trabalho comercial registrado faz avançar a Etapa e resolve suas Tarefas: criar Orçamento, registrar Cotação, enviar Proposta, negociar e registrar Aceite. A página da Viagem reúne suas Tarefas por Etapa, independentemente do Quadro onde estão.

**Blocked by:** 12 (Modelos de etapa editáveis); Viagem 11 (Orçamento tracer: Dia by Dia to Preço enviado); Viagem 24 (Sending freezes a Versão); Viagem 28 (Aceite and confirmada); Catálogo/Fornecedores/Acesso 21 (Cotação de fornecedor).

**Status:** done

- [x] Criar o primeiro Orçamento gera as Tarefas de em orçamento; registrar Cotação conclui “pedir cotações” e Envio conclui “enviar proposta”.
- [x] Registrar pedido de mudanças ou iniciar nova Versão depois de Envio leva a em negociação e gera “enviar nova versão”; novo Envio volta a proposta enviada, como ciclo previsto na spec.
- [x] Registrar Aceite leva a confirmada; não gerar Tarefas inexequíveis de Invoice, Pagamento ou Voucher enquanto seus módulos não existirem.
- [x] Na saída de uma Etapa, concluir Tarefas cujo fato exista e cancelar as restantes com “Etapa passou para …”.
- [x] Nenhuma Tarefa aberta impede registrar um fato; tentativas de conclusão abrem a ação correspondente já preenchida com dados conhecidos.
- [x] Reentrada em Etapa usa a versão de modelo aplicável e não reaproveita incorretamente fatos de um ciclo anterior.
- [x] Exibir Tarefas da Viagem agrupadas por Etapa, incluindo estado, fato conclusivo ou motivo de cancelamento, respeitando direitos.
- [x] Testar fatos repetidos, fora de ordem e o ciclo de negociação por testes puros e verticais; não recriar a inferência já entregue por Viagem 07.
- [x] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [x] Cobrir este recorte com testes verticais da parte 4 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


## Implementação

Concluído com a spec Pipeline e Quadros. Evidências e instruções em
[`docs/execucao-quadros.md`](../../../docs/execucao-quadros.md).
