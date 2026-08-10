import { Button, Spinner } from "heroui-native"
import { Text, View } from "react-native"

import { Icon, type IconName } from "@/components/icon"
import { useColors } from "@/hooks/use-colors"

export const Carregando = ({ rotulo }: { rotulo?: string }) => (
  <View className="flex-1 items-center justify-center gap-3 p-8">
    <Spinner />
    {rotulo ? (
      <Text className="text-sm text-muted-foreground">{rotulo}</Text>
    ) : null}
  </View>
)

type EstadoVazioProps = {
  icone?: IconName
  titulo: string
  descricao?: string
  acao?: { rotulo: string; aoTocar: () => void }
}

export const EstadoVazio = ({
  icone = "document-text-outline",
  titulo,
  descricao,
  acao,
}: EstadoVazioProps) => {
  const { muted } = useColors()

  return (
    <View className="items-center justify-center gap-3 px-8 py-12">
      <Icon name={icone} size={32} color={muted} />
      <Text className="text-center text-base font-semibold text-foreground">
        {titulo}
      </Text>
      {descricao ? (
        <Text className="text-center text-sm text-muted-foreground">
          {descricao}
        </Text>
      ) : null}
      {acao ? (
        <Button size="sm" variant="secondary" onPress={acao.aoTocar}>
          {acao.rotulo}
        </Button>
      ) : null}
    </View>
  )
}

type ErroProps = {
  titulo?: string
  descricao?: string
  aoTentarNovamente?: () => void
}

export const EstadoDeErro = ({
  titulo = "Não foi possível carregar",
  descricao = "Os dados vêm de APIs públicas do governo, que às vezes ficam fora do ar.",
  aoTentarNovamente,
}: ErroProps) => {
  const { dangerColor } = useColors()

  return (
    <View className="items-center justify-center gap-3 px-8 py-12">
      <Icon name="cloud-offline-outline" size={32} color={dangerColor} />
      <Text className="text-center text-base font-semibold text-foreground">
        {titulo}
      </Text>
      <Text className="text-center text-sm text-muted-foreground">
        {descricao}
      </Text>
      {aoTentarNovamente ? (
        <Button size="sm" variant="secondary" onPress={aoTentarNovamente}>
          Tentar novamente
        </Button>
      ) : null}
    </View>
  )
}
