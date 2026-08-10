import { useThemeColor } from "heroui-native"
import { useColorScheme } from "react-native"
import { useUniwind } from "uniwind"

type TemaResolvido = "light" | "dark"

const CORES_PADRAO = {
  light: {
    brandColor: "#123B9C",
    brandForeground: "#FFFFFF",
    accentColor: "#171717",
    dangerColor: "#DC2626",
    successColor: "#16A34A",
    background: "#FFFFFF",
    foreground: "#171717",
    muted: "#737373",
    defaultColor: "#F5F5F5",
    warningColor: "#CA8A04",
    surface: "#F5F5F5",
    border: "#E5E5E5",
  },
  dark: {
    brandColor: "#5B8CFF",
    brandForeground: "#04102E",
    accentColor: "#FAFAFA",
    dangerColor: "#EF4444",
    successColor: "#22C55E",
    background: "#000000",
    foreground: "#FAFAFA",
    muted: "#A3A3A3",
    defaultColor: "#171717",
    warningColor: "#F5C542",
    surface: "#1C1C1E",
    border: "#262626",
  },
} as const

const sanitizar = (valor: string, padrao: string) =>
  !valor || valor === "invalid" ? padrao : valor

export const useColors = () => {
  const { theme, hasAdaptiveThemes } = useUniwind()
  const esquemaDoSistema = useColorScheme()
  const temaAtual: TemaResolvido = hasAdaptiveThemes
    ? esquemaDoSistema === "dark"
      ? "dark"
      : "light"
    : theme === "dark"
      ? "dark"
      : "light"
  const padrao = CORES_PADRAO[temaAtual]

  return {
    brandColor: padrao.brandColor,
    brandForeground: padrao.brandForeground,
    accentColor: sanitizar(useThemeColor("accent"), padrao.accentColor),
    dangerColor: sanitizar(useThemeColor("danger"), padrao.dangerColor),
    successColor: sanitizar(useThemeColor("success"), padrao.successColor),
    warningColor: sanitizar(useThemeColor("warning"), padrao.warningColor),
    background: sanitizar(useThemeColor("background"), padrao.background),
    foreground: sanitizar(useThemeColor("foreground"), padrao.foreground),
    muted: sanitizar(useThemeColor("muted"), padrao.muted),
    defaultColor: sanitizar(useThemeColor("default"), padrao.defaultColor),
    surface: sanitizar(useThemeColor("surface"), padrao.surface),
    border: sanitizar(useThemeColor("border"), padrao.border),
  }
}
