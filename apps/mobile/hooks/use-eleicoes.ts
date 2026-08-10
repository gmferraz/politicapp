import type { Cargo } from "@politicapp/data"
import { useQuery } from "@tanstack/react-query"

import { TEMPO } from "@/services/api/query-keys"
import { buscarCandidato, listarCandidatos } from "@/services/api/tse"

export const useCandidatos = (uf: string | null, cargo: Cargo) =>
  useQuery({
    queryKey: ["tse", "candidatos", uf, cargo],
    queryFn: () => listarCandidatos(uf as string, cargo),
    enabled: Boolean(uf),
    staleTime: TEMPO.hora * 3,
  })

export const useCandidato = (
  uf: string | null,
  cargo: Cargo,
  id: string | null,
) =>
  useQuery({
    queryKey: ["tse", "candidato", uf, cargo, id],
    queryFn: () => buscarCandidato(uf as string, cargo, id as string),
    enabled: Boolean(uf && id),
    staleTime: TEMPO.hora * 6,
  })
