import { unzipSync } from "fflate"

import type { Parlamentar } from "@politicapp/data"

import { log } from "../config"
import { lerCsvComCabecalho, numeroBr } from "../csv"
import { buscarJson, emLotes } from "../http"
import { janelasMensais } from "../periodo"

const API = "https://dadosabertos.camara.leg.br/api/v2"
const COTAS = "https://www.camara.leg.br/cotas"
const ITENS_POR_PAGINA = 100

type RespostaLista<T> = {
  dados: T[]
  links: { rel: string; href: string }[]
}

type DeputadoApi = {
  id: number
  nome: string
  siglaPartido: string | null
  siglaUf: string | null
  urlFoto: string | null
  email: string | null
}

const paginar = async <T>(urlInicial: string): Promise<T[]> => {
  const acumulado: T[] = []
  let url: string | undefined = urlInicial

  while (url) {
    const resposta: RespostaLista<T> = await buscarJson<RespostaLista<T>>(url)
    acumulado.push(...resposta.dados)
    url = resposta.links.find((link) => link.rel === "next")?.href
  }

  return acumulado
}

export const listarDeputados = async (): Promise<Parlamentar[]> => {
  const deputados = await paginar<DeputadoApi>(
    `${API}/deputados?ordem=ASC&ordenarPor=nome&itens=${ITENS_POR_PAGINA}`,
  )

  log(`câmara: ${deputados.length} deputados em exercício`)

  return deputados.map((deputado) => ({
    casa: "camara" as const,
    id: String(deputado.id),
    nome: deputado.nome,
    nomeCivil: null,
    partido: deputado.siglaPartido ?? "—",
    uf: deputado.siglaUf ?? "—",
    fotoUrl: deputado.urlFoto,
    email: deputado.email,
    emExercicio: true,
  }))
}

export type LancamentoDespesa = {
  parlamentarId: string
  ano: number
  mes: number
  tipo: string
  fornecedor: string
  cnpjCpf: string | null
  valor: number
  documentoUrl: string | null
}

export const baixarDespesasCamara = async (
  ano: number,
): Promise<LancamentoDespesa[]> => {
  const url = `${COTAS}/Ano-${ano}.csv.zip`
  log(`câmara: baixando ${url}`)

  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`Falha ao baixar cotas da Câmara: HTTP ${resposta.status}`)
  }

  const zip = unzipSync(new Uint8Array(await resposta.arrayBuffer()))
  const arquivo = Object.entries(zip).find(([nome]) => nome.endsWith(".csv"))
  if (!arquivo) {
    throw new Error("Zip de cotas da Câmara não contém CSV")
  }

  const linhas = lerCsvComCabecalho(
    new TextDecoder("utf-8").decode(arquivo[1]),
  )
  log(`câmara: ${linhas.length} lançamentos de cota em ${ano}`)

  return linhas
    .filter((linha) => linha.ideCadastro)
    .map((linha) => ({
      parlamentarId: String(linha.ideCadastro),
      ano: Number(linha.numAno) || ano,
      mes: Number(linha.numMes) || 0,
      tipo: linha.txtDescricao ?? "",
      fornecedor: linha.txtFornecedor ?? "",
      cnpjCpf: linha.txtCNPJCPF || null,
      valor: numeroBr(linha.vlrLiquido),
      documentoUrl: linha.urlDocumento || null,
    }))
    .filter((despesa) => despesa.valor > 0)
}

type VotacaoApi = {
  id: string
  data: string
  descricao: string
  siglaOrgao: string | null
  aprovacao: number | null
  proposicaoObjeto: string | null
}

const PLENARIO = "PLEN"

export const listarVotacoesCamara = async (
  ano: number,
): Promise<VotacaoApi[]> => {
  const janelas = janelasMensais(ano)
  const porJanela = await emLotes(janelas, ({ inicio, fim }) =>
    paginar<VotacaoApi>(
      `${API}/votacoes?dataInicio=${inicio}&dataFim=${fim}&ordem=DESC&ordenarPor=dataHoraRegistro&itens=${ITENS_POR_PAGINA}`,
    ),
  )

  const todas = porJanela.flat()
  const doPlenario = todas.filter(
    (votacao) => votacao.siglaOrgao?.toUpperCase() === PLENARIO,
  )

  log(
    `câmara: ${todas.length} votações no ano, ${doPlenario.length} no plenário`,
  )

  return doPlenario
}

type VotoApi = {
  tipoVoto: string
  deputado_: { id: number; nome: string; siglaPartido: string | null; siglaUf: string | null }
}

export const listarVotosCamara = async (votacaoId: string) => {
  const resposta = await buscarJson<RespostaLista<VotoApi>>(
    `${API}/votacoes/${votacaoId}/votos`,
  )
  return resposta.dados
}
