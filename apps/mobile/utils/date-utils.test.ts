import { describe, expect, it } from "vitest"

import {
  formatarData,
  formatarDataCurta,
  formatarDataExtensa,
  formatarMesAno,
} from "./date-utils"

describe("formatarData", () => {
  it("formata como dd/MM/yyyy", () => {
    expect(formatarData("2026-08-10")).toBe("10/08/2026")
  })
})

describe("formatarDataExtensa", () => {
  it("escreve o mês por extenso", () => {
    expect(formatarDataExtensa("2026-08-10")).toBe("10 de agosto de 2026")
  })
})

describe("formatarDataCurta", () => {
  it("abrevia o mês", () => {
    expect(formatarDataCurta("2026-08-10")).toBe("10 de ago")
  })
})

describe("formatarMesAno", () => {
  it("abrevia o mês a partir de ano e mês numéricos", () => {
    expect(formatarMesAno(2026, 1)).toBe("jan")
    expect(formatarMesAno(2026, 12)).toBe("dez")
  })
})
