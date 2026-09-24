# 16: Voice notes and transcription

**What to build:** A Usuário holds a button to record a voice note and sends it. It plays at once, in the format each browser produces, iOS included. It is transcribed, and the transcript shows under it and is found by search. When transcription is unavailable, the voice note still plays and its transcript appears later (ADR-0004). The Admin purge from ticket 15 also covers voice notes. Spec: `.scratch/comunicador/spec.md` (stories 37, 87–89; Voice notes; Adapters at the edge).

The **Transcrição** adapter uses Gemini in production and a recording fake in the test build, read and controlled through a test-only route. Transcription is queued and retried with backoff.

**Blocked by:** 07 (Search), 15 (Photos).

**Status:** ready-for-agent

- [ ] A voice note sent by one context plays in the other before any transcript exists.
- [ ] The fake's transcript appears under it, live.
- [ ] Search finds a word from the transcript, with the same access rules as text.
- [ ] With the fake failing, the voice note plays, and it is transcribed on a later retry.
- [ ] Download rights and the Admin purge work as for photos.
