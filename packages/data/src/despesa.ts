import { z } from "zod"

import { casaSchema } from "./parlamentar"

export const despesaPorTipoSchema = z.object({
  tipo: z.string(),
  valor: z.number(),
})

export type DespesaPorTipo = z.infer<typeof despesaPorTipoSchema>

export const despesaPorMesSchema = z.object({
  ano: z.number(),
  mes: z.number(),
  valor: z.number(),
})

export type DespesaPorMes = z.infer<typeof despesaPorMesSchema>

export const resumoDespesasSchema = z.object({
  casa: casaSchema,
  id: z.string(),
  ano: z.number(),
  total: z.number(),
  porMes: z.array(despesaPorMesSchema),
  porTipo: z.array(despesaPorTipoSchema),
})

export type ResumoDespesas = z.infer<typeof resumoDespesasSchema>

export const TIPO_DESPESA_CURTO: Record<string, string> = {
  "MANUTENÇÃO DE ESCRITÓRIO DE APOIO À ATIVIDADE PARLAMENTAR": "Escritório",
  "DIVULGAÇÃO DA ATIVIDADE PARLAMENTAR": "Divulgação",
  "COMBUSTÍVEIS E LUBRIFICANTES.": "Combustível",
  "PASSAGEM AÉREA - SIGEPA": "Passagem aérea",
  "PASSAGEM AÉREA - RPA": "Passagem aérea",
  "PASSAGEM AÉREA - REEMBOLSO": "Passagem aérea",
  "SERVIÇOS POSTAIS": "Correios",
  "TELEFONIA": "Telefonia",
  "CONSULTORIAS, PESQUISAS E TRABALHOS TÉCNICOS.": "Consultoria",
  "FORNECIMENTO DE ALIMENTAÇÃO DO PARLAMENTAR": "Alimentação",
  "HOSPEDAGEM ,EXCETO DO PARLAMENTAR NO DISTRITO FEDERAL.": "Hospedagem",
  "LOCAÇÃO OU FRETAMENTO DE VEÍCULOS AUTOMOTORES": "Locação de veículo",
  "LOCAÇÃO OU FRETAMENTO DE AERONAVES": "Locação de aeronave",
  "SERVIÇO DE TÁXI, PEDÁGIO E ESTACIONAMENTO": "Táxi e pedágio",
  "SERVIÇO DE SEGURANÇA PRESTADO POR EMPRESA ESPECIALIZADA.": "Segurança",
  "ASSINATURA DE PUBLICAÇÕES": "Assinaturas",
  "AQUISIÇÃO DE MATERIAL DE ESCRITÓRIO.": "Material de escritório",
}

export const tipoDespesaCurto = (tipo: string) =>
  TIPO_DESPESA_CURTO[tipo] ?? capitalizar(tipo)

const capitalizar = (texto: string) => {
  const limpo = texto.trim().toLocaleLowerCase("pt-BR").replace(/\.$/, "")
  return limpo.charAt(0).toLocaleUpperCase("pt-BR") + limpo.slice(1)
}
