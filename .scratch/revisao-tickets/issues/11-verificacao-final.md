# 11: Verificação final da reconciliação

**What to build:** Juliano recebe uma conferência verificável de todas as correções documentais, com um mapa dos achados atendidos e dos pontos que continuam dependendo de decisão de produto. Encerrar a revisão do conjunto corrigido sem declarar resolvidas as escolhas excluídas da spec.

**Blocked by:** 01 (Decisões aprovadas e dependências), 02 (Permissões financeiras), 03 (Disponibilidade de Guias), 04 (Prazos e encerramento da Viagem), 05 (Proposta imutável e Roteiro detalhado), 06 (Preços de ingressos e kit), 07 (Reembolsos no Resultado), 08 (Sinal e cancelamento de fornecedor), 09 (Adicional provisório de espera), 10 (Inventário de fotos).

**Status:** ready-for-agent

- [ ] Conferir os 15 grupos de achados e a questão adicional de fechamento, mapeando cada um à correção entregue ou ao recorte explicitamente pendente.
- [ ] Verificar que ticket, spec de origem, critério de aceite e decisão de referência concordam após a aplicação das correções.
- [ ] Validar o grafo completo atualizado: destinos existentes, dependências suficientes para os critérios alterados e ausência de ciclos, incluindo a integração de conversas e Tarefas.
- [ ] Preservar a diferença entre um ticket pronto para agente, seus bloqueadores e uma funcionalidade já implementada.
- [ ] Registrar separadamente as perguntas ainda abertas: quando créditos concedidos afetam o Resultado; se aprovação de despesas é condição para reembolso ou registro informativo; se pode haver fechamento financeiro com Resultado não verificável.
- [ ] Não responder essas perguntas por inferência nem bloquear correções independentes; qualquer pendência deve identificar o recorte afetado e a decisão que falta.
- [ ] Conferir que nenhum novo vencimento de fornecedor, intervalo de cancelamento ou condição comercial universal foi inventado.
- [ ] Validar documentalmente os critérios futuros de Playwright e Vitest já previstos, sem criar infraestrutura permanente ou executar funcionalidades ainda inexistentes.
- [ ] Entregar um relatório curto com documentos corrigidos, evidência da conferência do grafo e decisões restantes; não modificar ou encerrar a spec-mãe da reconciliação.
