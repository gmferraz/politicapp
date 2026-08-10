import { describe, expect, it } from "vitest"

import { calcularParticipacao } from "./participacao"

describe("calcularParticipacao", () => {
  it("conta em quantas votações cada um registrou voto", () => {
    const participacao = calcularParticipacao([
      [
        { parlamentarId: "1", votou: true },
        { parlamentarId: "2", votou: false },
      ],
      [
        { parlamentarId: "1", votou: true },
        { parlamentarId: "2", votou: true },
      ],
    ])

    expect(participacao.get("1")).toEqual({
      participadas: 2,
      total: 2,
      percentual: 100,
    })
    expect(participacao.get("2")).toEqual({
      participadas: 1,
      total: 2,
      percentual: 50,
    })
  })

  it("não conta duas vezes quem aparece repetido na mesma votação", () => {
    const participacao = calcularParticipacao([
      [
        { parlamentarId: "1", votou: true },
        { parlamentarId: "1", votou: true },
      ],
    ])

    expect(participacao.get("1")?.participadas).toBe(1)
  })

  it("omite quem nunca votou", () => {
    const participacao = calcularParticipacao([
      [{ parlamentarId: "1", votou: false }],
    ])

    expect(participacao.get("1")).toBeUndefined()
  })

  it("arredonda o percentual para uma casa decimal", () => {
    const participacao = calcularParticipacao(
      Array.from({ length: 3 }, (_, indice) => [
        { parlamentarId: "1", votou: indice === 0 },
      ]),
    )

    expect(participacao.get("1")?.percentual).toBe(33.3)
  })

  it("devolve vazio quando não houve votação", () => {
    expect(calcularParticipacao([]).size).toBe(0)
  })
})
