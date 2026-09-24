# 02: Money by Papel on Orçamentos, Propostas and Tarifários

**What to build:** Only Propostas e Orçamentos and above build Orçamentos, set the Margem and the Preço enviado, and send Propostas. Itinerários e Produtos sees single line prices but no totals, Margem or Preço enviado. Guiamento and Conteúdo see no price at all. Hotel rates are confidential under several supplier contracts (Park Hyatt ends the contract if its rate is exposed, K767; Homm Marina and Seaes forbid publishing it, K664, K649), so Tarifários and Cotações de fornecedor are seen and edited only from Propostas e Orçamentos up. A restricted hotel's rate never appears on its own on any document, including the price-per-service detail. Spec: stories 31–32; Revisions of 2026-09-24.

**Blocked by:** 01 (Access by Papel: tracer), Viagem 19 (Opções and Margem), Viagem 24 (Sending freezes a Versão).

**Status:** ready-for-agent

- [ ] Itinerários opens an Orçamento and sees line prices, with no total, Margem or Preço enviado on the screen or in any response.
- [ ] Itinerários can't create an Orçamento, set a Margem or send, through the screen or a request.
- [ ] Conteúdo and Guiamento see no value on a Viagem, Orçamento or Proposta.
- [ ] Only Propostas e Orçamentos and above open Tarifários and Cotações.
- [ ] The Proposta's price-per-service detail never shows a restricted hotel's rate on its own line.
