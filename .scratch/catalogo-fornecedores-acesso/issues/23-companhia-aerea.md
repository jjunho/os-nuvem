# 23: Airline Fornecedor

**What to build:** An airline is a Fornecedor with its own rules, which flight lines and Reservas read. For Jeju Air (JA:41–46, 76–81, 107, 152; K622, K710–K717):
- an infant fare at 10% of the adult fare, and no more infants than adults;
- name changes capped at 20% of the group;
- no passengers added after the Tour Code request, and adding an infant after group ticketing is "a confirmar" (JA:83);
- extras requested by 24h or 72h before;
- groups up to 50, individual bookings up to 9.

The signed documents (the ethics term, K624) are attached to the Fornecedor. No other spec covers airlines.

**Blocked by:** 17 (Fornecedores tracer).

**Status:** ready-for-agent

- [ ] A Jeju Air flight line with 3 adults and 4 infants warns.
- [ ] An infant is suggested at 10% of the adult fare.
- [ ] A group of 55 warns over the limit.
