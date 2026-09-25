import { data } from "react-router";

/** Validation is recoverable in the form; access and unexpected failures stay at the route boundary. */
export async function erroDeFormulario(erro: unknown) {
  if (erro instanceof Response && [400, 409, 413, 422].includes(erro.status)) {
    return data({ erro: await erro.text() }, { status: erro.status });
  }
  throw erro;
}
