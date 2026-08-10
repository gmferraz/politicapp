import type { Candidato, SituacaoCandidatura } from "@politicapp/data"
import { Chip, Surface } from "heroui-native"
import { Pressable, Text, View } from "react-native"

import { Icon } from "@/components/icon"
import { useColors } from "@/hooks/use-colors"
import { formatarReaisCompacto } from "@/utils/formatters"
import { corDoPartido } from "@/utils/party-colors"

type Props = {
  candidato: Candidato
  aoTocar: () => void
}

const CHIP_SITUACAO: Record<
  SituacaoCandidatura,
  { rotulo: string; cor: "success" | "danger" | "warning" | "default" }
> = {
  deferido: { rotulo: "Deferido", cor: "success" },
  indeferido: { rotulo: "Indeferido", cor: "danger" },
  pendente: { rotulo: "Em análise", cor: "warning" },
  renuncia: { rotulo: "Renunciou", cor: "default" },
  outro: { rotulo: "Sem informação", cor: "default" },
}

export const CartaoCandidato = ({ candidato, aoTocar }: Props) => {
  const { muted } = useColors()
  const situacao = CHIP_SITUACAO[candidato.situacao]

  return (
    <Pressable onPress={aoTocar}>
      <Surface variant="secondary" className="flex-row items-center gap-3 p-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${corDoPartido(candidato.partido)}20` }}
        >
          <Text
            className="font-title text-base"
            style={{ color: corDoPartido(candidato.partido) }}
          >
            {candidato.numero}
          </Text>
        </View>

        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
            {candidato.nomeUrna}
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {candidato.partido}
            {candidato.coligacao ? ` · ${candidato.coligacao}` : ""}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-2">
            <Chip size="sm" color={situacao.cor}>
              {situacao.rotulo}
            </Chip>
            {candidato.reeleicao ? (
              <Chip size="sm" variant="secondary">
                Reeleição
              </Chip>
            ) : null}
            {candidato.totalBens ? (
              <Text className="text-xs text-muted-foreground">
                {formatarReaisCompacto(candidato.totalBens)} em bens
              </Text>
            ) : null}
          </View>
        </View>

        <Icon name="chevron-forward" size={18} color={muted} />
      </Surface>
    </Pressable>
  )
}
