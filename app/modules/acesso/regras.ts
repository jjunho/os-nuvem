export const DURACAO_SESSAO = 10 * 60 * 60 * 1000;
export const LIMITE_FALHAS = 10;
export const DURACAO_BLOQUEIO = 15 * 60 * 1000;

export const ERRO_CREDENCIAIS = "E-mail ou senha incorretos";
export const ERRO_BLOQUEIO = "Tente novamente em 15 minutos";

export class ErroAcesso extends Error {}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validarCamposAdmin(
  nome: string,
  email: string,
  senha: string,
): { nome: string; email: string } {
  nome = nome.trim();
  email = normalizarEmail(email);
  if (!nome) throw new ErroAcesso("Informe o nome");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ErroAcesso("Informe um e-mail válido");
  if ([...senha].length < 8)
    throw new ErroAcesso("A senha deve ter pelo menos 8 caracteres");
  return { nome, email };
}

export function decidirTentativa(
  tentativa: { falhas: number; bloqueadoAte: Date | null } | undefined,
  agora: Date,
): { erro: string } | { falhasAnteriores: number } {
  if (tentativa?.bloqueadoAte && tentativa.bloqueadoAte > agora)
    return { erro: ERRO_BLOQUEIO };
  return {
    falhasAnteriores: tentativa?.bloqueadoAte
      ? 0
      : (tentativa?.falhas ?? 0),
  };
}

export function registrarFalha(
  anteriores: number,
  agora: Date,
): { falhas: number; bloqueadoAte: Date | null; erro: string } {
  const falhas = anteriores + 1;
  const bloqueadoAte =
    falhas >= LIMITE_FALHAS
      ? new Date(agora.getTime() + DURACAO_BLOQUEIO)
      : null;
  return {
    falhas,
    bloqueadoAte,
    erro: bloqueadoAte ? ERRO_BLOQUEIO : ERRO_CREDENCIAIS,
  };
}
