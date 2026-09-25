# 17: Verificar velocidade com volume realista

**What to build:** Medir e corrigir os percursos reais de Quadros e Pipeline para atender aos limites de velocidade do ADR-0003 com o volume previsto para o sistema.

**Blocked by:** 08 (Busca, filtros e calendário); 10 (Histórico da Tarefa na conversa); 14 (Follow-ups como Tarefas da etapa); 15 (Correções, encerramentos e troca de Responsável); 16 (Pipeline em kanban).

**Status:** done

- [x] Usar banco real com dezenas de Usuários, centenas de Quadros, dezenas de milhares de Tarefas e centenas de Viagens abertas.
- [x] Abrir Quadro e Pipeline em até 300 ms; leituras do servidor ficam dentro do orçamento de 100 ms do ADR-0003.
- [x] Movimento fica visível para quem move em até 100 ms e para outro membro em até 300 ms.
- [x] Medir os fluxos pelo navegador, com múltiplos Usuários, incluindo permissões e atualização em tempo real.
- [x] Corrigir gargalos encontrados e fazer a verificação falhar quando um orçamento for excedido.
- [x] Não relaxar autorização nem esconder falhas de persistência para cumprir os limites.
- [x] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [x] Manter a suíte de velocidade de Quadros separada e reproduzível.


## Implementação

Concluído com a spec Pipeline e Quadros. Evidências e instruções em
[`docs/execucao-quadros.md`](../../../docs/execucao-quadros.md).
