import type { Parlamentar } from "@politicapp/data"
import { Image } from "expo-image"
import { Text, View } from "react-native"

import { cn } from "@/utils/cn"
import { iniciais } from "@/utils/formatters"
import { corDoPartido } from "@/utils/party-colors"

type Props = {
  parlamentar: Pick<Parlamentar, "nome" | "fotoUrl" | "partido">
  tamanho?: number
  className?: string
}

export const AvatarParlamentar = ({
  parlamentar,
  tamanho = 48,
  className,
}: Props) => (
  <View
    className={cn("items-center justify-center overflow-hidden bg-surface", className)}
    style={{
      width: tamanho,
      height: tamanho,
      borderRadius: tamanho / 2,
      borderWidth: 2,
      borderColor: corDoPartido(parlamentar.partido),
    }}
  >
    {parlamentar.fotoUrl ? (
      <Image
        source={{ uri: parlamentar.fotoUrl }}
        style={{ width: tamanho, height: tamanho }}
        contentFit="cover"
        transition={150}
      />
    ) : (
      <Text
        className="font-semibold text-muted-foreground"
        style={{ fontSize: tamanho / 3 }}
      >
        {iniciais(parlamentar.nome)}
      </Text>
    )}
  </View>
)
