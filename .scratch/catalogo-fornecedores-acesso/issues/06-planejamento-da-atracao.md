# 06: Planning data and closing days

**What to build:** Each Atração records what planning needs:
- weekly closing days (Gyeongbokgung on Tuesdays, Ganghwa market on Mondays, K613), temporary closures and renovations as date ranges (K273), and seasonal notes (Jinhae cherry blossom, K327);
- opening hours, address, indoor or outdoor, cost tier, visit duration and physical effort (Hallasan 7–8h, "sem caminhadas difíceis");
- proximity as "near Atração X, N min" (guias:40), not a loose near/far;
- booking lead time (KTX, Sky Capsule, DMZ, K-beauty about one month, K251), which the Operação spec's Reservas read.

A Dia whose date is a closing day or inside a closure of one of its Atrações gets a warning. Catálogo values with a known conflict (Sokcho's copied description, the "?" meeting points) are entered "a confirmar" and never used silently. Spec: stories 4, 8, 39.

**Blocked by:** 04 (Atração tracer).

**Status:** ready-for-agent

- [ ] Gyeongbokgung on a Tuesday Dia warns. Changing the date clears the warning.
- [ ] A renovation from 01/03 to 30/04 warns on any Dia in that range.
- [ ] A field marked "a confirmar" shows as such wherever it's used, and a document using it warns.
- [ ] The picker can filter by indoor (for a rainy day) and by effort.
