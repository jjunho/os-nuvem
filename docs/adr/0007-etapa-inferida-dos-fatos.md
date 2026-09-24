# The Etapa is inferred from facts, never moved by hand

A Viagem's Etapa is calculated from what has been recorded on it: an Orçamento exists, a Proposta was sent (Envio), a new Versão was started after it, an Aceite was recorded, the arrival Receptivo happened. Nobody drags a Viagem on the Pipeline or picks its Etapa from a menu. Carlos wants the system to work out the state by itself, and a hand-set stage drifts from the truth the way the old "Andamento" column did. The Etapa only moves forward, stays where it is, or ends in success or failure.

## Considered Options

- Moving the Etapa by hand (kanban drag) with automatic moves on top: rejected, because two sources of truth disagree and the Pipeline stops being trustworthy.
- Moving to the next Etapa when the last open Tarefa of the current one is concluded: kept only in the weaker form below, because "the next Etapa" is ambiguous at forks (proposta enviada → em negociação, confirmada or perdida), and ticking a box would move a Viagem without the fact behind it.

## Consequences

- Each Etapa has a template of Tarefas da etapa. Each one is concluded by the fact it asks for (an Envio, an Aceite, a Cotação de fornecedor, a Pagamento), not by a tick. When the fact happens outside the system (the Cliente answered on WhatsApp), the person concludes it by recording the fact, with a note on what and why.
- Descartada and cancelada are declared by a person, with a reason. Perdida is declared only by a person, with a Motivo de perda. The system never gives up on a Viagem, and its follow-ups never stop. After the third one goes unanswered, the system creates a new follow-up every 3 days, marks the Viagem "sem resposta" on the Pipeline and alerts the Responsável and the Admin.
- There is no backward move. A wrong Etapa, caused by a fact recorded by mistake, is fixed by a Correção de etapa: the wrong fact is undone or the Etapa is restored, with who, when and why. The Responsável or an Admin can do it.
- This replaces the Viagem spec's rule that proposta enviada → em orçamento is an allowed hand move.
