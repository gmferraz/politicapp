import { Tabs } from "expo-router"
import type { ColorValue } from "react-native"

import { Icon, type IconName } from "@/components/icon"
import { useColors } from "@/hooks/use-colors"

const icone =
  (nome: IconName, ativo: IconName) =>
  ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Icon name={focused ? ativo : nome} color={String(color)} size={24} />
  )

export default function TabsLayout() {
  const { brandColor, muted, background, border } = useColors()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brandColor,
        tabBarInactiveTintColor: muted,
        tabBarStyle: { backgroundColor: background, borderTopColor: border },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: icone("home-outline", "home"),
        }}
      />
      <Tabs.Screen
        name="parlamentares"
        options={{
          title: "Parlamentares",
          tabBarIcon: icone("people-outline", "people"),
        }}
      />
      <Tabs.Screen
        name="eleicoes"
        options={{
          title: "Eleições",
          tabBarIcon: icone("checkbox-outline", "checkbox"),
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: "Ajustes",
          tabBarIcon: icone("settings-outline", "settings"),
        }}
      />
    </Tabs>
  )
}
