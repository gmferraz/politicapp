import * as Sentry from "@sentry/react-native"
import type { z } from "zod"

const TIMEOUT_MS = 15_000

export class ErroDeApi extends Error {
  constructor(
    readonly fonte: string,
    readonly status: number,
    url: string,
  ) {
    super(`${fonte}: HTTP ${status} em ${url}`)
  }
}

type Opcoes = {
  fonte: string
  headers?: Record<string, string>
}

export const buscarJson = async <T>(
  url: string,
  esquema: z.ZodType<T>,
  { fonte, headers }: Opcoes,
): Promise<T> => {
  const controlador = new AbortController()
  const expira = setTimeout(() => controlador.abort(), TIMEOUT_MS)

  try {
    const resposta = await fetch(url, {
      signal: controlador.signal,
      headers: { accept: "application/json", ...headers },
    })

    if (!resposta.ok) {
      throw new ErroDeApi(fonte, resposta.status, url)
    }

    const analise = esquema.safeParse(await resposta.json())

    if (!analise.success) {
      Sentry.captureException(analise.error, {
        tags: { fonte, contrato: "quebrado" },
        extra: { url },
      })
      throw new Error(`${fonte}: resposta fora do formato esperado`)
    }

    return analise.data
  } finally {
    clearTimeout(expira)
  }
}
