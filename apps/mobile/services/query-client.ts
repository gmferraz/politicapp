import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient } from "@tanstack/react-query"

import { TEMPO } from "@/services/api/query-keys"
import { storage } from "@/utils/storage"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: TEMPO.hora,
      gcTime: TEMPO.dia * 7,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

export const persister = createSyncStoragePersister({
  storage: {
    getItem: (chave) => storage.getString(chave) ?? null,
    setItem: (chave, valor) => storage.set(chave, valor),
    removeItem: (chave) => storage.remove(chave),
  },
  key: "politicapp-cache",
})

export const opcoesDePersistencia = {
  persister,
  maxAge: TEMPO.dia * 7,
}
