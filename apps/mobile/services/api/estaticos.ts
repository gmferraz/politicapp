import {
  benchmarksSchema,
  despesasEstaticasSchema,
  indiceSchema,
  DATA_VERSION,
  type Benchmarks,
  type DespesasEstaticas,
  type Indice,
} from "@politicapp/data"

import { buscarJson } from "./http"

const BASE =
  process.env.EXPO_PUBLIC_DADOS_URL ??
  "https://gmferraz.github.io/politicapp"

const url = (nome: string) => `${BASE}/${DATA_VERSION}/${nome}.json`

export const buscarIndice = (): Promise<Indice> =>
  buscarJson(url("indice"), indiceSchema, { fonte: "estatico/indice" })

export const buscarDespesasEstaticas = (): Promise<DespesasEstaticas> =>
  buscarJson(url("despesas"), despesasEstaticasSchema, {
    fonte: "estatico/despesas",
  })

export const buscarBenchmarks = (): Promise<Benchmarks> =>
  buscarJson(url("benchmarks"), benchmarksSchema, {
    fonte: "estatico/benchmarks",
  })
