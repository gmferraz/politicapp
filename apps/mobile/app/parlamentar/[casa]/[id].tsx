import { CARGO_LABEL, casaSchema, type ParlamentarRef } from "@politicapp/data"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Button, Surface } from "heroui-native"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AvatarParlamentar } from "@/components/avatar-parlamentar"
import { Carregando, EstadoDeErro } from "@/components/estados"
import { Icon } from "@/components/icon"
import { GastosDoParlamentar } from "@/features/parlamentar/gastos"
import { ParticipacaoDoParlamentar } from "@/features/parlamentar/participacao"
import { ProposicoesDoParlamentar } from "@/features/parlamentar/proposicoes"
import { useColors } from "@/hooks/use-colors"
import { useDetalheParlamentar } from "@/hooks/use-parlamentar"
import { usePreferencias } from "@/services/preferencias"

export default function ParlamentarScreen() {
  const router = useRouter()
  const { muted, foreground } = useColors()
  const params = useLocalSearchParams<{ casa: string; id: string }>()

  const casa = casaSchema.safeParse(params.casa)

  if (!casa.success || !params.id) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <EstadoDeErro
          titulo="Parlamentar não encontrado"
          descricao="O endereço acessado não corresponde a nenhum parlamentar."
        />
      </SafeAreaView>
    )
  }

  const ref: ParlamentarRef = { casa: casa.data, id: params.id }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <Button size="sm" variant="ghost" isIconOnly onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={foreground} />
        </Button>
        <BotaoSeguir referencia={ref} />
      </View>

      <ConteudoDoParlamentar referencia={ref} corSecundaria={muted} />
    </SafeAreaView>
  )
}

const BotaoSeguir = ({ referencia }: { referencia: ParlamentarRef }) => {
  const seguidos = usePreferencias((estado) => estado.seguidos)
  const alternar = usePreferencias((estado) => estado.alternarSeguido)
  const segue = seguidos.includes(`${referencia.casa}:${referencia.id}`)

  return (
    <Button
      size="sm"
      variant={segue ? "secondary" : "primary"}
      onPress={() => alternar(referencia)}
    >
      {segue ? "Seguindo" : "Seguir"}
    </Button>
  )
}

type ConteudoProps = {
  referencia: ParlamentarRef
  corSecundaria: string
}

const ConteudoDoParlamentar = ({ referencia, corSecundaria }: ConteudoProps) => {
  const { data, isPending, isError, refetch } = useDetalheParlamentar(referencia)

  if (isPending) return <Carregando />
  if (isError || !data) {
    return <EstadoDeErro aoTentarNovamente={() => void refetch()} />
  }

  return (
    <ScrollView contentContainerClassName="gap-6 pb-10">
      <View className="items-center gap-2 px-4">
        <AvatarParlamentar parlamentar={data} tamanho={96} />
        <Text className="text-center font-title text-2xl text-foreground">
          {data.nome}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {CARGO_LABEL[data.casa]} · {data.partido} · {data.uf}
        </Text>
        {data.nomeCivil && data.nomeCivil !== data.nome ? (
          <Text className="text-xs text-muted-foreground">{data.nomeCivil}</Text>
        ) : null}
      </View>

      <View className="gap-4 px-4">
        <GastosDoParlamentar referencia={referencia} />
        <ParticipacaoDoParlamentar referencia={referencia} />
        <ProposicoesDoParlamentar referencia={referencia} />

        <Surface variant="secondary" className="gap-2 p-4">
          <Text className="text-base font-semibold text-foreground">
            Contato e gabinete
          </Text>
          <Detalhe rotulo="E-mail" valor={data.email} cor={corSecundaria} />
          <Detalhe rotulo="Telefone" valor={data.telefone} cor={corSecundaria} />
          <Detalhe rotulo="Gabinete" valor={data.gabinete} cor={corSecundaria} />
          <Detalhe
            rotulo="Naturalidade"
            valor={
              data.municipioNascimento
                ? `${data.municipioNascimento}${data.ufNascimento ? `/${data.ufNascimento}` : ""}`
                : null
            }
            cor={corSecundaria}
          />
        </Surface>
      </View>
    </ScrollView>
  )
}

type DetalheProps = { rotulo: string; valor: string | null; cor: string }

const Detalhe = ({ rotulo, valor }: DetalheProps) => {
  if (!valor) return null

  return (
    <View className="flex-row justify-between gap-4">
      <Text className="text-sm text-muted-foreground">{rotulo}</Text>
      <Text className="flex-1 text-right text-sm text-foreground">{valor}</Text>
    </View>
  )
}
