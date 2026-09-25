import { exigirConversa, invalido } from "./acesso.server";
import type { Usuario } from "./tipos";
const presencas = new Map<
  string,
  { usuario: number; conversa: number; lendo: boolean; em: number }
>();
export async function presenca(u: Usuario, d: Record<string, unknown>) {
  const id = Number(d.conversaId),
    aba = String(d.aba ?? "").slice(0, 80);
  if (!aba) invalido();
  if (id) await exigirConversa(u, id);
  const agora = Date.now();
  for (const [k, v] of presencas)
    if (agora - v.em > 180000) presencas.delete(k);
  presencas.set(`${u.id}:${aba}`, {
    usuario: u.id,
    conversa: id,
    lendo: d.lendo === true,
    em: agora,
  });
  return { ok: true };
}
export function resumoPresenca(
  usuarioId: number,
  conversaId: number,
  agoraMs: number,
): { lendo: boolean; aqui: boolean } {
  const ativas = [...presencas.values()].filter(
    (p) => p.usuario === usuarioId && p.conversa === conversaId,
  );
  return {
    lendo: ativas.some((p) => p.lendo && agoraMs - p.em < 25000),
    aqui: ativas.some((p) => agoraMs - p.em < 180000),
  };
}
export function limparPresencasDeTeste() {
  if (process.env.TEST_MODE === "1") presencas.clear();
}
export function leituraAtual(usuarioId: number, conversaIds: number[]) {
  return [...presencas.values()].some(
    (p) =>
      p.usuario === usuarioId &&
      conversaIds.includes(p.conversa) &&
      p.lendo &&
      Date.now() - p.em < 25000,
  );
}
