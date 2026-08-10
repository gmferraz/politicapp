import type { Casa, ParlamentarRef } from "@politicapp/data"

export const chaves = {
  estatico: {
    indice: ["estatico", "indice"] as const,
    despesas: ["estatico", "despesas"] as const,
    benchmarks: ["estatico", "benchmarks"] as const,
  },
  parlamentar: {
    detalhe: ({ casa, id }: ParlamentarRef) =>
      ["parlamentar", casa, id, "detalhe"] as const,
    proposicoes: ({ casa, id }: ParlamentarRef) =>
      ["parlamentar", casa, id, "proposicoes"] as const,
  },
  votacoes: {
    recentes: (casa: Casa) => ["votacoes", casa, "recentes"] as const,
    detalhe: (casa: Casa, id: string) => ["votacoes", casa, id] as const,
  },
} as const

export const TEMPO = {
  minuto: 60_000,
  hora: 60 * 60_000,
  dia: 24 * 60 * 60_000,
} as const
