import { twMerge } from "tailwind-merge"

type ClassValue = string | number | boolean | null | undefined | ClassValue[]

export function cn(...inputs: ClassValue[]): string {
  return twMerge(inputs.flat().filter(Boolean).join(" "))
}
