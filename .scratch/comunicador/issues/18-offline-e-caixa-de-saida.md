# 18: Offline use and the outbox

**What to build:** Working in a tunnel or on a mountain loses nothing. A service worker caches the app shell and the conversations opened recently, so they're readable offline. Mensagens typed without signal (text, photos and voice notes) wait in an outbox in the browser (IndexedDB), marked pending, and go out in order when signal returns, never duplicated. Spec: `.scratch/comunicador/spec.md` (stories 97, 98; Optimistic sending and the outbox).

**Blocked by:** 16 (Voice notes and transcription).

**Status:** ready-for-agent

- [ ] With the browser context offline, a recently opened conversation still opens and shows its Mensagens.
- [ ] Three text Mensagens, a photo and a voice note typed offline show as pending.
- [ ] Back online, they arrive in the other context in the order typed.
- [ ] A send that timed out and is retried after reconnecting creates no duplicate.
- [ ] Closing and reopening the app while offline keeps the outbox.
- [ ] Vertical tests in `comunicador-parte7-*.spec.ts`.
