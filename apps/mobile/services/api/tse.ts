import {
  CARGO_CODIGO_TSE,
  type Cargo,
  type Candidato,
  type CandidatoDetalhe,
  type SituacaoCandidatura,
} from "@politicapp/data"
import { z } from "zod"

import { buscarJson } from "./http"

const API = "https://divulgacandcontas.tse.jus.br/divulga/rest/v1"
const FONTE = "tse/divulgacand"

export const ELEICAO_2026 = { ano: 2026, id: 20322002026 } as const

const partidoSchema = z
  .object({ sigla: z.string().nullish() })
  .nullish()

const candidatoSchemaApi = z.object({
  id: z.number(),
  nomeUrna: z.string(),
  nomeCompleto: z.string().nullish(),
  numero: z.number().nullish(),
  descricaoSituacao: z.string().nullish(),
  nomeColigacao: z.string().nullish(),
  ufCandidatura: z.string().nullish(),
  totalDeBens: z.number().nullish(),
  st_REELEICAO: z.boolean().nullish(),
  partido: partidoSchema,
})

const listaSchema = z.object({
  candidatos: z.array(candidatoSchemaApi).nullish(),
})

const SITUACOES: { padrao: RegExp; situacao: SituacaoCandidatura }[] = [
  { padrao: /deferido com recurso|^deferido/i, situacao: "deferido" },
  { padrao: /indeferido|cassad|inapto/i, situacao: "indeferido" },
  { padrao: /aguardando|pendente|análise/i, situacao: "pendente" },
  { padrao: /renúncia|renuncia/i, situacao: "renuncia" },
]

const traduzirSituacao = (descricao: string | null | undefined): SituacaoCandidatura => {
  if (!descricao) return "outro"
  return (
    SITUACOES.find(({ padrao }) => padrao.test(descricao))?.situacao ?? "outro"
  )
}

const paraCandidato = (
  bruto: z.infer<typeof candidatoSchemaApi>,
  cargo: Cargo,
  uf: string,
): Candidato => ({
  id: String(bruto.id),
  nomeUrna: bruto.nomeUrna,
  nomeCompleto: bruto.nomeCompleto ?? bruto.nomeUrna,
  numero: bruto.numero ? String(bruto.numero) : "—",
  cargo,
  uf: bruto.ufCandidatura ?? uf,
  partido: bruto.partido?.sigla ?? "—",
  coligacao: bruto.nomeColigacao ?? null,
  fotoUrl: null,
  situacao: traduzirSituacao(bruto.descricaoSituacao),
  totalBens: bruto.totalDeBens ?? null,
  reeleicao: bruto.st_REELEICAO ?? false,
})

export const listarCandidatos = async (
  uf: string,
  cargo: Cargo,
): Promise<Candidato[]> => {
  const { ano, id } = ELEICAO_2026
  const codigo = CARGO_CODIGO_TSE[cargo]

  const resposta = await buscarJson(
    `${API}/candidatura/listar/${ano}/${uf}/${id}/${codigo}/candidatos`,
    listaSchema,
    { fonte: FONTE },
  )

  return (resposta.candidatos ?? [])
    .map((bruto) => paraCandidato(bruto, cargo, uf))
    .sort((a, b) => a.nomeUrna.localeCompare(b.nomeUrna, "pt-BR"))
}

const bemSchema = z.object({
  descricao: z.string().nullish(),
  descricaoDeTipoDeBem: z.string().nullish(),
  valor: z.number().nullish(),
})

const detalheSchema = candidatoSchemaApi.extend({
  dataDeNascimento: z.string().nullish(),
  ocupacao: z.string().nullish(),
  grauInstrucao: z.string().nullish(),
  fotoUrl: z.string().nullish(),
  bens: z.array(bemSchema).nullish(),
})

export const buscarCandidato = async (
  uf: string,
  cargo: Cargo,
  idCandidato: string,
): Promise<CandidatoDetalhe> => {
  const { ano, id } = ELEICAO_2026

  const bruto = await buscarJson(
    `${API}/candidatura/buscar/${ano}/${uf}/${id}/candidato/${idCandidato}`,
    detalheSchema,
    { fonte: FONTE },
  )

  return {
    ...paraCandidato(bruto, cargo, uf),
    fotoUrl: bruto.fotoUrl ?? null,
    nascimento: bruto.dataDeNascimento ?? null,
    ocupacao: bruto.ocupacao ?? null,
    escolaridade: bruto.grauInstrucao ?? null,
    propostaUrl: null,
    bens: (bruto.bens ?? []).flatMap((bem) =>
      bem.valor
        ? [
            {
              descricao: bem.descricao ?? "Bem declarado",
              tipo: bem.descricaoDeTipoDeBem ?? "Outros",
              valor: bem.valor,
            },
          ]
        : [],
    ),
  }
}
