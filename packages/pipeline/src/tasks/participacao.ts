export type RegistroVoto = {
  parlamentarId: string
  votou: boolean
}

export type Participacao = {
  participadas: number
  total: number
  percentual: number
}

export const calcularParticipacao = (
  votacoes: RegistroVoto[][],
): Map<string, Participacao> => {
  const participadas = new Map<string, number>()
  const total = votacoes.length

  for (const votacao of votacoes) {
    const contabilizados = new Set<string>()
    for (const { parlamentarId, votou } of votacao) {
      if (!votou || contabilizados.has(parlamentarId)) continue
      contabilizados.add(parlamentarId)
      participadas.set(parlamentarId, (participadas.get(parlamentarId) ?? 0) + 1)
    }
  }

  return new Map(
    [...participadas].map(([parlamentarId, quantidade]) => [
      parlamentarId,
      {
        participadas: quantidade,
        total,
        percentual: total === 0 ? 0 : Math.round((quantidade / total) * 1000) / 10,
      },
    ]),
  )
}
