# 28: Transversal test, confirmação to send-off

**What to build:** The end-of-spec transversal test. It continues the first spec's B2B case (an Agência, 10 pagantes + 2 gratuidades) through every step, checking what each Papel sees: confirmação; Dados de viagem; Reservas including KTX and a Jeju flight (with the Guia's flight); Equipe and vehicles allocated, with a double-booking warning resolved; Voucher v1; Invoice for the Sinal in the Agência's name, and the Sinal recorded with a Recibo; an Alteração adds a Dia (new Versão, Voucher v2, price difference); a non-refundable item blocked until the Saldo is paid; Invoice for the Saldo and the Saldo recorded; Aviso do dia; arrival Receptivo (em viagem); an Ocorrência and Despesas de campo; send-off (concluída); goodbye message and no open items. A second, B2C Viagem follows the real Ygara case (USD 1,400, 30% Sinal, Saldo in two BRL Pagamentos, Invoice redone per Dia) and is cancelled after the Sinal, with the refund checked. Spec: `.scratch/operacao-e-pagamentos/spec.md` (Testing Decisions).

**Blocked by:** 01–27 (every ticket above).

**Status:** ready-for-agent

- [ ] Both cases run as transversal e2e tests and pass, checking the state at each step.
- [ ] All vertical and speed tests of this spec and the earlier specs still pass.
