# 19: Guided install on phones

**What to build:** At the first sign-in on a phone, a guided screen explains how to add the app to the Home Screen, with iOS-specific steps, since web push on iOS works only for an installed app (iOS 16.4 or later). It then asks for notification permission. The same screen shows the notice that the Admin can read every conversation (ticket 05). Spec: `.scratch/comunicador/spec.md` (story 90; Install; Further Notes).

**Blocked by:** 05 (Admin supervision and first-sign-in notice), 09 (Web push basics).

**Status:** done

- [x] The app has a web manifest and icons, and installs as a PWA.
- [x] A first sign-in on a phone viewport shows the guided screen. The iOS user agent gets the iOS steps. A desktop doesn't get it.
- [x] Granting permission registers a push subscription for that device.
- [x] The Admin notice is shown on the same screen and counts as seen.
- [x] The screen isn't shown again once done or skipped.
- [x] Strings in PT and KO.

## Comments

2026-09-25: implementado e revisado. Verificação: comunicador-parte7-instalacao.spec.ts. Detalhes de operação e configuração em `docs/execucao-comunicador.md`.
