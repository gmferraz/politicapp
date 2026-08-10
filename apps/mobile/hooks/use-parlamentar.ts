import type { ParlamentarRef } from "@politicapp/data"
import { useQuery } from "@tanstack/react-query"

import { buscarDeputado, listarProposicoesDoDeputado } from "@/services/api/camara"
import { chaves, TEMPO } from "@/services/api/query-keys"
import { buscarSenador } from "@/services/api/senado"

export const useDetalheParlamentar = (ref: ParlamentarRef) =>
  useQuery({
    queryKey: chaves.parlamentar.detalhe(ref),
    queryFn: () =>
      ref.casa === "camara" ? buscarDeputado(ref.id) : buscarSenador(ref.id),
    staleTime: TEMPO.dia,
  })

export const useProposicoesDoParlamentar = (ref: ParlamentarRef) =>
  useQuery({
    queryKey: chaves.parlamentar.proposicoes(ref),
    queryFn: () =>
      ref.casa === "camara" ? listarProposicoesDoDeputado(ref.id) : [],
    staleTime: TEMPO.hora * 12,
    enabled: ref.casa === "camara",
  })
