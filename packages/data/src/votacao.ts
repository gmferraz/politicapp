import { z } from "zod"

import { casaSchema, parlamentarRefSchema } from "./parlamentar"

export const tipoVotoSchema = z.enum([
  "sim",
  "nao",
  "abstencao",
  "obstrucao",
  "ausente",
  "presidente",
])

export type TipoVoto = z.infer<typeof tipoVotoSchema>

export const VOTO_LABEL: Record<TipoVoto, string> = {
  sim: "Sim",
  nao: "Não",
  abstencao: "Abstenção",
  obstrucao: "Obstrução",
  ausente: "Não votou",
  presidente: "Presidiu a sessão",
}

export const votacaoSchema = z.object({
  casa: casaSchema,
  id: z.string(),
  data: z.string(),
  descricao: z.string(),
  resumo: z.string().nullable(),
  proposicao: z
    .object({
      id: z.string().nullable(),
      sigla: z.string(),
      ementa: z.string().nullable(),
    })
    .nullable(),
  aprovada: z.boolean().nullable(),
  placar: z.object({
    sim: z.number(),
    nao: z.number(),
    abstencao: z.number(),
    outros: z.number(),
  }),
})

export type Votacao = z.infer<typeof votacaoSchema>

export const votoSchema = parlamentarRefSchema.extend({
  nome: z.string(),
  partido: z.string(),
  uf: z.string(),
  voto: tipoVotoSchema,
})

export type Voto = z.infer<typeof votoSchema>

export const votacaoDetalheSchema = votacaoSchema.extend({
  votos: z.array(votoSchema),
})

export type VotacaoDetalhe = z.infer<typeof votacaoDetalheSchema>

export const placarVazio: Votacao["placar"] = {
  sim: 0,
  nao: 0,
  abstencao: 0,
  outros: 0,
}

export const contarPlacar = (votos: Voto[]): Votacao["placar"] =>
  votos.reduce<Votacao["placar"]>(
    (placar, { voto }) => ({
      ...placar,
      sim: placar.sim + (voto === "sim" ? 1 : 0),
      nao: placar.nao + (voto === "nao" ? 1 : 0),
      abstencao: placar.abstencao + (voto === "abstencao" ? 1 : 0),
      outros:
        placar.outros +
        (voto === "sim" || voto === "nao" || voto === "abstencao" ? 0 : 1),
    }),
    placarVazio,
  )
