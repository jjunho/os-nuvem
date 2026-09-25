import { pool } from "~/db/client.server";
import { exigirConversa, invalido } from "./acesso.server";
import type { Usuario } from "./tipos";
export type PreferenciaComunicador = {
  aviso_visto: boolean;
  dnd_inicio: string;
  dnd_fim: string;
  fuso: string;
};
export async function preferencias(u: Usuario, d: Record<string, unknown>) {
  if (d.acao === "aviso-visto") {
    await pool.query(
      "insert into preferencias_comunicador(usuario_id,aviso_visto) values($1,true) on conflict(usuario_id) do update set aviso_visto=true",
      [u.id],
    );
    return { ok: true };
  }
  if (d.acao === "modo") {
    const id = Number(d.conversaId);
    await exigirConversa(u, id);
    if (!["todas", "mencoes", "mudo"].includes(String(d.modo))) invalido();
    await pool.query(
      "insert into membros_conversa(conversa_id,usuario_id,notificacao) values($1,$2,$3) on conflict(conversa_id,usuario_id) do update set notificacao=excluded.notificacao",
      [id, u.id, d.modo],
    );
    return { ok: true };
  }
  const inicio = String(d.dndInicio ?? ""),
    fim = String(d.dndFim ?? ""),
    fuso = String(d.fuso ?? "Asia/Seoul");
  if ([inicio, fim].some((x) => x && !/^([01]\d|2[0-3]):[0-5]\d$/.test(x)))
    invalido();
  try {
    new Intl.DateTimeFormat("en", { timeZone: fuso });
  } catch {
    invalido();
  }
  await pool.query(
    "insert into preferencias_comunicador(usuario_id,dnd_inicio,dnd_fim,fuso) values($1,$2,$3,$4) on conflict(usuario_id) do update set dnd_inicio=excluded.dnd_inicio,dnd_fim=excluded.dnd_fim,fuso=excluded.fuso",
    [u.id, inicio, fim, fuso],
  );
  return { ok: true };
}
export async function preferencia(
  u: Usuario,
): Promise<PreferenciaComunicador> {
  return (
    (
      await pool.query<{
        aviso_visto: boolean;
        dnd_inicio: string;
        dnd_fim: string;
        fuso: string;
      }>("select * from preferencias_comunicador where usuario_id=$1", [u.id])
    ).rows[0] ?? {
      aviso_visto: false,
      dnd_inicio: "",
      dnd_fim: "",
      fuso: "Asia/Seoul",
    }
  );
}
