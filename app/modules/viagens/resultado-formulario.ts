export type ResultadoFormulario =
  | { ok: true; link: string }
  | { ok: true; revogado: true }
  | { erro: string };
