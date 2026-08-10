import {
  identificadorProposicao,
  type ParlamentarRef,
} from "@politicapp/data"
import { Surface } from "heroui-native"
import { Text, View } from "react-native"

import { useProposicoesDoParlamentar } from "@/hooks/use-parlamentar"

type Props = { referencia: ParlamentarRef }

export const ProposicoesDoParlamentar = ({ referencia }: Props) => {
  const { data } = useProposicoesDoParlamentar(referencia)

  if (!data || data.length === 0) return null

  return (
    <Surface variant="secondary" className="gap-3 p-4">
      <Text className="text-base font-semibold text-foreground">
        Projetos apresentados
      </Text>

      {data.slice(0, 5).map((proposicao) => (
        <View key={proposicao.id} className="gap-1">
          <Text className="text-xs font-semibold text-brand">
            {identificadorProposicao(proposicao)}
          </Text>
          <Text className="text-sm text-foreground" numberOfLines={3}>
            {proposicao.ementa}
          </Text>
        </View>
      ))}
    </Surface>
  )
}
