import {
  tipoDespesaCurto,
  type DespesaPorMes,
  type ParlamentarRef,
} from "@politicapp/data"
import { Surface } from "heroui-native"
import { Text, View } from "react-native"

import { Comparativo } from "@/components/comparativo"
import { useColors } from "@/hooks/use-colors"
import {
  useBenchmarkDaCasa,
  useResumoDespesas,
} from "@/hooks/use-dados-estaticos"
import { formatarMesAno } from "@/utils/date-utils"
import { formatarReais, formatarReaisCompacto } from "@/utils/formatters"

type Props = { referencia: ParlamentarRef }

export const GastosDoParlamentar = ({ referencia }: Props) => {
  const resumo = useResumoDespesas(referencia)
  const benchmark = useBenchmarkDaCasa(referencia.casa)

  if (!resumo.data) {
    return (
      <Surface variant="secondary" className="gap-2 p-4">
        <Text className="text-base font-semibold text-foreground">
          Cota parlamentar
        </Text>
        <Text className="text-sm text-muted-foreground">
          Nenhum gasto registrado neste ano até agora.
        </Text>
      </Surface>
    )
  }

  const { total, porMes, porTipo, ano } = resumo.data

  return (
    <Surface variant="secondary" className="gap-4 p-4">
      <View className="gap-1">
        <Text className="text-base font-semibold text-foreground">
          Cota parlamentar em {ano}
        </Text>
        <Text className="font-title text-3xl text-foreground">
          {formatarReais(total)}
        </Text>
      </View>

      {benchmark.data ? (
        <Comparativo
          valor={total}
          distribuicao={benchmark.data.gastos.geral}
          rotulo="Comparado à mediana da casa"
        />
      ) : null}

      <GraficoMensal porMes={porMes} />

      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground">
          Onde foi gasto
        </Text>
        {porTipo.slice(0, 5).map((item) => (
          <View key={item.tipo} className="flex-row justify-between gap-4">
            <Text
              className="flex-1 text-sm text-muted-foreground"
              numberOfLines={1}
            >
              {tipoDespesaCurto(item.tipo)}
            </Text>
            <Text className="text-sm text-foreground">
              {formatarReaisCompacto(item.valor)}
            </Text>
          </View>
        ))}
      </View>
    </Surface>
  )
}

type GraficoProps = {
  porMes: DespesaPorMes[]
}

const GraficoMensal = ({ porMes }: GraficoProps) => {
  const { brandColor } = useColors()

  if (porMes.length === 0) return null

  const maximo = Math.max(...porMes.map((item) => item.valor))

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-foreground">Mês a mês</Text>
      <View
        className="h-24 flex-row items-end gap-1.5"
        accessible
        accessibilityLabel={`Gastos mês a mês: ${porMes
          .map(
            (item) =>
              `${formatarMesAno(item.ano, item.mes)} ${formatarReaisCompacto(item.valor)}`,
          )
          .join(", ")}`}
      >
        {porMes.map((item) => (
          <View key={`${item.ano}-${item.mes}`} className="flex-1 items-center gap-1">
            <View
              className="w-full rounded-t"
              style={{
                height: maximo === 0 ? 2 : Math.max((item.valor / maximo) * 72, 2),
                backgroundColor: brandColor,
              }}
            />
            <Text className="text-[10px] text-muted-foreground">
              {formatarMesAno(item.ano, item.mes).slice(0, 3)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}
