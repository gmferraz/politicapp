import type { Parlamentar } from "@politicapp/data"

import { log } from "../config"
import { lerCsvComCabecalho, numeroBr } from "../csv"
import { buscarJson, emLotes } from "../http"
import { janelasMensais } from "../periodo"
import type { LancamentoDespesa } from "./camara"

const API = "https://legis.senado.leg.br/dadosabertos"
const CEAPS = "https://www.senado.leg.br/transparencia/LAI/verba"

type IdentificacaoParlamentar = {
  CodigoParlamentar: string
  NomeParlamentar: string
  NomeCompletoParlamentar: string
  SiglaPartidoParlamentar?: string
  UfParlamentar?: string
  UrlFotoParlamentar?: string
  EmailParlamentar?: string
}

type ListaSenadores = {
  ListaParlamentarEmExercicio: {
    Parlamentares: {
      Parlamentar: { IdentificacaoParlamentar: IdentificacaoParlamentar }[]
    }
  }
}

export const listarSenadores = async (): Promise<Parlamentar[]> => {
  const resposta = await buscarJson<ListaSenadores>(`${API}/senador/lista/atual`)
  const lista =
    resposta.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar ?? []

  log(`senado: ${lista.length} senadores em exercício`)

  return lista.map(({ IdentificacaoParlamentar: identificacao }) => ({
    casa: "senado" as const,
    id: identificacao.CodigoParlamentar,
    nome: identificacao.NomeParlamentar,
    nomeCivil: identificacao.NomeCompletoParlamentar ?? null,
    partido: identificacao.SiglaPartidoParlamentar ?? "—",
    uf: identificacao.UfParlamentar ?? "—",
    fotoUrl: identificacao.UrlFotoParlamentar?.replace("http://", "https://") ?? null,
    email: identificacao.EmailParlamentar ?? null,
    emExercicio: true,
  }))
}

export const chaveDeNome = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z ]/g, "")
    .replace(/\s+/g, " ")
    .trim()

export const baixarDespesasSenado = async (
  ano: number,
  senadores: Parlamentar[],
): Promise<LancamentoDespesa[]> => {
  const url = `${CEAPS}/despesa_ceaps_${ano}.csv`
  log(`senado: baixando ${url}`)

  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`Falha ao baixar CEAPS: HTTP ${resposta.status}`)
  }

  const texto = new TextDecoder("iso-8859-1").decode(await resposta.arrayBuffer())
  const linhas = lerCsvComCabecalho(texto, { pularLinhas: 1 })
  log(`senado: ${linhas.length} lançamentos de cota em ${ano}`)

  const idPorNome = new Map(
    senadores.map((senador) => [chaveDeNome(senador.nome), senador.id]),
  )

  const semCorrespondencia = new Set<string>()

  const lancamentos = linhas.flatMap<LancamentoDespesa>((linha) => {
    const nome = linha.SENADOR ?? ""
    const id = idPorNome.get(chaveDeNome(nome))

    if (!id) {
      if (nome) semCorrespondencia.add(nome)
      return []
    }

    const valor = numeroBr(linha.VALOR_REEMBOLSADO)
    if (valor <= 0) return []

    return [
      {
        parlamentarId: id,
        ano: Number(linha.ANO) || ano,
        mes: Number(linha.MES) || 0,
        tipo: linha.TIPO_DESPESA ?? "",
        fornecedor: linha.FORNECEDOR ?? "",
        cnpjCpf: linha.CNPJ_CPF || null,
        valor,
        documentoUrl: null,
      },
    ]
  })

  if (semCorrespondencia.size > 0) {
    log(
      `senado: ${semCorrespondencia.size} nomes do CEAPS sem senador em exercício (ex-senadores ou suplentes)`,
    )
  }

  return lancamentos
}

type VotoSenadoApi = {
  codigoParlamentar: number
  nomeParlamentar: string
  siglaPartidoParlamentar: string | null
  siglaUFParlamentar: string | null
  siglaVotoParlamentar: string | null
}

export type VotacaoSenadoApi = {
  codigoSessaoVotacao: number
  dataSessao: string
  descricaoVotacao: string | null
  ementa: string | null
  identificacao: string | null
  sigla: string | null
  numero: string | null
  ano: number
  resultadoVotacao: string | null
  votacaoSecreta: string | null
  votos: VotoSenadoApi[]
}

export const listarVotacoesSenado = async (
  ano: number,
): Promise<VotacaoSenadoApi[]> => {
  const janelas = janelasMensais(ano)
  const porJanela = await emLotes(janelas, ({ inicio, fim }) =>
    buscarJson<VotacaoSenadoApi[]>(
      `${API}/votacao?dataInicio=${inicio}&dataFim=${fim}`,
    ).catch(() => [] as VotacaoSenadoApi[]),
  )

  const votacoes = porJanela.flat()
  log(`senado: ${votacoes.length} votações em ${ano}`)
  return votacoes
}

const VOTOS_CONTABILIZADOS = new Set(["SIM", "NAO", "ABSTENCAO", "VOTOU"])

export const senadorParticipou = (sigla: string | null) =>
  VOTOS_CONTABILIZADOS.has(chaveDeNome(sigla ?? "").replace(/ /g, ""))
