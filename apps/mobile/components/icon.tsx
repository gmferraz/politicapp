import Ionicons from "@expo/vector-icons/Ionicons"
import type { ComponentProps } from "react"

export type IconName = ComponentProps<typeof Ionicons>["name"]

type Props = {
  name: IconName
  size?: number
  color?: string
}

export const Icon = ({ name, size = 20, color }: Props) => (
  <Ionicons name={name} size={size} color={color} />
)
