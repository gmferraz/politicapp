import { format, formatDistanceToNowStrict, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

const paraData = (valor: string | Date) =>
  typeof valor === "string" ? parseISO(valor) : valor

export const formatarData = (valor: string | Date) =>
  format(paraData(valor), "dd/MM/yyyy", { locale: ptBR })

export const formatarDataExtensa = (valor: string | Date) =>
  format(paraData(valor), "d 'de' MMMM 'de' yyyy", { locale: ptBR })

export const formatarDataCurta = (valor: string | Date) =>
  format(paraData(valor), "d 'de' MMM", { locale: ptBR })

export const formatarMesAno = (ano: number, mes: number) =>
  format(new Date(ano, mes - 1, 1), "MMM", { locale: ptBR })

export const tempoRelativo = (valor: string | Date) =>
  formatDistanceToNowStrict(paraData(valor), { locale: ptBR, addSuffix: true })
