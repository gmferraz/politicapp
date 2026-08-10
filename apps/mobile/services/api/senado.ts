import {
  contarPlacar,
  type ParlamentarDetalhe,
  type TipoVoto,
  type Votacao,
  type VotacaoDetalhe,
  type Voto,
} from "@politicapp/data"
import { z } from "zod"

import { buscarJson } from "./http"

const API = "https://legis.senado.leg.br/dadosabertos"
const FONTE = "senado"

const texto = z.union([z.string(), z.number()]).transform(String)

const detalheSchema = z.object({
  DetalheParlamentar: z.object({
    Parlamentar: z.object({
      IdentificacaoParlamentar: z.object({
        CodigoParlamentar: texto,
        NomeParlamentar: z.string(),
        NomeCompletoParlamentar: z.string().nullish(),
        SiglaPartidoParlamentar: z.string().nullish(),
        UfParlamentar: z.string().nullish(),
        UrlFotoParlamentar: z.string().nullish(),
        EmailParlamentar: z.string().nullish(),
        UrlPaginaParlamentar: z.string().nullish(),
      }),
      DadosBasicosParlamentar: z
        .object({
          DataNascimento: z.string().nullish(),
          Naturalidade: z.string().nullish(),
          UfNaturalidade: z.string().nullish(),
          EnderecoParlamentar: z.string().nullish(),
        })
        .nullish(),
    }),
  }),
})

export const buscarSenador = async (
  id: string,
): Promise<ParlamentarDetalhe> => {
  const resposta = await buscarJson(
    `${API}/senador/${id}`,
    detalheSchema,
    { fonte: FONTE },
  )

  const { IdentificacaoParlamentar: identificacao, DadosBasicosParlamentar: basicos } =
    resposta.DetalheParlamentar.Parlamentar

  return {
    casa: "senado",
    id: identificacao.CodigoParlamentar,
    nome: identificacao.NomeParlamentar,
    nomeCivil: identificacao.NomeCompletoParlamentar ?? null,
    partido: identificacao.SiglaPartidoParlamentar ?? "—",
    uf: identificacao.UfParlamentar ?? "—",
    fotoUrl: paraHttps(identificacao.UrlFotoParlamentar),
    email: identificacao.EmailParlamentar ?? null,
    emExercicio: true,
    nascimento: basicos?.DataNascimento ?? null,
    municipioNascimento: basicos?.Naturalidade ?? null,
    ufNascimento: basicos?.UfNaturalidade ?? null,
    escolaridade: null,
    telefone: null,
    site: paraHttps(identificacao.UrlPaginaParlamentar),
    gabinete: basicos?.EnderecoParlamentar ?? null,
  }
}

const TIPO_VOTO_SENADO: Record<string, TipoVoto> = {
  SIM: "sim",
  NAO: "nao",
  ABSTENCAO: "abstencao",
  VOTOU: "sim",
}

const normalizarSigla = (sigla: string) =>
  sigla
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .trim()

const traduzirVoto = (sigla: string | null | undefined): TipoVoto => {
  if (!sigla) return "ausente"
  const normalizada = normalizarSigla(sigla)
  if (normalizada.startsWith("PRESIDENTE")) return "presidente"
  return TIPO_VOTO_SENADO[normalizada] ?? "ausente"
}

const votacaoSchemaApi = z.object({
  codigoSessao: z.number(),
  codigoSessaoVotacao: z.number(),
  dataSessao: z.string(),
  descricaoVotacao: z.string().nullish(),
  ementa: z.string().nullish(),
  identificacao: z.string().nullish(),
  sigla: z.string().nullish(),
  resultadoVotacao: z.string().nullish(),
  votacaoSecreta: z.string().nullish(),
  votos: z
    .array(
      z.object({
        codigoParlamentar: z.number(),
        nomeParlamentar: z.string(),
        siglaPartidoParlamentar: z.string().nullish(),
        siglaUFParlamentar: z.string().nullish(),
        siglaVotoParlamentar: z.string().nullish(),
      }),
    )
    .default([]),
})

const listaVotacoesSchema = z.array(votacaoSchemaApi)

const paraVotos = (votacao: z.infer<typeof votacaoSchemaApi>): Voto[] =>
  votacao.votos.map((voto) => ({
    casa: "senado" as const,
    id: String(voto.codigoParlamentar),
    nome: voto.nomeParlamentar,
    partido: voto.siglaPartidoParlamentar ?? "—",
    uf: voto.siglaUFParlamentar ?? "—",
    voto: traduzirVoto(voto.siglaVotoParlamentar),
  }))

const paraVotacao = (votacao: z.infer<typeof votacaoSchemaApi>): Votacao => {
  const votos = paraVotos(votacao)

  return {
    casa: "senado",
    id: idDaVotacao(votacao),
    data: votacao.dataSessao,
    descricao: votacao.descricaoVotacao ?? votacao.identificacao ?? "Votação",
    resumo: votacao.ementa ?? null,
    proposicao: votacao.identificacao
      ? {
          id: null,
          sigla: votacao.identificacao,
          ementa: votacao.ementa ?? null,
        }
      : null,
    aprovada: votacao.resultadoVotacao
      ? votacao.resultadoVotacao.toUpperCase() === "A"
      : null,
    placar: contarPlacar(votos),
  }
}

export const listarVotacoesSenado = async (
  desde: string,
  ate: string,
): Promise<Votacao[]> => {
  const votacoes = await buscarJson(
    `${API}/votacao?dataInicio=${desde}&dataFim=${ate}`,
    listaVotacoesSchema,
    { fonte: FONTE },
  )

  return votacoes
    .map(paraVotacao)
    .sort((a, b) => b.data.localeCompare(a.data))
}

const idDaVotacao = ({
  codigoSessao,
  codigoSessaoVotacao,
}: Pick<
  z.infer<typeof votacaoSchemaApi>,
  "codigoSessao" | "codigoSessaoVotacao"
>) => `${codigoSessao}-${codigoSessaoVotacao}`

export const buscarVotacaoSenado = async (
  id: string,
): Promise<VotacaoDetalhe | null> => {
  const [codigoSessao] = id.split("-")
  if (!codigoSessao) return null

  const votacoes = await buscarJson(
    `${API}/votacao?codigoSessao=${codigoSessao}`,
    listaVotacoesSchema,
    { fonte: FONTE },
  )

  const encontrada = votacoes.find((votacao) => idDaVotacao(votacao) === id)
  if (!encontrada) return null

  return { ...paraVotacao(encontrada), votos: paraVotos(encontrada) }
}

const paraHttps = (url: string | null | undefined) =>
  url ? url.replace("http://", "https://") : null
