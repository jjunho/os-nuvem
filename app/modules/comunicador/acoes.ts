export type Comando =
  | { acao: "enviar"; conversaId: number; clientId: string; texto: string; citadaId?: number | null }
  | { acao: "interna"; viagemId: number; clientId: string; texto: string }
  | { acao: "direta"; usuarioId: number }
  | { acao: "tarefa"; clientId: string; viagemId?: number; conversaId: number; mensagemId?: number; titulo: string; responsavelId: number; prazo: string; copias: number[] }
  | { acao: "concluir-tarefa"; tarefaId: number; conversaId: number }
  | { acao: "editar"; mensagemId: number; texto: string }
  | { acao: "apagar"; mensagemId: number }
  | { acao: "reagir"; mensagemId: number; emoji: string }
  | { acao: "presenca"; conversaId: number; aba: string; lendo: boolean }
  | { acao: "ler" | "nao-lida"; conversaId: number; mensagemId: number }
  | { acao: "preferencias"; dndInicio: string | null; dndFim: string | null; fuso: string | null }
  | { acao: "modo"; conversaId: number; modo: "todas" | "mencoes" | "mudo" }
  | { acao: "aviso-visto" }
  | { acao: "grupo"; nome: string; descricao: string; privada: boolean }
  | { acao: "entrar" | "sair"; conversaId: number }
  | { acao: "grupo-editar"; conversaId: number; nome: string; descricao: string; privada: boolean; arquivada: boolean }
  | { acao: "convidar" | "remover"; conversaId: number; usuarioId: number }
  | { acao: "mover"; midiaId: string; viajanteId: number }
  | { acao: "purgar"; midiaId: string };

