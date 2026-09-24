import { randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db/client.server";
import { sessoes, tentativasEntrada, usuarios } from "../../db/schema";
import { conferirSenha, gerarHash } from "./senha.server";

const DURACAO_SESSAO = 10 * 60 * 60 * 1000;
// Generated once per process. Unknown e-mails still pay the same scrypt cost.
const hashSimulado = gerarHash(randomBytes(32).toString("hex"));

const LIMITE_FALHAS = 10;
const DURACAO_BLOQUEIO = 15 * 60 * 1000;
const ERRO_CREDENCIAIS = "E-mail ou senha incorretos";
const ERRO_BLOQUEIO = "Tente novamente em 15 minutos";

export async function entrar(email: string, senha: string, agora: Date) {
  email = email.trim().toLowerCase();
  return db.transaction(async (tx) => {
    // Also serializes the first attempt, before an attempts row exists.
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${email}, 0))`,
    );
    const [tentativa] = await tx
      .select()
      .from(tentativasEntrada)
      .where(eq(tentativasEntrada.email, email));
    if (tentativa?.bloqueadoAte && tentativa.bloqueadoAte > agora)
      return { erro: ERRO_BLOQUEIO };
    const falhasAnteriores = tentativa?.bloqueadoAte
      ? 0
      : (tentativa?.falhas ?? 0);
    const [usuario] = await tx
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email));
    const confere = await conferirSenha(
      senha,
      usuario?.ativo ? usuario.senhaHash : await hashSimulado,
    );
    if (!confere || !usuario?.ativo) {
      const falhas = falhasAnteriores + 1;
      const bloqueadoAte =
        falhas >= LIMITE_FALHAS
          ? new Date(agora.getTime() + DURACAO_BLOQUEIO)
          : null;
      await tx
        .insert(tentativasEntrada)
        .values({ email, falhas, bloqueadoAte })
        .onConflictDoUpdate({
          target: tentativasEntrada.email,
          set: { falhas, bloqueadoAte },
        });
      return { erro: bloqueadoAte ? ERRO_BLOQUEIO : ERRO_CREDENCIAIS };
    }
    await tx
      .delete(tentativasEntrada)
      .where(eq(tentativasEntrada.email, email));
    const sessao = {
      token: randomBytes(32).toString("hex"),
      usuarioId: usuario.id,
      expiraEm: new Date(agora.getTime() + DURACAO_SESSAO),
    };
    await tx.insert(sessoes).values(sessao);
    return { sessao };
  });
}

export async function usuarioDaSessao(token: string | null, agora: Date) {
  if (!token) return null;
  const [registro] = await db
    .select({
      expiraEm: sessoes.expiraEm,
      usuario: {
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        papel: usuarios.papel,
        ativo: usuarios.ativo,
        deveTrocarSenha: usuarios.deveTrocarSenha,
        idiomaInterface: usuarios.idiomaInterface,
      },
    })
    .from(sessoes)
    .innerJoin(usuarios, eq(sessoes.usuarioId, usuarios.id))
    .where(eq(sessoes.token, token));
  if (!registro) return null;
  if (registro.expiraEm <= agora || !registro.usuario.ativo) {
    await sair(token);
    return null;
  }
  return registro.usuario;
}

export async function sair(token: string | null) {
  if (token) await db.delete(sessoes).where(eq(sessoes.token, token));
}

export class ErroAcesso extends Error {}

export async function criarPrimeiroAdmin(
  nome: string,
  email: string,
  senha: string,
) {
  nome = nome.trim();
  email = email.trim().toLowerCase();
  if (!nome) throw new ErroAcesso("Informe o nome");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ErroAcesso("Informe um e-mail válido");
  if ([...senha].length < 8)
    throw new ErroAcesso("A senha deve ter pelo menos 8 caracteres");
  const senhaHash = await gerarHash(senha);
  await db.transaction(async (tx) => {
    // Prevent two bootstrap processes (or another writer) from both creating the first Admin.
    await tx.execute(sql`lock table usuarios in share row exclusive mode`);
    const [admin] = await tx
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(sql`${usuarios.papel} = 'admin' and ${usuarios.ativo} = true`)
      .limit(1);
    if (admin) throw new ErroAcesso("Já existe um Admin ativo");
    const [criado] = await tx
      .insert(usuarios)
      .values({ nome, email, senhaHash, papel: "admin" })
      .onConflictDoNothing({ target: usuarios.email })
      .returning({ id: usuarios.id });
    if (!criado) throw new ErroAcesso("E-mail já está em uso");
  });
}
