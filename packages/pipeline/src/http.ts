import { config, log } from "./config"

const TENTATIVAS = 4
const ESPERA_BASE_MS = 500

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const buscarJson = async <T>(
  url: string,
  init?: RequestInit,
): Promise<T> => {
  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa += 1) {
    try {
      const resposta = await fetch(url, {
        ...init,
        headers: {
          accept: "application/json",
          "user-agent": "politicapp-pipeline (open source, github.com/politicapp)",
          ...init?.headers,
        },
      })

      if (resposta.status === 429 || resposta.status >= 500) {
        throw new Error(`HTTP ${resposta.status}`)
      }

      if (!resposta.ok) {
        throw new ErroPermanente(`HTTP ${resposta.status} em ${url}`)
      }

      return (await resposta.json()) as T
    } catch (erro) {
      if (erro instanceof ErroPermanente || tentativa === TENTATIVAS) throw erro
      const espera = ESPERA_BASE_MS * 2 ** (tentativa - 1)
      log(`retry ${tentativa}/${TENTATIVAS} em ${espera}ms — ${url}`)
      await esperar(espera)
    }
  }

  throw new Error(`Falha ao buscar ${url}`)
}

export class ErroPermanente extends Error {}

export const emLotes = async <T, R>(
  itens: T[],
  tarefa: (item: T, indice: number) => Promise<R>,
  concorrencia = config.concorrencia,
): Promise<R[]> => {
  const resultados: R[] = new Array(itens.length)
  let proximo = 0

  const trabalhador = async () => {
    while (proximo < itens.length) {
      const indice = proximo
      proximo += 1
      const item = itens[indice]
      if (item === undefined) continue
      resultados[indice] = await tarefa(item, indice)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concorrencia, itens.length) }, trabalhador),
  )

  return resultados
}
