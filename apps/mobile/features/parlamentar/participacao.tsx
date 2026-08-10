import type { ParlamentarRef } from "@politicapp/data"
import { Surface } from "heroui-native"
import { Text, View } from "react-native"

import { useColors } from "@/hooks/use-colors"
import {
  useBenchmarkDaCasa,
  useParlamentarDoIndice,
} from "@/hooks/use-dados-estaticos"
import { formatarNumero, formatarPercentual } from "@/utils/formatters"

type Props = { referencia: ParlamentarRef }

export const ParticipacaoDoParlamentar = ({ referencia }: Props) => {
  const { successColor, warningColor, dangerColor } = useColors()
  const parlamentar = useParlamentarDoIndice(referencia)
  const benchmark = useBenchmarkDaCasa(referencia.casa)

  const percentual = parlamentar.data?.participacaoPercentual
  const participadas = parlamentar.data?.votacoesParticipadas

  if (percentual === null || percentual === undefined) return null

  const distribuicao = benchmark.data?.participacao.geral ?? null
  const mediana = distribuicao?.mediana ?? null

  // Posição na distribuição da casa; sem benchmark, faixas fixas de fallback.
  const cor = distribuicao
    ? percentual >= distribuicao.mediana
      ? successColor
      : percentual >= distribuicao.p25
        ? warningColor
        : dangerColor
    : percentual >= 80
      ? successColor
      : percentual >= 60
        ? warningColor
        : dangerColor

  return (
    <Surface variant="secondary" className="gap-3 p-4">
      <Text className="text-base font-semibold text-foreground">
        Participação em votações
      </Text>

      <View className="flex-row items-baseline gap-2">
        <Text className="font-title text-3xl" style={{ color: cor }}>
          {formatarPercentual(percentual, 0)}
        </Text>
        {benchmark.data ? (
          <Text className="text-sm text-muted-foreground">
            de {formatarNumero(benchmark.data.votacoesNominais)} votações
            nominais
          </Text>
        ) : null}
      </View>

      <View
        className="h-2 overflow-hidden rounded-full bg-surface"
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`Participação em votações: ${formatarPercentual(percentual, 0)}${mediana !== null ? `, mediana da casa ${formatarPercentual(mediana, 0)}` : ""}`}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(percentual) }}
      >
        <View
          className="h-full rounded-full"
          style={{ width: `${Math.min(percentual, 100)}%`, backgroundColor: cor }}
        />
      </View>

      <Text className="text-xs text-muted-foreground">
        {participadas !== null && participadas !== undefined
          ? `Registrou voto em ${formatarNumero(participadas)} votações. `
          : ""}
        {mediana !== null
          ? `A mediana da casa é ${formatarPercentual(mediana, 0)}.`
          : ""}
      </Text>

      <Text className="text-[11px] text-muted-foreground">
        Conta apenas votações nominais, em que o voto de cada parlamentar fica
        registrado. Não é a mesma coisa que presença em sessões.
      </Text>
    </Surface>
  )
}
