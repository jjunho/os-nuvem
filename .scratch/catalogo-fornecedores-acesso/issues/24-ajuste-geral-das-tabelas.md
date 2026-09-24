# 24: General adjustment of the Tabelas

**What to build:** Carlos sets a general percentage on the Tabelas de referência, for when the exchange rate moves too much (e.g. +3%). Applying it creates a new version of every table it covers, so sent Versões keep their values. It is separate from the ×1.10 exchange factor (Juliano, 2026-09-24, superseding K532). Spec: story 50; `docs/padroes-provisorios.md` (Ajuste geral de tabela).

**Blocked by:** 01 (Access by Papel: tracer), Viagem 10 (Tabelas: fleet and the rest).

**Status:** ready-for-agent

- [ ] Applying +3% raises every covered rate by 3% in a new version, with who and why.
- [ ] A Versão sent before keeps its values.
- [ ] Only the Admin applies it.
