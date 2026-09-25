export type Segmento = {
  tipo:
    | "texto"
    | "usuario"
    | "todos"
    | "aqui"
    | "grupo"
    | "codigo"
    | "app"
    | "link"
    | "comando";
  texto: string;
  id?: number;
};
export type Contexto = {
  usuarios: { id: number; nome: string }[];
  grupos: { id: number; nome: string }[];
  origem: string;
};
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function segmentar(texto: string, ctx: Contexto): Segmento[] {
  const nomes = [...ctx.usuarios].sort((a, b) => b.nome.length - a.nome.length),
    grupos = [...ctx.grupos].sort((a, b) => b.nome.length - a.nome.length);
  const regex = new RegExp(
    `https?:\\/\\/[^\\s<>]+|^\\/(?:tarefa|urgente|bug)(?![\\p{L}\\p{N}_])|(?<![\\p{L}\\p{N}_@])(?:@(?:todos|aqui${nomes.map((u) => "|" + escapar(u.nome)).join("")})|#(?:${grupos.map((g) => escapar(g.nome)).join("|") || "(?!)"})|(?:V\\d{2}-\\d+|TAR-\\d+|OC-\\d+|PROP-\\d+))(?![\\p{L}\\p{N}_])`,
    "giu",
  );
  const saida: Segmento[] = [];
  let anterior = 0;
  for (const m of texto.matchAll(regex)) {
    if (m.index > anterior)
      saida.push({ tipo: "texto", texto: texto.slice(anterior, m.index) });
    const valor = m[0];
    let s: Segmento = { tipo: "codigo", texto: valor };
    if (/^https?:/.test(valor)) {
      let url: URL | null = null;
      try {
        url = new URL(valor);
      } catch {}
      s.tipo = url?.origin === ctx.origem ? "app" : "link";
    } else if (valor.startsWith("/")) s.tipo = "comando";
    else if (valor.toLowerCase() === "@todos") s.tipo = "todos";
    else if (valor.toLowerCase() === "@aqui") s.tipo = "aqui";
    else if (valor.startsWith("@")) {
      s.tipo = "usuario";
      s.id = nomes.find(
        (u) => u.nome.toLowerCase() === valor.slice(1).toLowerCase(),
      )?.id;
    } else if (valor.startsWith("#")) {
      s.tipo = "grupo";
      s.id = grupos.find(
        (g) => g.nome.toLowerCase() === valor.slice(1).toLowerCase(),
      )?.id;
    }
    saida.push(s);
    anterior = m.index + valor.length;
  }
  if (anterior < texto.length)
    saida.push({ tipo: "texto", texto: texto.slice(anterior) });
  return saida;
}
export function notificar(d: {
  tipo: string;
  modo: string;
  mencionado: boolean;
  lendo: boolean;
  urgente: boolean;
  agora: Date;
  dndInicio?: string;
  dndFim?: string;
  fuso?: string;
}) {
  if (d.lendo || (d.tipo !== "direta" && d.modo === "mudo")) return false;
  if (d.tipo !== "direta" && d.modo !== "todas" && !d.mencionado && !d.urgente)
    return false;
  if (!d.urgente && d.dndInicio && d.dndFim && d.dndInicio !== d.dndFim) {
    const hora = new Intl.DateTimeFormat("en-GB", {
      timeZone: d.fuso || "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(d.agora);
    if (
      d.dndInicio < d.dndFim
        ? hora >= d.dndInicio && hora < d.dndFim
        : hora >= d.dndInicio || hora < d.dndFim
    )
      return false;
  }
  return true;
}
