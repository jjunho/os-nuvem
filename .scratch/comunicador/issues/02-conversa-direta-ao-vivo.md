# 02: Tracer bullet: a live Conversa direta

**What to build:** The thinnest complete Comunicador. A Usuário opens the Comunicador, starts a Conversa direta with any other active Usuário and sends Mensagens that appear in the other person's window without reloading. The sender sees the Mensagem at once as pending, then confirmed, or failed with a retry. Spec: `.scratch/comunicador/spec.md` (stories 8–10, 17–19, 28, 30, 100).

The rest of the flow:
- Real-time delivery uses one Server-Sent Events stream per open app. Sending is an ordinary request. Fan-out happens in the process's memory. No Redis or broker.
- Each Mensagem carries a client-generated id, so a retry never duplicates it.
- A client that reconnects asks for everything after the last Mensagem it holds.
- Read and write rights are checked on every request and every stream event.
- On a phone the Comunicador is its own full screen. On a desktop it is a panel that opens beside any screen.
- Outside links stay plain links: no previews are fetched.
- Every string goes into the catalogue in PT and KO.
- This ticket lays the Comunicador module's schema for conversations, members and Mensagens so later tickets only add to it.

**Blocked by:** 01 (Idioma da interface and the PT/KO catalogue).

**Status:** ready-for-agent

- [ ] With two browser contexts, a Mensagem sent by one appears in the other without reload.
- [ ] Starting a Conversa direta with someone who already has one with you opens the existing one.
- [ ] The list of conversations is ordered by latest Mensagem.
- [ ] A Mensagem the server refuses shows an error with a retry. The retry doesn't create a duplicate.
- [ ] After the stream drops and reconnects, Mensagens sent meanwhile appear.
- [ ] A Usuário who isn't a member can't read or post to the conversation through any request or the stream.
- [ ] Portuguese and Korean text is stored and shown exactly as typed.
- [ ] On a desktop, the panel opens beside the Pipeline and a Viagem.
- [ ] Vertical tests in `comunicador-parte1-*.spec.ts`.
