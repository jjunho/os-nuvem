import type { ChaveTraducao } from "~/modules/idiomas/catalogo";
// Display labels in Portuguese, using the glossary's words (CONTEXT.md).

export const rotuloEtapa: Record<string, ChaveTraducao> = {
  lead: "Lead",
  em_orcamento: "Em orçamento",
  proposta_enviada: "Proposta enviada",
  em_negociacao: "Em negociação",
  confirmada: "Confirmada",
  em_viagem: "Em viagem",
  concluida: "Concluída",
  perdida: "Perdida",
  cancelada: "Cancelada",
  descartada: "Descartada",
};

export const rotuloCanal: Record<string, ChaveTraducao> = {
  operadora: "Interep/Operadora",
  agencia: "Agência",
  cliente_final: "Cliente final",
  influencer: "Influencer",
};

export const rotuloCategoria: Record<string, ChaveTraducao> = {
  economico: "Econômico",
  padrao: "Padrão",
  premium: "Premium",
  vip: "VIP",
};

export const rotuloOrigem: Record<string, ChaveTraducao> = {
  instagram: "Instagram",
  site: "Site",
  indicacao: "Indicação",
  agencia: "Agência",
  operadora: "Operadora",
  influenciador: "Influenciador",
  outra: "Outra",
};

export const rotuloIdioma: Record<string, ChaveTraducao> = {
  pt: "Português",
  es: "Espanhol",
  en: "Inglês",
  fr: "Francês",
};

export const rotuloMarca: Record<string, ChaveTraducao> = {
  corealux: "CoreaLux (B2B)",
  guia_na_coreia: "Guia na Coreia (B2C)",
};

export const MEIOS_DE_CONTATO: ChaveTraducao[] = [
  "WhatsApp",
  "WhatsApp pessoal",
  "Respond.io",
  "E-mail",
  "Instagram",
  "Telefone/áudio",
  "Videochamada",
  "Formulário",
];
