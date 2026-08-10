import type {
  Benchmark,
  IndiceParlamentar,
  Parlamentar,
  ResumoDespesas,
} from "@politicapp/data"

import { config, log } from "./config"
import { emLotes } from "./http"
import { publicar } from "./publish"
import {
  baixarDespesasCamara,
  listarDeputados,
  listarVotacoesCamara,
  listarVotosCamara,
} from "./sources/camara"
import {
  baixarDespesasSenado,
  listarSenadores,
  listarVotacoesSenado,
  senadorParticipou,
} from "./sources/senado"
import { calcularBenchmark } from "./tasks/benchmarks"
import { resumirDespesas } from "./tasks/despesas"
import { calcularParticipacao, type RegistroVoto } from "./tasks/participacao"

const VOTOS_PRESENTES_CAMARA = new Set(["Sim", "Não", "Abstenção", "Obstrução"])

type Participacao = { participadas: number; percentual: number }

const executar = async () => {
  const { ano } = config
  const geradoEm = new Date().toISOString()

  const deputados = await listarDeputados()
  const senadores = await tolerar("senado: lista", listarSenadores(), [] as Parlamentar[])

  const [despesasCamara, despesasSenado] = await Promise.all([
    tolerar("câmara: cotas", baixarDespesasCamara(ano), []),
    senadores.length > 0
      ? tolerar("senado: ceaps", baixarDespesasSenado(ano, senadores), [])
      : Promise.resolve([]),
  ])

  const resumos: ResumoDespesas[] = [
    ...resumirDespesas("camara", ano, despesasCamara),
    ...resumirDespesas("senado", ano, despesasSenado),
  ]

  const [participacaoCamara, participacaoSenado, votacoesCamara, votacoesSenado] =
    await medirParticipacao(ano)

  const gastoPorChave = new Map(
    resumos.map((resumo) => [`${resumo.casa}:${resumo.id}`, resumo.total]),
  )

  const participacaoDe = (parlamentar: Parlamentar): Participacao | undefined =>
    parlamentar.casa === "camara"
      ? participacaoCamara.get(parlamentar.id)
      : participacaoSenado.get(parlamentar.id)

  const parlamentares: IndiceParlamentar[] = [...deputados, ...senadores].map(
    (parlamentar) => {
      const participacao = participacaoDe(parlamentar)
      const gasto = gastoPorChave.get(`${parlamentar.casa}:${parlamentar.id}`)

      return {
        ...parlamentar,
        gastoAno: gasto ?? 0,
        participacaoPercentual: participacao?.percentual ?? null,
        votacoesParticipadas: participacao?.participadas ?? null,
      }
    },
  )

  const casas: Benchmark[] = [
    calcularBenchmark("camara", ano, parlamentares, votacoesCamara),
    calcularBenchmark("senado", ano, parlamentares, votacoesSenado),
  ].filter((benchmark) => benchmark.gastos.geral.amostra > 0)

  await publicar("indice", { geradoEm, ano, parlamentares })
  await publicar("despesas", { geradoEm, ano, resumos })
  await publicar("benchmarks", { geradoEm, casas })

  log(
    `concluído: ${parlamentares.length} parlamentares (${deputados.length} deputados, ${senadores.length} senadores), ${resumos.length} com despesas`,
  )
}

const medirParticipacao = async (ano: number) => {
  const votacoes = await tolerar("câmara: votações", listarVotacoesCamara(ano), [])

  let falhasDeVotos = 0

  const registrosCamara = await emLotes(votacoes, async (votacao) => {
    const votos = await listarVotosCamara(votacao.id).catch((erro: unknown) => {
      falhasDeVotos += 1
      if (falhasDeVotos <= 3) {
        log(`câmara: votos de ${votacao.id} falharam — ${String(erro)}`)
      }
      return []
    })
    return votos.map<RegistroVoto>((voto) => ({
      parlamentarId: String(voto.deputado_.id),
      votou: VOTOS_PRESENTES_CAMARA.has(voto.tipoVoto.trim()),
    }))
  })

  const nominaisCamara = registrosCamara.filter((registro) => registro.length > 0)
  log(
    `câmara: ${nominaisCamara.length} votações nominais com votos individuais (${falhasDeVotos} falhas)`,
  )

  const votacoesSenado = await tolerar("senado: votações", listarVotacoesSenado(ano), [])
  const nominaisSenado = votacoesSenado
    .map((votacao) =>
      votacao.votos.map<RegistroVoto>((voto) => ({
        parlamentarId: String(voto.codigoParlamentar),
        votou: senadorParticipou(voto.siglaVotoParlamentar),
      })),
    )
    .filter((registro) => registro.length > 0)
  log(`senado: ${nominaisSenado.length} votações com votos individuais`)

  return [
    calcularParticipacao(nominaisCamara),
    calcularParticipacao(nominaisSenado),
    nominaisCamara.length,
    nominaisSenado.length,
  ] as const
}

const tolerar = async <T>(
  etapa: string,
  promessa: Promise<T>,
  padrao: T,
): Promise<T> => {
  try {
    return await promessa
  } catch (erro) {
    log(`${etapa} falhou, seguindo sem esse dado — ${String(erro)}`)
    return padrao
  }
}

executar().catch((erro: unknown) => {
  log(`pipeline falhou: ${String(erro)}`)
  process.exitCode = 1
})
