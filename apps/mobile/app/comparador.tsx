import {
  nivelNaDistribuicao,
  parlamentarKey,
  posicaoNaDistribuicao,
  type Benchmark,
  type IndiceParlamentar,
} from "@politicapp/data"
import { useRouter } from "expo-router"
import { Button, Chip, Input, Surface, TextField } from "heroui-native"
import { useDeferredValue, useMemo, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AvatarParlamentar } from "@/components/avatar-parlamentar"
import { Carregando, EstadoDeErro } from "@/components/estados"
import { Icon } from "@/components/icon"
import { useColors } from "@/hooks/use-colors"
import { useBenchmarks, useIndice } from "@/hooks/use-dados-estaticos"
import {
  formatarPercentual,
  formatarReaisCompacto,
  formatarVariacao,
} from "@/utils/formatters"
import { normalizar } from "@/utils/texto"

const MAXIMO = 3

export default function ComparadorScreen() {
  const router = useRouter()
  const { foreground } = useColors()
  const [escolhidos, setEscolhidos] = useState<IndiceParlamentar[]>([])
  const [busca, setBusca] = useState("")
  const buscaAdiada = useDeferredValue(busca)

  const indice = useIndice()
  const benchmarks = useBenchmarks()

  const sugestoes = useMemo(() => {
    const termo = normalizar(buscaAdiada.trim())
    if (!indice.data || termo.length < 2) return []

    const jaEscolhidos = new Set(escolhidos.map(parlamentarKey))

    return indice.data.parlamentares
      .filter((parlamentar) => !jaEscolhidos.has(parlamentarKey(parlamentar)))
      .filter((parlamentar) => normalizar(parlamentar.nome).includes(termo))
      .slice(0, 6)
  }, [indice.data, buscaAdiada, escolhidos])

  const adicionar = (parlamentar: IndiceParlamentar) => {
    if (escolhidos.length >= MAXIMO) return
    setEscolhidos((atuais) => [...atuais, parlamentar])
    setBusca("")
  }

  const remover = (parlamentar: IndiceParlamentar) =>
    setEscolhidos((atuais) =>
      atuais.filter(
        (atual) => parlamentarKey(atual) !== parlamentarKey(parlamentar),
      ),
    )

  if (indice.isPending) return <Carregando />
  if (indice.isError) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <EstadoDeErro aoTentarNovamente={() => void indice.refetch()} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-2 px-4 py-2">
        <Button size="sm" variant="ghost" isIconOnly onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={foreground} />
        </Button>
        <Text className="font-title text-xl text-foreground">Comparador</Text>
      </View>

      <ScrollView contentContainerClassName="gap-4 px-4 pb-10">
        {escolhidos.length < MAXIMO ? (
          <View className="gap-2">
            <TextField>
              <Input
                placeholder="Adicionar parlamentar"
                value={busca}
                onChangeText={setBusca}
                autoCorrect={false}
              />
            </TextField>

            {sugestoes.map((parlamentar) => (
              <Chip
                key={parlamentarKey(parlamentar)}
                size="sm"
                variant="secondary"
                onPress={() => adicionar(parlamentar)}
              >
                {`${parlamentar.nome} · ${parlamentar.partido}/${parlamentar.uf}`}
              </Chip>
            ))}
          </View>
        ) : null}

        {escolhidos.length === 0 ? (
          <Surface variant="secondary" className="gap-2 p-4">
            <Text className="text-base font-semibold text-foreground">
              Compare até {MAXIMO} parlamentares
            </Text>
            <Text className="text-sm text-muted-foreground">
              Busque pelo nome para ver gastos e participação lado a lado, sempre
              com a mediana da casa como referência.
            </Text>
          </Surface>
        ) : (
          <View className="flex-row gap-3">
            {escolhidos.map((parlamentar) => (
              <ColunaComparacao
                key={parlamentarKey(parlamentar)}
                parlamentar={parlamentar}
                benchmark={
                  benchmarks.data?.casas.find(
                    (casa) => casa.casa === parlamentar.casa,
                  ) ?? null
                }
                aoRemover={() => remover(parlamentar)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

type ColunaProps = {
  parlamentar: IndiceParlamentar
  benchmark: Benchmark | null
  aoRemover: () => void
}

const ColunaComparacao = ({ parlamentar, benchmark, aoRemover }: ColunaProps) => {
  const { muted, successColor, warningColor, dangerColor } = useColors()

  const gastos = benchmark?.gastos.geral ?? null
  const participacao = benchmark?.participacao.geral ?? null

  const desvio =
    gastos && parlamentar.gastoAno !== null
      ? posicaoNaDistribuicao(parlamentar.gastoAno, gastos)
      : null

  const nivelGasto =
    gastos && parlamentar.gastoAno !== null
      ? nivelNaDistribuicao(parlamentar.gastoAno, gastos)
      : null

  const corGasto =
    nivelGasto === "atipico"
      ? dangerColor
      : nivelGasto === "acima"
        ? warningColor
        : successColor

  const percentual = parlamentar.participacaoPercentual
  const corParticipacao =
    participacao && percentual !== null
      ? percentual >= participacao.mediana
        ? successColor
        : percentual >= participacao.p25
          ? warningColor
          : dangerColor
      : muted

  return (
    <Surface variant="secondary" className="flex-1 items-center gap-2 p-3">
      <Button size="sm" variant="ghost" isIconOnly onPress={aoRemover}>
        <Icon name="close" size={16} color={muted} />
      </Button>

      <AvatarParlamentar parlamentar={parlamentar} tamanho={44} />

      <Text
        className="text-center text-sm font-semibold text-foreground"
        numberOfLines={2}
      >
        {parlamentar.nome}
      </Text>
      <Text className="text-center text-[11px] text-muted-foreground">
        {parlamentar.partido}/{parlamentar.uf}
      </Text>

      <View className="w-full gap-1 border-t border-border pt-2">
        <Text className="text-[11px] text-muted-foreground">Cota no ano</Text>
        <Text className="text-sm font-semibold text-foreground">
          {parlamentar.gastoAno === null
            ? "—"
            : formatarReaisCompacto(parlamentar.gastoAno)}
        </Text>
        {desvio !== null ? (
          <Text className="text-[11px]" style={{ color: corGasto }}>
            {formatarVariacao(desvio)}
          </Text>
        ) : null}
        {gastos ? (
          <Text className="text-[11px] text-muted-foreground">
            mediana {formatarReaisCompacto(gastos.mediana)}
          </Text>
        ) : null}
      </View>

      <View className="w-full gap-1 border-t border-border pt-2">
        <Text className="text-[11px] text-muted-foreground">Participação</Text>
        <Text
          className="text-sm font-semibold"
          style={{ color: percentual === null ? muted : corParticipacao }}
        >
          {percentual === null ? "—" : formatarPercentual(percentual, 0)}
        </Text>
        {participacao ? (
          <Text className="text-[11px] text-muted-foreground">
            mediana {formatarPercentual(participacao.mediana, 0)}
          </Text>
        ) : null}
      </View>
    </Surface>
  )
}
