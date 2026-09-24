# 24: Sending freezes a Versão

**What to build:** Sending an Orçamento freezes a Versão de orçamento, so what the Cliente saw never changes. The Versão keeps its Memória de cálculo (pinned table version, exchange rate and date, Margem, every Ajuste manual with who and why) and gets a Número da proposta. The send records an Envio (which Versão, to whom, when, on which channel), and the Viagem becomes proposta enviada. Any change after sending starts a new Versão, keeping earlier ones and their Preços enviados, and the Viagem becomes em negociação. The Envio form comes prefilled with the Viagem's Solicitante and Meio de contato (ADR-0008). Sending is refused while a charged line is "a informar" or still an estimate. Carlos gets a push when a Proposta goes out with an estimated Margem under 10%. Spec: stories 54–57, 67, 93.

**Blocked by:** 15 (Ajuste manual, Padrão provisório and "a informar"), 19 (Opções and Margem), Comunicador 09 (Web push basics).

**Status:** done

- [x] Sending freezes Versão 1 with its Número da proposta. Editing afterwards starts Versão 2, and Versão 1 reads the same.
- [x] Fixture: a Proposta on table v1 keeps v1 after the table changes.
- [x] The Envio and new Versão are facts passed to the Inferência: proposta enviada, then em negociação.
- [x] Scenario (8): sending is refused until the exhibition's real cost is entered.
- [x] A send under 10% records a push to Carlos, with the reason given.
- [x] The Envio form opens with the recipient and channel already filled in from the Viagem.
- [x] Every Envio is listed on the Viagem.
- [x] Vertical tests in `parte5-*.spec.ts`.

## Entrega

Implementado e revisado. Verificação: parte5-envio.spec.ts; parte5-revisao.spec.ts.
