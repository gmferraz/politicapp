export const config = {
  ano: Number(process.env.PIPELINE_ANO ?? new Date().getFullYear()),
  saida: process.env.PIPELINE_SAIDA ?? "dist",
  concorrencia: Number(process.env.PIPELINE_CONCORRENCIA ?? 3),
  chaveTransparencia: process.env.PORTAL_TRANSPARENCIA_API_KEY ?? "",
} as const

export const log = (mensagem: string) => {
  process.stdout.write(`${new Date().toISOString()} ${mensagem}\n`)
}
