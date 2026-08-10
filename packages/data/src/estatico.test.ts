import { describe, expect, it } from "vitest"

import {
  distribuicaoDe,
  nivelNaDistribuicao,
  percentil,
  posicaoNaDistribuicao,
} from "./estatico"

describe("percentil", () => {
  it("retorna zero para lista vazia", () => {
    expect(percentil([], 0.5)).toBe(0)
  })

  it("retorna o próprio valor quando há um só elemento", () => {
    expect(percentil([42], 0.5)).toBe(42)
  })

  it("calcula a mediana de uma lista ímpar", () => {
    expect(percentil([1, 2, 3], 0.5)).toBe(2)
  })

  it("interpola a mediana de uma lista par", () => {
    expect(percentil([1, 2, 3, 4], 0.5)).toBe(2.5)
  })

  it("interpola quartis", () => {
    expect(percentil([1, 2, 3, 4, 5], 0.25)).toBe(2)
    expect(percentil([1, 2, 3, 4, 5], 0.75)).toBe(4)
  })

  it("ordena antes de calcular", () => {
    expect(percentil([5, 1, 3], 0.5)).toBe(3)
  })
})

describe("distribuicaoDe", () => {
  it("devolve zeros para amostra vazia", () => {
    expect(distribuicaoDe([])).toEqual({
      mediana: 0,
      media: 0,
      p25: 0,
      p75: 0,
      minimo: 0,
      maximo: 0,
      amostra: 0,
    })
  })

  it("resume uma amostra", () => {
    expect(distribuicaoDe([10, 20, 30, 40])).toEqual({
      mediana: 25,
      media: 25,
      p25: 17.5,
      p75: 32.5,
      minimo: 10,
      maximo: 40,
      amostra: 4,
    })
  })
})

describe("posicaoNaDistribuicao", () => {
  const distribuicao = distribuicaoDe([100, 200, 300])

  it("mede o quanto o valor foge da mediana", () => {
    expect(posicaoNaDistribuicao(400, distribuicao)).toBe(1)
    expect(posicaoNaDistribuicao(100, distribuicao)).toBeCloseTo(-0.5)
    expect(posicaoNaDistribuicao(200, distribuicao)).toBe(0)
  })

  it("evita divisão por zero", () => {
    expect(posicaoNaDistribuicao(500, distribuicaoDe([]))).toBe(0)
  })
})

describe("nivelNaDistribuicao", () => {
  // p25 = 20, p75 = 40, IQR = 20 → cerca de Tukey em 70
  const distribuicao = distribuicaoDe([10, 20, 30, 40, 50])

  it("classifica como dentro até o p75", () => {
    expect(nivelNaDistribuicao(0, distribuicao)).toBe("dentro")
    expect(nivelNaDistribuicao(40, distribuicao)).toBe("dentro")
  })

  it("classifica como acima entre o p75 e a cerca de Tukey", () => {
    expect(nivelNaDistribuicao(41, distribuicao)).toBe("acima")
    expect(nivelNaDistribuicao(70, distribuicao)).toBe("acima")
  })

  it("classifica como atípico além da cerca de Tukey", () => {
    expect(nivelNaDistribuicao(71, distribuicao)).toBe("atipico")
  })

  it("considera tudo dentro quando não há amostra", () => {
    expect(nivelNaDistribuicao(1_000_000, distribuicaoDe([]))).toBe("dentro")
  })
})
