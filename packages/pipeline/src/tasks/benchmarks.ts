import {
  distribuicaoDe,
  type Benchmark,
  type Casa,
  type Distribuicao,
  type IndiceParlamentar,
} from "@politicapp/data"

const AMOSTRA_MINIMA = 3

export const calcularBenchmark = (
  casa: Casa,
  ano: number,
  parlamentares: IndiceParlamentar[],
  votacoesNominais: number,
): Benchmark => {
  const daCasa = parlamentares.filter(
    (parlamentar) => parlamentar.casa === casa,
  )
  const gastos = daCasa
    .map((parlamentar) => parlamentar.gastoAno)
    .filter((gasto): gasto is number => gasto !== null)
  const participacoes = daCasa
    .map((parlamentar) => parlamentar.participacaoPercentual)
    .filter((participacao): participacao is number => participacao !== null)

  return {
    casa,
    ano,
    gastos: {
      geral: distribuicaoDe(gastos),
      porUf: agruparDistribuicao(daCasa, (p) => p.uf),
      porPartido: agruparDistribuicao(daCasa, (p) => p.partido),
    },
    participacao: { geral: distribuicaoDe(participacoes) },
    votacoesNominais,
  }
}

const agruparDistribuicao = (
  parlamentares: IndiceParlamentar[],
  chaveDe: (parlamentar: IndiceParlamentar) => string,
): Record<string, Distribuicao> => {
  const grupos = new Map<string, number[]>()

  for (const parlamentar of parlamentares) {
    if (parlamentar.gastoAno === null) continue
    const chave = chaveDe(parlamentar)
    const atual = grupos.get(chave)
    if (atual) {
      atual.push(parlamentar.gastoAno)
    } else {
      grupos.set(chave, [parlamentar.gastoAno])
    }
  }

  return Object.fromEntries(
    [...grupos]
      .filter(([, valores]) => valores.length >= AMOSTRA_MINIMA)
      .map(([chave, valores]) => [chave, distribuicaoDe(valores)]),
  )
}
