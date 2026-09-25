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
  const ordem = await operacao("fila", "readwrite", (t) => t.put(s));
  return { ...s, ordem: Number(ordem) };
}
export async function listarSaidas(usuarioId: number): Promise<Saida[]> {
  const todos = await operacao<Saida[]>("fila", "readonly", (t) => t.getAll());
  return todos.filter((s) => s.usuarioId === usuarioId);
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
export async function leituraOffline(usuario: number, url: string) {
  let resposta: Response;
  try {
    resposta = await fetch(url);
  } catch (e) {
    const salvo = await lerCache(usuario, url);
    if (salvo) return salvo;
    throw e;
  }
  if (!resposta.ok) {
    await operacao("cache", "readwrite", (s) => s.delete(`${usuario}:${url}`));
    throw Error(await resposta.text());
  }
  const dados = await resposta.json();
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
