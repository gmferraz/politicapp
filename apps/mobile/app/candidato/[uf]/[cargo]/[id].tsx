import { cargoSchema, CARGO_ELEICAO_LABEL } from "@politicapp/data"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Button, Chip, Surface } from "heroui-native"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Carregando, EstadoDeErro } from "@/components/estados"
import { Icon } from "@/components/icon"
import { useColors } from "@/hooks/use-colors"
import { useCandidato } from "@/hooks/use-eleicoes"
import { formatarData } from "@/utils/date-utils"
import { formatarReais } from "@/utils/formatters"
import { corDoPartido } from "@/utils/party-colors"

export default function CandidatoScreen() {
  const router = useRouter()
  const { foreground } = useColors()
  const params = useLocalSearchParams<{
    uf: string
    cargo: string
    id: string
  }>()

  const cargo = cargoSchema.safeParse(params.cargo)

  const { data, isPending, isError, refetch } = useCandidato(
    params.uf ?? null,
    cargo.success ? cargo.data : "deputado-federal",
    params.id ?? null,
  )

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center px-4 py-2">
        <Button size="sm" variant="ghost" isIconOnly onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={foreground} />
        </Button>
      </View>

      {!cargo.success ? (
        <EstadoDeErro titulo="Candidatura não encontrada" />
      ) : isPending ? (
        <Carregando />
      ) : isError || !data ? (
        <EstadoDeErro aoTentarNovamente={() => void refetch()} />
      ) : (
        <ScrollView contentContainerClassName="gap-6 px-4 pb-10">
          <View className="items-center gap-2">
            {data.fotoUrl ? (
              <Image
                source={{ uri: data.fotoUrl }}
                style={{ width: 112, height: 112, borderRadius: 56 }}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View
                className="h-28 w-28 items-center justify-center rounded-full"
                style={{ backgroundColor: `${corDoPartido(data.partido)}20` }}
              >
                <Text
                  className="font-title text-3xl"
                  style={{ color: corDoPartido(data.partido) }}
                >
                  {data.numero}
                </Text>
              </View>
            )}

            <Text className="text-center font-title text-2xl text-foreground">
              {data.nomeUrna}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {CARGO_ELEICAO_LABEL[data.cargo]} · {data.partido} · {data.uf}
            </Text>
            {data.reeleicao ? <Chip size="sm">Tenta a reeleição</Chip> : null}
          </View>

          <Surface variant="secondary" className="gap-2 p-4">
            <Text className="text-base font-semibold text-foreground">
              Quem é
            </Text>
            <Linha rotulo="Nome completo" valor={data.nomeCompleto} />
            <Linha
              rotulo="Nascimento"
              valor={data.nascimento ? formatarData(data.nascimento) : null}
            />
            <Linha rotulo="Ocupação" valor={data.ocupacao} />
            <Linha rotulo="Escolaridade" valor={data.escolaridade} />
            <Linha rotulo="Coligação" valor={data.coligacao} />
          </Surface>

          {data.bens.length > 0 ? (
            <Surface variant="secondary" className="gap-3 p-4">
              <View className="gap-1">
                <Text className="text-base font-semibold text-foreground">
                  Bens declarados
                </Text>
                <Text className="font-title text-2xl text-foreground">
                  {formatarReais(data.totalBens ?? 0)}
                </Text>
              </View>

              {data.bens.map((bem, indice) => (
                <View
                  key={`${bem.descricao}-${indice}`}
                  className="flex-row justify-between gap-4 border-t border-border pt-2"
                >
                  <View className="flex-1">
                    <Text className="text-sm text-foreground" numberOfLines={2}>
                      {bem.descricao}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {bem.tipo}
                    </Text>
                  </View>
                  <Text className="text-sm text-foreground">
                    {formatarReais(bem.valor)}
                  </Text>
                </View>
              ))}
            </Surface>
          ) : null}

          <Text className="text-center text-xs text-muted-foreground">
            Dados do DivulgaCandContas (TSE), atualizados ao longo do registro de
            candidaturas.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const Linha = ({ rotulo, valor }: { rotulo: string; valor: string | null }) => {
  if (!valor) return null

  return (
    <View className="flex-row justify-between gap-4">
      <Text className="text-sm text-muted-foreground">{rotulo}</Text>
      <Text className="flex-1 text-right text-sm text-foreground">{valor}</Text>
    </View>
  )
}
