import { identificador, registro } from "./contratos";
export type Saida = {
  clientId: string;
  usuarioId: number;
  conversaId: number;
  texto: string;
  citadaId?: number | null;
  arquivo?: File;
  falhou: boolean;
  ordem?: number;
};
export function validarSaida(valor: unknown): asserts valor is Saida {
  if (
    !registro(valor) ||
    typeof valor.clientId !== "string" ||
    !/^[a-zA-Z0-9-]{16,80}$/.test(valor.clientId) ||
    !identificador(valor.usuarioId) ||
    typeof valor.conversaId !== "number" ||
    !Number.isSafeInteger(valor.conversaId) ||
    valor.conversaId === 0 ||
    typeof valor.texto !== "string" ||
    !valor.texto.trim() ||
    valor.texto.length > 20000 ||
    typeof valor.falhou !== "boolean" ||
    (valor.citadaId != null && !identificador(valor.citadaId)) ||
    (valor.ordem !== undefined && !identificador(valor.ordem)) ||
    (valor.arquivo !== undefined &&
      (!(valor.arquivo instanceof File) ||
        !valor.arquivo.size ||
        valor.conversaId < 0))
  )
    throw Error("Dados locais do comunicador inválidos");
}
let conexao: Promise<IDBDatabase> | undefined;
function abrir() {
  return (conexao ??= new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open("corealux-comunicador", 1);
    r.onupgradeneeded = () => {
      const fila = r.result.createObjectStore("fila", {
        keyPath: "ordem",
        autoIncrement: true,
      });
      fila.createIndex("clientId", "clientId", { unique: true });
      r.result.createObjectStore("cache");
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  }));
}
async function operacao<T>(
  tabela: string,
  modo: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(tabela, modo);
    const r = fn(tx.objectStore(tabela));
    tx.oncomplete = () => resolve(r.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
export async function guardarSaida(s: Saida) {
  validarSaida(s);
  const ordem = await operacao("fila", "readwrite", (t) => t.put(s));
  return { ...s, ordem: Number(ordem) };
}
export async function listarSaidas(usuarioId: number): Promise<Saida[]> {
  const todos = await operacao<unknown[]>("fila", "readonly", (t) =>
    t.getAll(),
  );
  const saidas: Saida[] = [];
  for (const item of todos) {
    // Other accounts' entries do not belong to this session.
    if (registro(item) && item.usuarioId !== usuarioId) continue;
    validarSaida(item);
    if (!identificador(item.ordem))
      throw Error("Dados locais do comunicador inválidos");
    saidas.push(item);
  }
  return saidas;
}
export async function apagarSaida(ordem: number) {
  await operacao("fila", "readwrite", (t) => t.delete(ordem));
}
export async function guardarCache(
  usuario: number,
  url: string,
  dados: unknown,
) {
  await operacao("cache", "readwrite", (s) =>
    s.put(dados, `${usuario}:${url}`),
  );
}
export async function lerCache(usuario: number, url: string) {
  return operacao("cache", "readonly", (s) => s.get(`${usuario}:${url}`));
}
export async function leituraOffline(
  usuario: number,
  url: string,
  signal?: AbortSignal,
) {
  let resposta: Response;
  try {
    resposta = await fetch(url, { signal });
  } catch (e) {
    signal?.throwIfAborted();
    const salvo = await lerCache(usuario, url);
    signal?.throwIfAborted();
    if (salvo) return salvo;
    throw e;
  }
  signal?.throwIfAborted();
  if (!resposta.ok) {
    await operacao("cache", "readwrite", (s) => s.delete(`${usuario}:${url}`));
    throw Error(await resposta.text());
  }
  const dados = await resposta.json();
  signal?.throwIfAborted();
  await guardarCache(usuario, url, dados);
  return dados;
}
export async function limparOffline() {
  await Promise.all([
    operacao("cache", "readwrite", (s) => s.clear()),
    operacao("fila", "readwrite", (s) => s.clear()),
  ]);
  if ("caches" in window)
    for (const nome of await caches.keys())
      if (nome.startsWith("corealux-")) await caches.delete(nome);
}
