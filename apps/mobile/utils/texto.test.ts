import { describe, expect, it } from "vitest"

import { normalizar } from "./texto"

describe("normalizar", () => {
  it("remove acentos e baixa a caixa", () => {
    expect(normalizar("São João")).toBe("sao joao")
    expect(normalizar("ÂNGELO Coronel")).toBe("angelo coronel")
    expect(normalizar("Ciro Nogueira")).toBe("ciro nogueira")
  })

  it("cobre os acentos comuns do português", () => {
    expect(normalizar("áàâãéêíóôõúüç")).toBe("aaaaeeiooouuc")
  })

  it("não altera texto já normalizado", () => {
    expect(normalizar("psol")).toBe("psol")
  })
})
