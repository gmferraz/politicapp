import { CARGO_ELEICAO_LABEL, type Cargo } from "@politicapp/data"
import { FlashList } from "@shopify/flash-list"
import { useRouter } from "expo-router"
import { Button, Chip, Surface } from "heroui-native"
import { useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Cabecalho } from "@/components/cabecalho"
import { Carregando, EstadoDeErro, EstadoVazio } from "@/components/estados"
import { CartaoCandidato } from "@/features/eleicoes/cartao-candidato"
import { ContagemRegressiva } from "@/features/eleicoes/contagem-regressiva"
import { useCandidatos } from "@/hooks/use-eleicoes"
import { usePreferencias } from "@/services/preferencias"

const CARGOS: Cargo[] = ["senador", "deputado-federal", "governador", "presidente"]

export default function EleicoesScreen() {
  const router = useRouter()
  const uf = usePreferencias((estado) => estado.uf)
  const [cargo, setCargo] = useState<Cargo>("senador")

  const { data, isPending, isError, refetch, isRefetching } = useCandidatos(
    uf,
    cargo,
  )

  if (!uf) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <Cabecalho titulo="Eleições 2026" />
        <View className="px-4">
          <Surface variant="secondary" className="gap-3 p-4">
            <Text className="text-base font-semibold text-foreground">
              Defina seu estado
            </Text>
            <Text className="text-sm text-muted-foreground">
              As candidaturas a senador, deputado federal e governador são por
              estado. Escolha o seu para ver quem está concorrendo.
            </Text>
            <Button size="sm" onPress={() => router.push("/onboarding")}>
              Escolher estado
            </Button>
          </Surface>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlashList
        data={data ?? []}
        keyExtractor={(candidato) => candidato.id}
        contentContainerClassName="px-4 pb-8"
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        ListHeaderComponent={
          <View className="gap-4">
            <Cabecalho
              titulo="Eleições 2026"
              subtitulo={`Candidaturas registradas em ${uf}`}
            />

            <ContagemRegressiva />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pb-2"
            >
              {CARGOS.map((opcao) => (
                <Chip
                  key={opcao}
                  size="sm"
                  variant={cargo === opcao ? "primary" : "secondary"}
                  onPress={() => setCargo(opcao)}
                >
                  {CARGO_ELEICAO_LABEL[opcao]}
                </Chip>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <View className="pb-2">
            <CartaoCandidato
              candidato={item}
              aoTocar={() =>
                router.push(`/candidato/${item.uf}/${item.cargo}/${item.id}`)
              }
            />
          </View>
        )}
        ListEmptyComponent={
          isPending ? (
            <Carregando rotulo="Consultando o TSE…" />
          ) : isError ? (
            <EstadoDeErro
              descricao="A base de candidaturas do TSE é atualizada de hora em hora e às vezes fica indisponível."
              aoTentarNovamente={() => void refetch()}
            />
          ) : (
            <EstadoVazio
              icone="hourglass-outline"
              titulo="Nenhuma candidatura ainda"
              descricao="O registro de candidaturas segue em andamento. Volte em alguns dias."
            />
          )
        }
      />
    </SafeAreaView>
  )
}
