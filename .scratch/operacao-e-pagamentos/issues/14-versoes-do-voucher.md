# 14: Voucher versions and attachments

**What to build:** Any change to the plan lets the operator issue a new Voucher version, with earlier ones kept. Each sent version is an Envio (to whom, when, which channel), since the Voucher's dates are the authoritative schedule. Tickets and booking confirmations attach to the Voucher, including phone photos of train tickets, which can't be printed (K846). The Voucher Envio is a fact the Quadros spec's Tarefa "enviar voucher" reads. Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 24, 25, 58).

**Blocked by:** 13 (Voucher v1).

**Status:** ready-for-agent

- [ ] Changing a Dia's time and reissuing gives version 2; version 1 still renders the same.
- [ ] Each sent version appears as an Envio on the Viagem.
- [ ] Image attachments are accepted and bundled with the Voucher.
