import { describe, expect, it } from "vitest"

import { janelasMensais } from "./periodo"

describe("janelasMensais", () => {
  it("cobre o ano inteiro quando já terminou", () => {
    const janelas = janelasMensais(2025, new Date("2026-08-09T00:00:00Z"))

    expect(janelas).toHaveLength(12)
    expect(janelas[0]).toEqual({ inicio: "2025-01-01", fim: "2025-01-31" })
    expect(janelas[11]).toEqual({ inicio: "2025-12-01", fim: "2025-12-31" })
  })

  it("para no mês corrente do ano em curso", () => {
    const janelas = janelasMensais(2026, new Date("2026-08-09T00:00:00Z"))

    expect(janelas).toHaveLength(8)
    expect(janelas[7]).toEqual({ inicio: "2026-08-01", fim: "2026-08-09" })
  })

  it("nunca gera janela maior que um mês", () => {
    for (const { inicio, fim } of janelasMensais(2024, new Date("2026-01-01T00:00:00Z"))) {
      const dias = (Date.parse(fim) - Date.parse(inicio)) / 86_400_000
      expect(dias).toBeLessThan(31)
    }
  })
})
