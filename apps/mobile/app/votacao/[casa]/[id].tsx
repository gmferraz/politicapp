import {
  casaSchema,
  VOTO_LABEL,
  type Casa,
  type TipoVoto,
  type Voto,
} from "@politicapp/data"
import { FlashList } from "@shopify/flash-list"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Button, Chip, Surface } from "heroui-native"
import { useMemo, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Carregando, EstadoDeErro } from "@/components/estados"
import { Icon } from "@/components/icon"
import { PlacarVotacao } from "@/components/placar-votacao"
import { useColors } from "@/hooks/use-colors"
import { useVotacao } from "@/hooks/use-votacoes"
import { formatarDataExtensa } from "@/utils/date-utils"
import { corDoPartido } from "@/utils/party-colors"

export default function VotacaoScreen() {
  const router = useRouter()
  const { foreground } = useColors()
  const params = useLocalSearchParams<{ casa: string; id: string }>()
  const casa = casaSchema.safeParse(params.casa)

  if (!casa.success || !params.id) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <EstadoDeErro titulo="Votação não encontrada" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center px-4 py-2">
        <Button size="sm" variant="ghost" isIconOnly onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={foreground} />
        </Button>
      </View>

      <Conteudo casa={casa.data} id={params.id} />
    </SafeAreaView>
  )
}

type ConteudoProps = { casa: Casa; id: string }

const Conteudo = ({ casa, id }: ConteudoProps) => {
  const { data, isPending, isError, refetch } = useVotacao(casa, id)
  const [filtro, setFiltro] = useState<TipoVoto | "todos">("todos")

  const votosFiltrados = useMemo(() => {
    if (!data) return []
    const ordenados = [...data.votos].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    )
    return filtro === "todos"
      ? ordenados
      : ordenados.filter((voto) => voto.voto === filtro)
  }, [data, filtro])

  if (isPending) return <Carregando />
  if (isError || !data) {
    return <EstadoDeErro aoTentarNovamente={() => void refetch()} />
  }

  const filtrosDisponiveis = ["todos", "sim", "nao", "abstencao", "ausente"] as const

  return (
    <FlashList
      data={votosFiltrados}
      keyExtractor={(voto) => `${voto.casa}:${voto.id}`}
      contentContainerClassName="px-4 pb-10"
      ListHeaderComponent={
        <View className="gap-4 pb-4">
          <Text className="text-xs text-muted-foreground">
            {formatarDataExtensa(data.data)}
          </Text>

          <Text className="font-title text-2xl text-foreground">
            {data.descricao}
          </Text>

          {data.resumo ? (
            <Text className="text-sm text-foreground-secondary">
              {data.resumo}
            </Text>
          ) : null}

          {data.aprovada === null ? null : (
            <View className="flex-row">
              <Chip size="sm" color={data.aprovada ? "success" : "danger"}>
                {data.aprovada ? "Aprovada" : "Rejeitada"}
              </Chip>
            </View>
          )}

          <Surface variant="secondary" className="gap-3 p-4">
            <PlacarVotacao placar={data.placar} />
          </Surface>

          {data.votos.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {filtrosDisponiveis.map((opcao) => (
                <Chip
                  key={opcao}
                  size="sm"
                  variant={filtro === opcao ? "primary" : "secondary"}
                  onPress={() => setFiltro(opcao)}
                >
                  {opcao === "todos" ? "Todos" : VOTO_LABEL[opcao]}
                </Chip>
              ))}
            </ScrollView>
          ) : null}
        </View>
      }
      renderItem={({ item }) => <LinhaDeVoto voto={item} />}
      ListEmptyComponent={
        <Text className="py-8 text-center text-sm text-muted-foreground">
          {data.votos.length === 0
            ? "Esta votação não teve registro de votos individuais."
            : "Ninguém votou dessa forma."}
        </Text>
      }
    />
  )
}

const LinhaDeVoto = ({ voto }: { voto: Voto }) => {
  const { successColor, dangerColor, muted } = useColors()

  const cor =
    voto.voto === "sim"
      ? successColor
      : voto.voto === "nao"
        ? dangerColor
        : muted

  return (
    <View className="flex-row items-center gap-3 border-b border-border py-3">
      <View
        className="h-8 w-1 rounded-full"
        style={{ backgroundColor: corDoPartido(voto.partido) }}
      />
      <View className="flex-1">
        <Text className="text-sm text-foreground" numberOfLines={1}>
          {voto.nome}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {voto.partido} · {voto.uf}
        </Text>
      </View>
      <Text className="text-sm font-semibold" style={{ color: cor }}>
        {VOTO_LABEL[voto.voto]}
      </Text>
    </View>
  )
}
