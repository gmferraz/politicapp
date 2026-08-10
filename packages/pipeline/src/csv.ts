const BOM = "﻿"

export const lerCsv = (conteudo: string, separador = ";"): string[][] => {
  const texto = conteudo.startsWith(BOM) ? conteudo.slice(1) : conteudo
  const linhas: string[][] = []
  let campo = ""
  let linha: string[] = []
  let dentroDeAspas = false

  for (let i = 0; i < texto.length; i += 1) {
    const caractere = texto[i]

    if (dentroDeAspas) {
      if (caractere === '"') {
        if (texto[i + 1] === '"') {
          campo += '"'
          i += 1
        } else {
          dentroDeAspas = false
        }
      } else {
        campo += caractere
      }
      continue
    }

    if (caractere === '"') {
      dentroDeAspas = true
      continue
    }

    if (caractere === separador) {
      linha.push(campo)
      campo = ""
      continue
    }

    if (caractere === "\n") {
      linha.push(campo.replace(/\r$/, ""))
      linhas.push(linha)
      linha = []
      campo = ""
      continue
    }

    campo += caractere
  }

  if (campo.length > 0 || linha.length > 0) {
    linha.push(campo.replace(/\r$/, ""))
    linhas.push(linha)
  }

  return linhas
}

type OpcoesCsv = { separador?: string; pularLinhas?: number }

export const lerCsvComCabecalho = (
  conteudo: string,
  { separador = ";", pularLinhas = 0 }: OpcoesCsv = {},
): Record<string, string>[] => {
  const [cabecalho, ...linhas] = lerCsv(conteudo, separador).slice(pularLinhas)
  if (!cabecalho) return []

  return linhas
    .filter((linha) => linha.length === cabecalho.length)
    .map((linha) =>
      Object.fromEntries(
        cabecalho.map((coluna, indice) => [coluna, linha[indice] ?? ""]),
      ),
    )
}

export const numeroBr = (valor: string | undefined): number => {
  if (!valor) return 0
  const normalizado = valor.includes(",")
    ? valor.replace(/\./g, "").replace(",", ".")
    : valor
  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : 0
}
