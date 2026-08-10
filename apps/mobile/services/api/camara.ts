import {
  contarPlacar,
  tipoVotoSchema,
  type ParlamentarDetalhe,
  type Proposicao,
  type TipoVoto,
  type Votacao,
  type VotacaoDetalhe,
  type Voto,
} from "@politicapp/data"
import { z } from "zod"

import { buscarJson } from "./http"

const API = "https://dadosabertos.camara.leg.br/api/v2"
const FONTE = "camara"

const lista = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ dados: z.array(item) })

const detalheSchema = z.object({
  dados: z.object({
    id: z.number(),
    nomeCivil: z.string().nullish(),
    ultimoStatus: z.object({
      nome: z.string(),
      siglaPartido: z.string().nullish(),
      siglaUf: z.string().nullish(),
      urlFoto: z.string().nullish(),
      email: z.string().nullish(),
      gabinete: z
        .object({ telefone: z.string().nullish(), sala: z.string().nullish() })
        .nullish(),
    }),
    dataNascimento: z.string().nullish(),
    municipioNascimento: z.string().nullish(),
    ufNascimento: z.string().nullish(),
    escolaridade: z.string().nullish(),
    urlWebsite: z.string().nullish(),
  }),
})

export const buscarDeputado = async (
  id: string,
): Promise<ParlamentarDetalhe> => {
  const { dados } = await buscarJson(
    `${API}/deputados/${id}`,
    detalheSchema,
    { fonte: FONTE },
  )

  return {
    casa: "camara",
    id: String(dados.id),
    nome: dados.ultimoStatus.nome,
    nomeCivil: dados.nomeCivil ?? null,
    partido: dados.ultimoStatus.siglaPartido ?? "—",
    uf: dados.ultimoStatus.siglaUf ?? "—",
    fotoUrl: dados.ultimoStatus.urlFoto ?? null,
    email: dados.ultimoStatus.email ?? null,
    emExercicio: true,
    nascimento: dados.dataNascimento ?? null,
    municipioNascimento: dados.municipioNascimento ?? null,
    ufNascimento: dados.ufNascimento ?? null,
    escolaridade: dados.escolaridade ?? null,
    telefone: dados.ultimoStatus.gabinete?.telefone ?? null,
    site: dados.urlWebsite ?? null,
    gabinete: dados.ultimoStatus.gabinete?.sala ?? null,
  }
}

const proposicaoSchemaApi = z.object({
  id: z.number(),
  siglaTipo: z.string(),
  numero: z.number(),
  ano: z.number(),
  ementa: z.string().nullish(),
})

export const listarProposicoesDoDeputado = async (
  id: string,
): Promise<Proposicao[]> => {
  const { dados } = await buscarJson(
    `${API}/proposicoes?idDeputadoAutor=${id}&ordem=DESC&ordenarPor=id&itens=20`,
    lista(proposicaoSchemaApi),
    { fonte: FONTE },
  )

  return dados.map((proposicao) => ({
    casa: "camara" as const,
    id: String(proposicao.id),
    sigla: proposicao.siglaTipo,
    numero: proposicao.numero,
    ano: proposicao.ano,
    ementa: proposicao.ementa ?? "Sem ementa disponível",
    resumo: null,
    apresentadaEm: null,
    situacao: null,
    temas: [],
  }))
}

const votacaoSchemaApi = z.object({
  id: z.string(),
  data: z.string(),
  descricao: z.string(),
  aprovacao: z.number().nullish(),
  siglaOrgao: z.string().nullish(),
})

export const listarVotacoesRecentes = async (
  desde: string,
  ate: string,
): Promise<Votacao[]> => {
  const { dados } = await buscarJson(
    `${API}/votacoes?dataInicio=${desde}&dataFim=${ate}&ordem=DESC&ordenarPor=dataHoraRegistro&itens=40`,
    lista(votacaoSchemaApi),
    { fonte: FONTE },
  )

  return dados.map((votacao) => ({
    casa: "camara" as const,
    id: votacao.id,
    data: votacao.data,
    descricao: votacao.descricao,
    resumo: null,
    proposicao: null,
    aprovada: votacao.aprovacao === null || votacao.aprovacao === undefined
      ? null
      : votacao.aprovacao === 1,
    placar: { sim: 0, nao: 0, abstencao: 0, outros: 0 },
  }))
}

const votoSchemaApi = z.object({
  tipoVoto: z.string(),
  deputado_: z.object({
    id: z.number(),
    nome: z.string(),
    siglaPartido: z.string().nullish(),
    siglaUf: z.string().nullish(),
  }),
})

const TIPO_VOTO_CAMARA: Record<string, TipoVoto> = {
  Sim: "sim",
  Não: "nao",
  Abstenção: "abstencao",
  Obstrução: "obstrucao",
  "Artigo 17": "presidente",
}

export const buscarVotacao = async (id: string): Promise<VotacaoDetalhe> => {
  const [{ dados: detalhe }, { dados: votosApi }] = await Promise.all([
    buscarJson(`${API}/votacoes/${id}`, z.object({ dados: votacaoSchemaApi }), {
      fonte: FONTE,
    }),
    buscarJson(`${API}/votacoes/${id}/votos`, lista(votoSchemaApi), {
      fonte: FONTE,
    }),
  ])

  const votos: Voto[] = votosApi.map((voto) => ({
    casa: "camara" as const,
    id: String(voto.deputado_.id),
    nome: voto.deputado_.nome,
    partido: voto.deputado_.siglaPartido ?? "—",
    uf: voto.deputado_.siglaUf ?? "—",
    voto: tipoVotoSchema
      .catch("ausente")
      .parse(TIPO_VOTO_CAMARA[voto.tipoVoto.trim()] ?? "ausente"),
  }))

  return {
    casa: "camara",
    id: detalhe.id,
    data: detalhe.data,
    descricao: detalhe.descricao,
    resumo: null,
    proposicao: null,
    aprovada:
      detalhe.aprovacao === null || detalhe.aprovacao === undefined
        ? null
        : detalhe.aprovacao === 1,
    placar: contarPlacar(votos),
    votos,
  }
}
