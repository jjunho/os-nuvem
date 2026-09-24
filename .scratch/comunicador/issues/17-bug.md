# 17: `/bug`

**What to build:** `/bug` opens a form with the K940 fields: página, ação, esperado, observado, reprodução, aparelho/navegador/idioma. It is prefilled with the last non-Comunicador screen's address, the device, browser and interface language, and a capture of that screen taken in the browser. Sending posts the report as a Mensagem in the conversation where it was typed. Spec: `.scratch/comunicador/spec.md` (story 58; Commands; Layout).

**Blocked by:** 08 (Leitura de mensagem and trigger keys).

**Status:** ready-for-agent

- [ ] After visiting a Viagem, `/bug` in the Comunicador prefills that Viagem's address, the browser and the interface language.
- [ ] The capture is attached as an image.
- [ ] The posted Mensagem shows the K940 fields in order, in the conversation where `/bug` was typed.
- [ ] Form strings in PT and KO.
