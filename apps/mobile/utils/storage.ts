import { createMMKV } from "react-native-mmkv"

export const storage = createMMKV()

const TEMA = "app_tema"
const ONBOARDING = "onboarding_concluido"

export type TemaGuardado = "light" | "dark" | "system"

export const lerTema = (): TemaGuardado | null => {
  const tema = storage.getString(TEMA)
  return tema === "light" || tema === "dark" || tema === "system" ? tema : null
}

export const guardarTema = (tema: TemaGuardado) => storage.set(TEMA, tema)

export const onboardingConcluido = () => storage.getString(ONBOARDING) === "true"

export const concluirOnboarding = () => storage.set(ONBOARDING, "true")
