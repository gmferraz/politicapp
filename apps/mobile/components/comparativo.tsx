import type { Distribuicao } from "@politicapp/data"
import { nivelNaDistribuicao, posicaoNaDistribuicao } from "@politicapp/data"
import { Text, View } from "react-native"

import { useColors } from "@/hooks/use-colors"
import { formatarReaisCompacto, formatarVariacao } from "@/utils/formatters"

type Props = {
  valor: number
  distribuicao: Distribuicao
  rotulo: string
}

export const Comparativo = ({ valor, distribuicao, rotulo }: Props) => {
  const { successColor, warningColor, dangerColor, border } = useColors()
  const desvio = posicaoNaDistribuicao(valor, distribuicao)
  const nivel = nivelNaDistribuicao(valor, distribuicao)
  const cor =
    nivel === "atipico"
      ? dangerColor
      : nivel === "acima"
        ? warningColor
        : successColor

  const maximo = Math.max(valor, distribuicao.p75, distribuicao.mediana) * 1.1
  const larguraValor = maximo === 0 ? 0 : (valor / maximo) * 100
  const posicaoMediana = maximo === 0 ? 0 : (distribuicao.mediana / maximo) * 100

  return (
    <View className="gap-2">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-sm text-muted-foreground">{rotulo}</Text>
        <Text className="text-sm font-semibold" style={{ color: cor }}>
          {formatarVariacao(desvio)}
        </Text>
      </View>

      <View
        className="h-3 overflow-hidden rounded-full bg-surface"
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${rotulo}: ${formatarVariacao(desvio)} da mediana de ${formatarReaisCompacto(distribuicao.mediana)}`}
        accessibilityValue={{ min: 0, max: Math.round(maximo), now: Math.round(valor) }}
      >
        <View
          className="h-full rounded-full"
          style={{ width: `${Math.min(larguraValor, 100)}%`, backgroundColor: cor }}
        />
        <View
          className="absolute h-full"
          style={{
            left: `${Math.min(posicaoMediana, 100)}%`,
            width: 2,
            backgroundColor: border,
          }}
        />
      </View>

      <Text className="text-xs text-muted-foreground">
        Mediana da casa: {formatarReaisCompacto(distribuicao.mediana)} · faixa
        típica {formatarReaisCompacto(distribuicao.p25)} a{" "}
        {formatarReaisCompacto(distribuicao.p75)}
      </Text>
    </View>
  )
}
