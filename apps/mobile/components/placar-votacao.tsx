import type { Votacao } from "@politicapp/data"
import { Text, View } from "react-native"

import { useColors } from "@/hooks/use-colors"
import { formatarNumero } from "@/utils/formatters"

type Props = {
  placar: Votacao["placar"]
  compacto?: boolean
}

export const PlacarVotacao = ({ placar, compacto = false }: Props) => {
  const { successColor, dangerColor, muted } = useColors()
  const total = placar.sim + placar.nao + placar.abstencao + placar.outros

  if (total === 0) {
    return (
      <Text className="text-xs text-muted-foreground">
        Votos individuais não disponíveis
      </Text>
    )
  }

  const fatias = [
    { valor: placar.sim, cor: successColor, rotulo: "Sim" },
    { valor: placar.nao, cor: dangerColor, rotulo: "Não" },
    { valor: placar.abstencao + placar.outros, cor: muted, rotulo: "Outros" },
  ].filter((fatia) => fatia.valor > 0)

  const resumo = fatias
    .map((fatia) => `${fatia.rotulo} ${formatarNumero(fatia.valor)}`)
    .join(", ")

  return (
    <View className="gap-2">
      <View
        className="h-2 flex-row overflow-hidden rounded-full bg-surface"
        accessible
        accessibilityLabel={`Placar da votação: ${resumo}`}
      >
        {fatias.map((fatia) => (
          <View
            key={fatia.rotulo}
            style={{
              flex: fatia.valor,
              backgroundColor: fatia.cor,
            }}
          />
        ))}
      </View>

      {compacto ? null : (
        <View className="flex-row gap-4">
          {fatias.map((fatia) => (
            <View key={fatia.rotulo} className="flex-row items-center gap-1.5">
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: fatia.cor }}
              />
              <Text className="text-xs text-muted-foreground">
                {fatia.rotulo} {formatarNumero(fatia.valor)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
