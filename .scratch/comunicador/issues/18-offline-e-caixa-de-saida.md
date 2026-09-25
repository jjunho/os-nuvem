# 18: Offline use and the outbox

**What to build:** Working in a tunnel or on a mountain loses nothing. A service worker caches the app shell and the conversations opened recently, so they're readable offline. Mensagens typed without signal (text, photos and voice notes) wait in an outbox in the browser (IndexedDB), marked pending, and go out in order when signal returns, never duplicated. Spec: `.scratch/comunicador/spec.md` (stories 97, 98; Optimistic sending and the outbox).

**Blocked by:** 16 (Voice notes and transcription).

**Status:** done

- [x] With the browser context offline, a recently opened conversation still opens and shows its Mensagens.
- [x] Three text Mensagens, a photo and a voice note typed offline show as pending.
- [x] Back online, they arrive in the other context in the order typed.
- [x] A send that timed out and is retried after reconnecting creates no duplicate.
- [x] Closing and reopening the app while offline keeps the outbox.
- [x] Vertical tests in `comunicador-parte7-*.spec.ts`.

## Comments

2026-09-25: implementado e revisado. Verificação: comunicador-parte7-offline.spec.ts. Detalhes de operação e configuração em `docs/execucao-comunicador.md`.
