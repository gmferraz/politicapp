# Politicapp

App gratuito e de código aberto que agrega dados da política brasileira e mostra de um jeito simples para o cidadão comum.

Sem anúncios, sem login, sem nota editorial. Todo dado linka a fonte oficial.

- **Escopo do produto**: [`ESCOPO.md`](ESCOPO.md)
- **Escopo técnico**: [`ESCOPO-TECNICO.md`](ESCOPO-TECNICO.md)
- **Pesquisa de fontes e concorrentes**: [`docs/`](docs/)

## Como funciona

Três camadas de dados, sem servidor próprio:

1. **APIs públicas consultadas direto do app** (Câmara, Senado, TSE) — dado quente e pontual: perfil, votações recentes, candidaturas.
2. **JSON estático pré-computado** — o pacote `packages/pipeline` roda em cron do GitHub Actions, baixa os dados em lote, calcula medianas e rankings, e publica arquivos em GitHub Pages. É o que permite comparar um gasto com a mediana da casa sem fazer 594 requisições no celular.
3. **Backend de verdade** — não existe ainda. Entra só quando chegarem push e contas de usuário.

## Estrutura

```
apps/mobile        app Expo (React Native, expo-router)
packages/data      schemas zod e tipos compartilhados
packages/pipeline  ETL que gera os JSONs estáticos
```

## Rodando

```bash
pnpm install
```

App (precisa de Node 22):

```bash
pnpm dev:mobile
```

Pipeline de dados:

```bash
pnpm pipeline
```

Verificações:

```bash
pnpm check-types && pnpm test
```

## Fontes de dados

| Fonte | O que traz | Autenticação |
| --- | --- | --- |
| [Câmara dos Deputados](https://dadosabertos.camara.leg.br/) | Deputados, votações, proposições | Nenhuma |
| [Cota parlamentar (Câmara)](https://www.camara.leg.br/cotas/) | CSV anual com todos os lançamentos | Nenhuma |
| [Senado Federal](https://legis.senado.leg.br/dadosabertos/) | Senadores, votações com votos individuais | Nenhuma |
| [CEAPS (Senado)](https://www.senado.leg.br/transparencia/LAI/verba/) | CSV anual de despesas dos senadores | Nenhuma |
| [DivulgaCandContas (TSE)](https://divulgacandcontas.tse.jus.br/) | Candidaturas 2026, bens declarados | Nenhuma |
| [Portal da Transparência](https://portaldatransparencia.gov.br/api-de-dados) | Emendas parlamentares | Chave pessoal, só no pipeline |

### Armadilhas conhecidas destas APIs

Coisas que custaram tempo para descobrir e que o código já contorna:

- **`/deputados/{id}/despesas` retorna vazio** para todos os anos testados. Use o CSV em lote de `camara.leg.br/cotas/Ano-{ano}.csv.zip`.
- **`/votacoes` da Câmara aceita no máximo 3 meses** entre `dataInicio` e `dataFim`. O pipeline fatia o ano em janelas mensais.
- **Das 6.475 votações da Câmara em 2026, só 1.168 são de plenário.** As de comissão raramente têm voto nominal — filtrar por `siglaOrgao=PLEN` corta 82% das requisições.
- **`/votacoes/{id}/votos` rejeita o parâmetro `itens`** com HTTP 400 (`code: 5`). Chame sem nenhum parâmetro de paginação.
- **Das 1.168 votações de plenário, só 115 têm voto nominal individual.** O resto é votação simbólica, que não registra voto por parlamentar; outras 19 devolvem 404 no recurso de votos. Resposta vazia aqui é normal, não é erro.
- **A API da Câmara limita a taxa** no endpoint de votos. Concorrência 3 com backoff exponencial passa; 6 gera 429 esporádicos.
- **O CEAPS do Senado é Latin-1** e a **primeira linha é metadado**, não cabeçalho. Além disso identifica o senador por **nome**, não por código — o join é por nome normalizado (sem acento, maiúsculas).
- **O endpoint legado de votações do Senado foi desativado** em 01/02/2026. O atual é `/dadosabertos/votacao`, cuja resposta é um **array na raiz**, com os votos já embutidos em `votos[]`.
- **`siglaVotoParlamentar` do Senado não é um enum limpo**: mistura `Sim`/`Não`/`Abstenção` com `AP`, `P-NRV`, `MIS`, `LS`, `LAP`, `LP` e `Presidente (art. 51 RISF)`. Em votação secreta vira `Votou`.
- **`totalVotosSim/Nao/Abstencao` do Senado vêm `null`.** Conte a partir de `votos[]`.
- **DivulgaCandContas não é documentado** e muda a cada ciclo eleitoral. Está isolado em `services/api/tse.ts` justamente por isso.

## Métricas: o que os números significam

- **Cota parlamentar** é o total reembolsado no ano, sempre comparado à mediana da casa — nunca apresentado sozinho.
- **Participação em votações** conta apenas votações **nominais de plenário**, em que o voto de cada parlamentar fica registrado. **Não é presença em sessões** — a Câmara não expõe isso de forma direta, e chamar de "presença" seria impreciso.

## Licença

MIT.
