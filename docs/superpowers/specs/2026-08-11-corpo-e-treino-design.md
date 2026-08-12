# Frente 3 — Corpo & treino

**Data:** 2026-08-11
**Status:** aprovado, pronto pra plano de implementação

## Por que isto existe

A frente 1 arrumou o que o app afirma. O treino em si continua com os mesmos
exercícios de antes — só sem o cardio duplicado no fim. Faltam três coisas que a
usuária pediu explicitamente e que o programa atual não entrega:

1. **Flexibilidade para as posições** que ela quer com a noiva — abertura e flexão
   profunda de quadril, rotação. É a coisa mais rápida da lista dela: 3 a 6 meses
   de trabalho diário resolvem quase tudo, e espacate não é necessário para nada.
2. **Força para levantar a noiva** e inverter o papel.
3. Confirmar que a prioridade de glúteo está calibrada para os alvos novos de
   `objetivo.ts`.

## Decisão 1 — a sessão de academia NÃO cresce

Decisão da usuária: **manter ~60 min**. O dia dela já tem 5 km a pé + 1h de cães +
academia. A frente 1 puxou o jantar para 19:30 exatamente porque sessão longa
empurrava a refeição para as 20h, que é quando ela perde o controle da alimentação.
Alongar o treino desfaria o conserto.

Consequência dura: **tudo que entrar no treino tem que sair de outro lugar do
treino.** Nada de acrescentar exercício ao fim da lista.

## Decisão 2 — a flexibilidade vai para os slots que já existem

A rotina já tem dois blocos de mobilidade que ela faz todo dia:

| Slot | Hoje | Vira |
|---|---|---|
| Manhã, 06:00, 15 min | `mobilidade-pelvica-matinal` (10 min, genérica) | Abertura de quadril progressiva |
| Noite, 21:30, 10 min | `flexibilidade-intima` (12 min) | Flexão profunda + rotação, mantida |

Não entra item novo no Hoje. Os dois slots são **reaproveitados**, não somados.

**A progressão é o que falta.** Hoje as duas sequências são fixas: ela faz a mesma
coisa no dia 1 e no dia 200. Entra uma progressão em fases, no mesmo padrão de
`pelvic-progression.ts`, que é o módulo que já provou funcionar:

| Fase | Semanas | Alvo |
|---|---|---|
| 1 | 1–4 | Tolerância — borboleta, rã, agachamento profundo com pausa |
| 2 | 5–12 | Amplitude — pancake leve, 90/90, flexão profunda com carga corporal |
| 3 | 13–24 | Sustentação — manter as posições com conforto e sem tensão |

**Horizonte declarado, com a mesma honestidade da frente 1:** 4 a 6 semanas para
sentir diferença; 3 a 6 meses para o que as posições dela pedem. Espacate frontal
é 12–24 meses e **não é necessário**; espacate lateral depende do formato do
acetábulo e parte das pessoas nunca chega — por anatomia, não por esforço. O app diz
isso em vez de deixar ela achar que está falhando.

## Decisão 3 — força de levantar entra por troca

Levantar outra pessoa é dobradiça de quadril + carregamento em posição frontal +
core antirrotação. O programa já tem hip thrust, stiff, good-morning e agachamento.
O que falta é o padrão de **carregar carga à frente do corpo**.

Entra, **trocando** exercícios existentes de volume acessório, sem somar tempo:

| Entra | Sai (por ciclo, o acessório de menor retorno) |
|---|---|
| Agachamento goblet (halter à frente) | uma variação de abdutor |
| Caminhada do fazendeiro / carregamento frontal | um isolamento de menor retorno |
| Prancha com apoio alternado (antirrotação) | uma prancha lateral extra |

Restrição de equipamento: vale o que existe na academia do prédio — halteres,
caneleira, barra, leg press, abdutora, multiestação, polia alta, espaldar, bola,
step. **Sem Smith.** A polia baixa é curta e não serve para coice nem pull-through.

**Regra que não pode ser violada:** nada disso pode engrossar ombro ou trapézio. É a
restrição que o programa inteiro respeita desde o começo, e o carregamento frontal
foi escolhido em vez de carregamento acima da cabeça exatamente por isso.

## Decisão 4 — a prioridade de glúteo é confirmada, não refeita

Os 5 ciclos já são glúteo-prioritários com 4 estímulos por semana, e isso está
certo para o objetivo. Esta frente **não reescreve os ciclos**. O que ela faz é
verificar contra `objetivo.ts`:

- fase 1 (cintura 99 → 84) é déficit: o treino preserva músculo, não busca recorde;
- a trava de `CINTURA_LIBERA_SUPERAVIT_CM = 88` continua governando a entrada em
  hipertrofia;
- fase 2 (quadril → 114 de músculo) é onde o volume sobe.

Se algum `purpose` de template contradisser isso, corrige-se o texto — não o
programa.

## Arquitetura

**Módulo novo `src/lib/flex-progression.ts`** — puro, espelhando
`pelvic-progression.ts`: recebe quantas práticas ela acumulou e devolve a sequência
do dia mais a fase em que está. Quem chama injeta a contagem.

**Sequências novas** em `sequences-seed.ts`, `category: "mobilidade"`, uma por fase
para manhã e noite. As duas existentes viram a fase 1 e são preservadas por id — o
histórico de `practiceLogs` dela não pode quebrar.

| Arquivo | Mudança |
|---|---|
| `src/lib/flex-progression.ts` | **novo** — fases de flexibilidade |
| `src/data/sequences-seed.ts` | sequências de fase 2 e 3, manhã e noite |
| `src/lib/movement-seed.ts` | **bump de `MOVEMENT_VERSION`** |
| `src/lib/today-routine.ts` | os dois itens de alongamento resolvem `to` pela progressão, como `pelvic` já faz |
| `src/pages/Today.tsx` | resolução do destino e subtítulo com a fase |
| `src/data/cycles-seed.ts` | trocas de acessório por ciclo |
| `src/data/exercises-seed.ts` | goblet, carregamento frontal, prancha antirrotação |
| `src/pages/workout/Horizontes.tsx` ou seed | horizonte de flexibilidade declarado |

## Testes

- `tests/lib/flex-progression.test.ts` — fases, ordem, e que as sequências antigas
  continuam sendo a fase 1 (histórico preservado)
- `tests/data/troca-acessorios.test.ts` — nenhum template ganhou exercício líquido:
  a contagem por template não sobe, e `durationMin` não muda
- `tests/data/sem-ombro.test.ts` — nenhum exercício novo carrega acima da cabeça
- `tests/lib/seeds-chegam-no-aparelho.test.ts` (estender) — `MOVEMENT_VERSION`
- `tests/data/equipamento-real.test.ts` (se existir, estender) — nada usa Smith nem
  polia baixa

## Fora de escopo

O rebolado como trabalho de resistência é **frente 4** — ele é habilidade motora
para a cama, não flexibilidade. A reforma do cardápio é **frente 5**.
