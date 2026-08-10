import { describe, expect, it } from "vitest"

import {
  formatarNumero,
  formatarPercentual,
  formatarReais,
  formatarReaisCompacto,
  formatarVariacao,
  iniciais,
} from "./formatters"

// Intl usa espaço inflexível (U+00A0) entre "R$" e o número.
const semNbsp = (texto: string) => texto.replace(/ /g, " ")

describe("formatarReais", () => {
  it("formata em reais com centavos", () => {
    expect(semNbsp(formatarReais(1234.56))).toBe("R$ 1.234,56")
  })
})

describe("formatarReaisCompacto", () => {
  it("mantém o formato completo abaixo de dez mil", () => {
    expect(formatarReaisCompacto(9_999)).toBe(formatarReais(9_999))
  })

  it("compacta valores grandes", () => {
    expect(semNbsp(formatarReaisCompacto(15_000))).toContain("mil")
    expect(semNbsp(formatarReaisCompacto(1_500_000))).toContain("mi")
  })
})

describe("formatarNumero", () => {
  it("separa milhares no padrão brasileiro", () => {
    expect(formatarNumero(1234)).toBe("1.234")
  })
})

describe("formatarPercentual", () => {
  it("usa vírgula decimal", () => {
    expect(formatarPercentual(87.5)).toBe("87,5%")
  })

  it("arredonda quando pedido sem casas", () => {
    expect(formatarPercentual(87.5, 0)).toBe("88%")
  })
})

describe("formatarVariacao", () => {
  it("descreve desvios acima e abaixo da mediana", () => {
    expect(formatarVariacao(0.12)).toBe("12% acima")
    expect(formatarVariacao(-0.3)).toBe("30% abaixo")
  })

  it("trata desvios ínfimos como na mediana", () => {
    expect(formatarVariacao(0.001)).toBe("na mediana")
    expect(formatarVariacao(0)).toBe("na mediana")
  })
})

describe("iniciais", () => {
  it("usa as duas primeiras palavras relevantes", () => {
    expect(iniciais("Maria da Silva")).toBe("MS")
  })

  it("ignora preposições curtas", () => {
    expect(iniciais("José de Alencar Gomes")).toBe("JA")
  })
})
