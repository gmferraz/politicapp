import { z } from "zod"

import { casaSchema } from "./parlamentar"

export const proposicaoSchema = z.object({
  casa: casaSchema,
  id: z.string(),
  sigla: z.string(),
  numero: z.number(),
  ano: z.number(),
  ementa: z.string(),
  resumo: z.string().nullable(),
  apresentadaEm: z.string().nullable(),
  situacao: z.string().nullable(),
  temas: z.array(z.string()),
})

export type Proposicao = z.infer<typeof proposicaoSchema>

export const identificadorProposicao = ({
  sigla,
  numero,
  ano,
}: Pick<Proposicao, "sigla" | "numero" | "ano">) => `${sigla} ${numero}/${ano}`
