import type { Votacao } from "@politicapp/data"
import { useRouter } from "expo-router"
import { Chip, Surface } from "heroui-native"
import { Pressable, Text, View } from "react-native"

import { PlacarVotacao } from "@/components/placar-votacao"
import { formatarDataCurta } from "@/utils/date-utils"

type Props = { votacao: Votacao }

export const CartaoVotacao = ({ votacao }: Props) => {
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push(`/votacao/${votacao.casa}/${votacao.id}`)}
    >
      <Surface variant="secondary" className="gap-3 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-muted-foreground">
            {formatarDataCurta(votacao.data)}
          </Text>
          {votacao.aprovada === null ? null : (
            <Chip size="sm" color={votacao.aprovada ? "success" : "danger"}>
              {votacao.aprovada ? "Aprovada" : "Rejeitada"}
            </Chip>
          )}
        </View>

        <Text className="text-sm text-foreground" numberOfLines={3}>
          {votacao.descricao}
        </Text>

        <PlacarVotacao placar={votacao.placar} compacto />
      </Surface>
    </Pressable>
  )
}
