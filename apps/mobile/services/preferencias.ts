import { parlamentarKey, type ParlamentarRef } from "@politicapp/data"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { storage } from "@/utils/storage"

type Preferencias = {
  uf: string | null
  seguidos: string[]
  definirUf: (uf: string) => void
  alternarSeguido: (ref: ParlamentarRef) => void
  segue: (ref: ParlamentarRef) => boolean
}

const mmkvStorage = {
  getItem: (nome: string) => storage.getString(nome) ?? null,
  setItem: (nome: string, valor: string) => storage.set(nome, valor),
  removeItem: (nome: string) => storage.remove(nome),
}

export const usePreferencias = create<Preferencias>()(
  persist(
    (set, get) => ({
      uf: null,
      seguidos: [],
      definirUf: (uf) => set({ uf }),
      alternarSeguido: (ref) => {
        const chave = parlamentarKey(ref)
        const { seguidos } = get()
        set({
          seguidos: seguidos.includes(chave)
            ? seguidos.filter((seguido) => seguido !== chave)
            : [...seguidos, chave],
        })
      },
      segue: (ref) => get().seguidos.includes(parlamentarKey(ref)),
    }),
    {
      name: "preferencias",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: ({ uf, seguidos }) => ({ uf, seguidos }),
    },
  ),
)
