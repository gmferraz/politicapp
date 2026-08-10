import { UFS } from "@politicapp/data"
import * as WebBrowser from "expo-web-browser"
import { Chip, Surface } from "heroui-native"
import { useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Uniwind } from "uniwind"

import { Cabecalho } from "@/components/cabecalho"
import { Icon } from "@/components/icon"
import { useColors } from "@/hooks/use-colors"
import { usePreferencias } from "@/services/preferencias"
import { guardarTema, lerTema, type TemaGuardado } from "@/utils/storage"

const TEMAS: { valor: TemaGuardado; rotulo: string }[] = [
  { valor: "system", rotulo: "Sistema" },
  { valor: "light", rotulo: "Claro" },
  { valor: "dark", rotulo: "Escuro" },
]

const FONTES = [
  {
    nome: "Câmara dos Deputados",
    url: "https://dadosabertos.camara.leg.br/",
  },
  {
    nome: "Senado Federal",
    url: "https://www12.senado.leg.br/dados-abertos",
  },
  {
    nome: "Tribunal Superior Eleitoral",
    url: "https://dadosabertos.tse.jus.br/",
  },
]

export default function AjustesScreen() {
  const { muted } = useColors()
  const uf = usePreferencias((estado) => estado.uf)
  const definirUf = usePreferencias((estado) => estado.definirUf)
  const seguidos = usePreferencias((estado) => estado.seguidos)
  const [tema, setTema] = useState<TemaGuardado>(lerTema() ?? "system")

  const trocarTema = (novo: TemaGuardado) => {
    setTema(novo)
    guardarTema(novo)
    Uniwind.setTheme(novo)
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="pb-10">
        <Cabecalho titulo="Ajustes" />

        <View className="gap-6 px-4">
          <Secao titulo="Aparência">
            <View className="flex-row gap-2">
              {TEMAS.map(({ valor, rotulo }) => (
                <Chip
                  key={valor}
                  size="sm"
                  variant={tema === valor ? "primary" : "secondary"}
                  onPress={() => trocarTema(valor)}
                >
                  {rotulo}
                </Chip>
              ))}
            </View>
          </Secao>

          <Secao
            titulo="Meu estado"
            descricao="Define quais parlamentares aparecem em destaque no início."
          >
            <View className="flex-row flex-wrap gap-2">
              {UFS.map(({ sigla }) => (
                <Chip
                  key={sigla}
                  size="sm"
                  variant={uf === sigla ? "primary" : "secondary"}
                  onPress={() => definirUf(sigla)}
                >
                  {sigla}
                </Chip>
              ))}
            </View>
          </Secao>

          <Secao titulo="Acompanhamento">
            <Surface variant="secondary" className="p-4">
              <Text className="text-sm text-foreground">
                {seguidos.length === 0
                  ? "Você ainda não segue ninguém."
                  : `Você segue ${seguidos.length} ${seguidos.length === 1 ? "parlamentar" : "parlamentares"}.`}
              </Text>
            </Surface>
          </Secao>

          <Secao
            titulo="De onde vêm os dados"
            descricao="Tudo vem de APIs públicas e oficiais. Nenhum dado é editorializado."
          >
            <Surface variant="secondary" className="overflow-hidden">
              {FONTES.map((fonte, indice) => (
                <Pressable
                  key={fonte.url}
                  onPress={() => void WebBrowser.openBrowserAsync(fonte.url)}
                  className={
                    indice === 0
                      ? "flex-row items-center justify-between p-4"
                      : "flex-row items-center justify-between border-t border-border p-4"
                  }
                >
                  <Text className="text-sm text-foreground">{fonte.nome}</Text>
                  <Icon name="open-outline" size={16} color={muted} />
                </Pressable>
              ))}
            </Surface>
          </Secao>

          <Text className="text-center text-xs text-muted-foreground">
            Politicapp é gratuito, sem anúncios e de código aberto.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

type SecaoProps = {
  titulo: string
  descricao?: string
  children: React.ReactNode
}

const Secao = ({ titulo, descricao, children }: SecaoProps) => (
  <View className="gap-3">
    <View className="gap-1">
      <Text className="text-base font-semibold text-foreground">{titulo}</Text>
      {descricao ? (
        <Text className="text-xs text-muted-foreground">{descricao}</Text>
      ) : null}
    </View>
    {children}
  </View>
)
