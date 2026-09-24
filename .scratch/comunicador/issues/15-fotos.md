# 15: Photos

**What to build:** A Usuário sends photos from the camera or the gallery, compressed in the browser before upload so they work on mobile data. Photos are kept permanently and open full screen with zoom. Files are stored on the server's disk, and the database holds their metadata, owner and conversation. Every download checks the reader's right to the conversation. The Admin can purge a photo, which deletes it from disk and leaves a placeholder. Spec: `.scratch/comunicador/spec.md` (stories 82–84, 86; Media).

**Blocked by:** 05 (Admin supervision and first-sign-in notice).

**Status:** ready-for-agent

- [ ] A large photo is sent smaller than the original and shown in the other window live.
- [ ] Full screen with zoom works.
- [ ] A non-member's download request is refused, including by guessing the URL.
- [ ] The Admin purge removes the file from disk and leaves a placeholder for everyone.
- [ ] Vertical tests in `comunicador-parte6-*.spec.ts`.
