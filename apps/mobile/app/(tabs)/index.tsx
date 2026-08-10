import { parseParlamentarKey, type IndiceParlamentar } from "@politicapp/data"
import { FlashList } from "@shopify/flash-list"
import { useRouter } from "expo-router"
import { Button, Surface } from "heroui-native"
import { useMemo } from "react"
import { RefreshControl, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Cabecalho } from "@/components/cabecalho"
import { CartaoParlamentar } from "@/components/cartao-parlamentar"
import { Carregando, EstadoDeErro, EstadoVazio } from "@/components/estados"
import { CartaoVotacao } from "@/features/feed/cartao-votacao"
import { useIndice } from "@/hooks/use-dados-estaticos"
import { useVotacoesRecentes } from "@/hooks/use-votacoes"
import { usePreferencias } from "@/services/preferencias"

export default function InicioScreen() {
  const router = useRouter()
  const uf = usePreferencias((estado) => estado.uf)
  const seguidos = usePreferencias((estado) => estado.seguidos)

  const indice = useIndice()
  const votacoes = useVotacoesRecentes("camara")

  const meusParlamentares = useMemo(() => {
    if (!indice.data) return []

    const refs = seguidos
      .map(parseParlamentarKey)
      .filter((ref): ref is NonNullable<typeof ref> => ref !== null)

    const seguidosNoIndice = refs.flatMap((ref) => {
      const encontrado = indice.data.parlamentares.find(
        (parlamentar) =>
          parlamentar.casa === ref.casa && parlamentar.id === ref.id,
      )
      return encontrado ? [encontrado] : []
    })

    if (seguidosNoIndice.length > 0) return seguidosNoIndice

    return uf
      ? indice.data.parlamentares
          .filter(
            (parlamentar) =>
              parlamentar.uf === uf && parlamentar.casa === "senado",
          )
          .slice(0, 3)
      : []
  }, [indice.data, seguidos, uf])

  if (indice.isPending) return <Carregando rotulo="Carregando o Congresso…" />

  if (indice.isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <EstadoDeErro aoTentarNovamente={() => void indice.refetch()} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlashList
        data={votacoes.data ?? []}
        keyExtractor={(votacao) => votacao.id}
        contentContainerClassName="pb-8"
        refreshControl={
          <RefreshControl
            refreshing={votacoes.isRefetching}
            onRefresh={() => void votacoes.refetch()}
          />
        }
        ListHeaderComponent={
          <View className="gap-4">
            <Cabecalho
              titulo="Início"
              subtitulo={
                uf
                  ? `O que anda acontecendo — e o que os seus de ${uf} fizeram`
                  : "O que anda acontecendo no Congresso"
              }
            />

            <SecaoMeusPoliticos
              parlamentares={meusParlamentares}
              temSeguidos={seguidos.length > 0}
              aoEscolher={() => router.push("/onboarding")}
            />

            <Text className="px-4 pt-2 text-lg font-semibold text-foreground">
              Votações recentes na Câmara
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-4 pb-3">
            <CartaoVotacao votacao={item} />
          </View>
        )}
        ListEmptyComponent={
          votacoes.isPending ? (
            <Carregando />
          ) : votacoes.isError ? (
            <EstadoDeErro aoTentarNovamente={() => void votacoes.refetch()} />
          ) : (
            <EstadoVazio
              icone="calendar-outline"
              titulo="Nenhuma votação recente"
              descricao="O plenário não registrou votações nominais nos últimos dias."
            />
          )
        }
      />
    </SafeAreaView>
  )
}

type SecaoProps = {
  parlamentares: IndiceParlamentar[]
  temSeguidos: boolean
  aoEscolher: () => void
}

const SecaoMeusPoliticos = ({
  parlamentares,
  temSeguidos,
  aoEscolher,
}: SecaoProps) => {
  const router = useRouter()

  if (parlamentares.length === 0) {
    return (
      <View className="px-4">
        <Surface variant="secondary" className="gap-3 p-4">
          <Text className="text-base font-semibold text-foreground">
            Escolha os seus políticos
          </Text>
          <Text className="text-sm text-muted-foreground">
            Diga o seu estado e siga quem você quer acompanhar. O app passa a
            mostrar o que eles votam e quanto gastam.
          </Text>
          <Button size="sm" onPress={aoEscolher}>
            Definir meu estado
          </Button>
        </Surface>
      </View>
    )
  }

  return (
    <View className="gap-3">
      <Text className="px-4 text-lg font-semibold text-foreground">
        {temSeguidos ? "Quem você segue" : "Do seu estado"}
      </Text>
      <View className="gap-2 px-4">
        {parlamentares.map((parlamentar) => (
          <CartaoParlamentar
            key={`${parlamentar.casa}:${parlamentar.id}`}
            parlamentar={parlamentar}
            mostrarCargo
            aoTocar={() =>
              router.push(`/parlamentar/${parlamentar.casa}/${parlamentar.id}`)
            }
          />
        ))}
      </View>
    </View>
  )
}
