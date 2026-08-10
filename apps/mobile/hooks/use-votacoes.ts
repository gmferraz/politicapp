import type { Casa } from "@politicapp/data"
import { useQuery } from "@tanstack/react-query"
import { subDays } from "date-fns"

import { buscarVotacao, listarVotacoesRecentes } from "@/services/api/camara"
import { chaves, TEMPO } from "@/services/api/query-keys"
import {
  buscarVotacaoSenado,
  listarVotacoesSenado,
} from "@/services/api/senado"

const DIAS_DE_FEED = 45

const iso = (data: Date) => data.toISOString().slice(0, 10)

export const useVotacoesRecentes = (casa: Casa) =>
  useQuery({
    queryKey: chaves.votacoes.recentes(casa),
    queryFn: () => {
      const hoje = new Date()
      const desde = iso(subDays(hoje, DIAS_DE_FEED))
      const ate = iso(hoje)

      return casa === "camara"
        ? listarVotacoesRecentes(desde, ate)
        : listarVotacoesSenado(desde, ate)
    },
    staleTime: TEMPO.minuto * 15,
  })

export const useVotacao = (casa: Casa, id: string) =>
  useQuery({
    queryKey: chaves.votacoes.detalhe(casa, id),
    queryFn: () =>
      casa === "camara" ? buscarVotacao(id) : buscarVotacaoSenado(id),
    staleTime: TEMPO.hora * 6,
  })
