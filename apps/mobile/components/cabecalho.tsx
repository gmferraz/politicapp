import { Text, View } from "react-native"

type Props = {
  titulo: string
  subtitulo?: string
}

export const Cabecalho = ({ titulo, subtitulo }: Props) => (
  <View className="gap-1 px-4 pb-4 pt-2">
    <Text className="font-title text-3xl text-foreground">{titulo}</Text>
    {subtitulo ? (
      <Text className="text-sm text-muted-foreground">{subtitulo}</Text>
    ) : null}
  </View>
)
