import { UFS } from "@politicapp/data"
import { useRouter } from "expo-router"
import { Button, Chip } from "heroui-native"
import { useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { usePreferencias } from "@/services/preferencias"
import { concluirOnboarding } from "@/utils/storage"

export default function OnboardingScreen() {
  const router = useRouter()
  const ufAtual = usePreferencias((estado) => estado.uf)
  const definirUf = usePreferencias((estado) => estado.definirUf)
  const [escolhida, setEscolhida] = useState(ufAtual)

  const confirmar = () => {
    if (escolhida) definirUf(escolhida)
    concluirOnboarding()
    router.back()
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="gap-2 px-6 pb-4 pt-8">
        <Text className="font-title text-3xl text-foreground">
          Qual é o seu estado?
        </Text>
        <Text className="text-sm text-muted-foreground">
          Você elege 3 senadores e uma bancada de deputados federais. O app usa
          isso para mostrar primeiro quem representa você.
        </Text>
      </View>

      <ScrollView contentContainerClassName="flex-row flex-wrap gap-2 px-6 pb-6">
        {UFS.map(({ sigla, nome }) => (
          <Chip
            key={sigla}
            variant={escolhida === sigla ? "primary" : "secondary"}
            onPress={() => setEscolhida(sigla)}
          >
            {`${sigla} · ${nome}`}
          </Chip>
        ))}
      </ScrollView>

      <View className="gap-3 border-t border-border px-6 py-4">
        <Button isDisabled={!escolhida} onPress={confirmar}>
          Continuar
        </Button>
        <Button variant="ghost" onPress={() => router.back()}>
          Agora não
        </Button>
      </View>
    </SafeAreaView>
  )
}
