const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
})

const moedaCompacta = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
})

const inteiro = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 })

export const formatarReais = (valor: number) => moeda.format(valor)

export const formatarReaisCompacto = (valor: number) =>
  Math.abs(valor) >= 10_000 ? moedaCompacta.format(valor) : moeda.format(valor)

export const formatarNumero = (valor: number) => inteiro.format(valor)

export const formatarPercentual = (valor: number, casas = 1) =>
  `${valor.toFixed(casas).replace(".", ",")}%`

export const formatarVariacao = (fracao: number) => {
  const percentual = Math.round(Math.abs(fracao) * 100)
  if (percentual === 0) return "na mediana"
  return fracao > 0 ? `${percentual}% acima` : `${percentual}% abaixo`
}

export const iniciais = (nome: string) =>
  nome
    .split(" ")
    .filter((parte) => parte.length > 2)
    .slice(0, 2)
    .map((parte) => parte[0]?.toLocaleUpperCase("pt-BR") ?? "")
    .join("")
