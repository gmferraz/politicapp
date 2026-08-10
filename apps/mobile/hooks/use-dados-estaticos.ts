import type { Casa, IndiceParlamentar, ParlamentarRef } from "@politicapp/data"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  buscarBenchmarks,
  buscarDespesasEstaticas,
  buscarIndice,
} from "@/services/api/estaticos"
import { chaves, TEMPO } from "@/services/api/query-keys"

export const useIndice = () =>
  useQuery({
    queryKey: chaves.estatico.indice,
    queryFn: buscarIndice,
    staleTime: TEMPO.hora * 6,
  })

export const useDespesasEstaticas = () =>
  useQuery({
    queryKey: chaves.estatico.despesas,
    queryFn: buscarDespesasEstaticas,
    staleTime: TEMPO.hora * 6,
  })

export const useBenchmarks = () =>
  useQuery({
    queryKey: chaves.estatico.benchmarks,
    queryFn: buscarBenchmarks,
    staleTime: TEMPO.dia,
  })

export const useParlamentarDoIndice = (ref: ParlamentarRef | null) => {
  const { data, ...resto } = useIndice()

  const parlamentar = useMemo(() => {
    if (!ref || !data) return undefined
    return data.parlamentares.find(
      (item) => item.casa === ref.casa && item.id === ref.id,
    )
  }, [data, ref])

  return { ...resto, data: parlamentar }
}

export const useBenchmarkDaCasa = (casa: Casa) => {
  const { data, ...resto } = useBenchmarks()

  const benchmark = useMemo(
    () => data?.casas.find((item) => item.casa === casa),
    [data, casa],
  )

  return { ...resto, data: benchmark }
}

export const useResumoDespesas = (ref: ParlamentarRef | null) => {
  const { data, ...resto } = useDespesasEstaticas()

  const resumo = useMemo(() => {
    if (!ref || !data) return undefined
    return data.resumos.find(
      (item) => item.casa === ref.casa && item.id === ref.id,
    )
  }, [data, ref])

  return { ...resto, data: resumo }
}
