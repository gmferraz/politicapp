import type { Casa, IndiceParlamentar } from "@politicapp/data"
import { FlashList } from "@shopify/flash-list"
import { useRouter } from "expo-router"
import { Button, Chip, Input, TextField } from "heroui-native"
import { useDeferredValue, useMemo, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Cabecalho } from "@/components/cabecalho"
import { CartaoParlamentar } from "@/components/cartao-parlamentar"
import { Carregando, EstadoDeErro, EstadoVazio } from "@/components/estados"
import { useIndice } from "@/hooks/use-dados-estaticos"
import { usePreferencias } from "@/services/preferencias"
import { normalizar } from "@/utils/texto"

type Filtro = "todos" | Casa | "minha-uf"

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "camara", rotulo: "Deputados" },
  { valor: "senado", rotulo: "Senadores" },
  { valor: "minha-uf", rotulo: "Meu estado" },
]

export default function ParlamentaresScreen() {
  const router = useRouter()
  const uf = usePreferencias((estado) => estado.uf)
  const [busca, setBusca] = useState("")
  const [filtro, setFiltro] = useState<Filtro>("todos")
  const buscaAdiada = useDeferredValue(busca)

  const { data, isPending, isError, refetch } = useIndice()

  const resultados = useMemo(() => {
    if (!data) return []

    const termo = normalizar(buscaAdiada.trim())

    return data.parlamentares
      .filter((parlamentar) => combinaComFiltro(parlamentar, filtro, uf))
      .filter(
        (parlamentar) =>
          termo.length === 0 ||
          normalizar(parlamentar.nome).includes(termo) ||
          normalizar(parlamentar.partido).includes(termo),
      )
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
  }, [data, buscaAdiada, filtro, uf])

  if (isPending) return <Carregando rotulo="Carregando parlamentares…" />

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <EstadoDeErro aoTentarNovamente={() => void refetch()} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-start justify-between pr-4">
        <View className="flex-1">
          <Cabecalho
            titulo="Parlamentares"
            subtitulo={`${data.parlamentares.length} em exercício no Congresso`}
          />
        </View>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => router.push("/comparador")}
        >
          Comparar
        </Button>
      </View>

      <View className="px-4 pb-3">
        <TextField>
          <Input
            placeholder="Buscar por nome ou partido"
            value={busca}
            onChangeText={setBusca}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </TextField>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4 pb-3"
      >
        {FILTROS.filter(({ valor }) => valor !== "minha-uf" || uf).map(
          ({ valor, rotulo }) => (
            <Chip
              key={valor}
              size="sm"
              variant={filtro === valor ? "primary" : "secondary"}
              onPress={() => setFiltro(valor)}
            >
              {valor === "minha-uf" && uf ? uf : rotulo}
            </Chip>
          ),
        )}
      </ScrollView>

      <FlashList
        data={resultados}
        keyExtractor={(parlamentar) => `${parlamentar.casa}:${parlamentar.id}`}
        contentContainerClassName="px-4 pb-8"
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View className="pb-2">
            <CartaoParlamentar
              parlamentar={item}
              mostrarCargo={filtro === "todos" || filtro === "minha-uf"}
              aoTocar={() => router.push(`/parlamentar/${item.casa}/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <EstadoVazio
            icone="search-outline"
            titulo="Ninguém encontrado"
            descricao="Tente outro nome ou sigla de partido."
          />
        }
      />
    </SafeAreaView>
  )
}

const combinaComFiltro = (
  parlamentar: IndiceParlamentar,
  filtro: Filtro,
  uf: string | null,
) => {
  if (filtro === "todos") return true
  if (filtro === "minha-uf") return parlamentar.uf === uf
  return parlamentar.casa === filtro
}
