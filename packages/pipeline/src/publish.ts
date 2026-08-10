import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

import { DATA_VERSION } from "@politicapp/data"

import { config, log } from "./config"

export const publicar = async (nome: string, dados: unknown) => {
  const caminho = join(config.saida, DATA_VERSION, `${nome}.json`)
  const conteudo = JSON.stringify(dados)

  await mkdir(dirname(caminho), { recursive: true })
  await writeFile(caminho, conteudo, "utf-8")

  log(`publicado ${caminho} (${(conteudo.length / 1024).toFixed(0)} kB)`)
}
