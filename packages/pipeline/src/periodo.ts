export type Janela = { inicio: string; fim: string }

const iso = (data: Date) => data.toISOString().slice(0, 10)

export const janelasMensais = (ano: number, hoje = new Date()): Janela[] => {
  const ultimoMes = hoje.getUTCFullYear() === ano ? hoje.getUTCMonth() : 11
  const janelas: Janela[] = []

  for (let mes = 0; mes <= ultimoMes; mes += 1) {
    const inicio = new Date(Date.UTC(ano, mes, 1))
    const fimDoMes = new Date(Date.UTC(ano, mes + 1, 0))
    const fim = fimDoMes > hoje && hoje >= inicio ? hoje : fimDoMes
    janelas.push({ inicio: iso(inicio), fim: iso(fim) })
  }

  return janelas
}
