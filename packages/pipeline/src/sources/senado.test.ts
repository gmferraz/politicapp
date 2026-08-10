import { describe, expect, it } from "vitest"

import { chaveDeNome, senadorParticipou } from "./senado"

describe("chaveDeNome", () => {
  it("iguala o nome do CEAPS ao da API", () => {
    expect(chaveDeNome("ALAN RICK")).toBe(chaveDeNome("Alan Rick"))
  })

  it("remove acentos", () => {
    expect(chaveDeNome("José Maria")).toBe("JOSE MARIA")
    expect(chaveDeNome("Ângelo Coronel")).toBe("ANGELO CORONEL")
    expect(chaveDeNome("Eduardo Girão")).toBe("EDUARDO GIRAO")
  })

  it("descarta pontuação e colapsa espaços", () => {
    expect(chaveDeNome("Silva  Jr.")).toBe("SILVA JR")
    expect(chaveDeNome("  Ana   Paula  ")).toBe("ANA PAULA")
  })
})

describe("senadorParticipou", () => {
  it("conta votos efetivos", () => {
    expect(senadorParticipou("Sim")).toBe(true)
    expect(senadorParticipou("Não")).toBe(true)
    expect(senadorParticipou("Abstenção")).toBe(true)
  })

  it("conta votação secreta como participação", () => {
    expect(senadorParticipou("Votou")).toBe(true)
  })

  it("não conta ausências nem licenças", () => {
    expect(senadorParticipou("AP")).toBe(false)
    expect(senadorParticipou("P-NRV")).toBe(false)
    expect(senadorParticipou("MIS")).toBe(false)
    expect(senadorParticipou("LS")).toBe(false)
    expect(senadorParticipou("LAP")).toBe(false)
    expect(senadorParticipou("LP")).toBe(false)
  })

  it("não conta quem presidiu a sessão", () => {
    expect(senadorParticipou("Presidente (art. 51 RISF)")).toBe(false)
  })

  it("tolera ausência de valor", () => {
    expect(senadorParticipou(null)).toBe(false)
    expect(senadorParticipou("")).toBe(false)
  })
})
