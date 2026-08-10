import { differenceInCalendarDays } from "date-fns"
import { Surface } from "heroui-native"
import { Text, View } from "react-native"

import { formatarDataExtensa } from "@/utils/date-utils"

const PRIMEIRO_TURNO = new Date(2026, 9, 4)

export const ContagemRegressiva = () => {
  const dias = differenceInCalendarDays(PRIMEIRO_TURNO, new Date())

  if (dias < 0) return null

  return (
    <Surface variant="secondary" className="flex-row items-center gap-4 p-4">
      <View className="items-center">
        <Text className="font-title text-3xl text-brand">{dias}</Text>
        <Text className="text-[10px] uppercase text-muted-foreground">
          {dias === 1 ? "dia" : "dias"}
        </Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-foreground">
          1º turno em {formatarDataExtensa(PRIMEIRO_TURNO)}
        </Text>
        <Text className="text-xs text-muted-foreground">
          Antes de votar, veja como quem tenta a reeleição votou nos últimos
          quatro anos.
        </Text>
      </View>
    </Surface>
  )
}
