# Entrega C — Hora da Smartfit (+ ajustes do treino)

**Data:** 2026-10-02 · Terceira de cinco (A ✅ → B ✅ → **C** → D Nativo → E Navegação + dívidas).

## Por que existe

A troca para a Smartfit é a fase 2 e acontece "quando bater a carga máxima do prédio" — e hoje é
ela quem teria que perceber isso sozinha. Ela começa o app agora e **não sabe as cargas máximas**
do prédio, então o app aprende no uso. Na mesma conversa ela abriu a porta para mudar o treino
"pra acelerar e melhorar"; a revisão concluiu que a estrutura está certa e pediu três ajustes.

## Decisões dela (2026-10-02)

| Pergunta | Decisão |
|---|---|
| Reformular a estrutura? | Não: entram o **búlgaro**, o **lado fraco primeiro** e as **táticas no teto**. |
| Cargas máximas do prédio | Ela não sabe → o app aprende com um botão "não tem mais peso aqui". |
| Lado fraco | O app pergunta no primeiro exercício unilateral e guarda. |
| Cardio | Esteira inclinada ~6% a 5 km/h, 1 h, **depois do treino** (modo `esteira`, já existe — nada a mudar no código). |

Decisões do assistente (registradas para ela poder mudar): o búlgaro **substitui o goblet na variação**
(quarta); os exercícios que decidem a hora da Smartfit são **hip thrust com barra, leg press, abdutora e búlgaro**.

## 1. Búlgaro

- `agachamento-bulgaro` (`exercises-seed.ts`): descrição com viés de glúteo — passada longa, tronco
  levemente inclinado pra frente, peso no calcanhar da frente; "lado fraco primeiro". O erro
  "Inclinar tronco demais pra frente" vira "Tronco ereto demais (vira coxa) ou inclinado demais
  (lombar reclama)".
- Fica fora da adaptação: a revisão de 2026-07-27 o considera avançado demais pra iniciante a 96 kg (tests/data/correcoes-ciclo.test.ts).
- Variação, `v-qua-mobilidade-danca`: `agachamento-goblet` → `agachamento-bulgaro` 3 × "10-12 cada".
  O goblet continua no Inferior A (padrão de levantar a noiva).
- `durationMin` = estimador; nenhuma sessão passa de 60. Faixas de volume da fase 1 continuam
  verdes. `EXERCISE_SEED_VERSION` e `TEMPLATE_SEED_VERSION` sobem (pinos atualizados).

## 2. Teto do prédio

- Setting `tetoPredio: Record<string, number>` (exerciseId → kg), padrão `{}`. Vai no backup (settings).
- Módulo puro `src/lib/teto-predio.ts`:
  - `EXERCICIOS_CHAVE = ["hip-thrust-barra", "leg-press-pes-medios", "abdutor-maquina", "agachamento-bulgaro"]`;
  - `noTeto(sugerido, teto?)` → `true` quando há teto e a sugestão passa dele;
  - `TATICAS_NO_TETO`: três frases — **+2 reps acima do topo da faixa**, **pausa de 2 s na contração**, **descida em 4 s** — e, para exercícios bilaterais, "a versão de uma perna (ou um braço) dobra a carga relativa";
  - `progressoTeto(tetos)` → `{ noTeto: number; total: number; todos: boolean }` contando só as chave.
- `SessionRecorder`:
  - quando a sugestão sobe a carga em relação à última série, aparece o link **"Não tem mais peso aqui"** → grava `tetoPredio[id] = carga da última vez`;
  - com teto gravado e sugestão acima dele: em vez de "Sugestão: X kg", mostra **"No teto do prédio (X kg)"** + as táticas, e um link discreto **"o aparelho tem mais peso"** que apaga o teto daquele exercício (erro de toque, aparelho novo).

## 3. Hora da Smartfit

- Hoje: card **"Hora da Smartfit"** só quando `progressoTeto(...).todos`. Texto: você bateu o teto do prédio nos quatro exercícios que constroem glúteo e coxa; as táticas seguram algumas semanas, mas o crescimento agora depende de carga; o roteiro (de `OBJETIVO.md` §8): mandar fotos/lista de aparelhos da unidade, 1–2 semanas de entrada com máquinas sentadas.
- Treino (`WorkoutHome`): linha "Teto do prédio: N de 4 exercícios principais" quando N ≥ 1.

## 4. Lado fraco primeiro

- Setting `ladoFraco: "" | "esquerdo" | "direito"`, padrão `""`.
- Puro: `ehUnilateral(repsTarget)` = contém "cada" e não "troca" (a prancha antirrotação "6 trocas cada lado" é bilateral).
- `SessionRecorder` em exercício unilateral:
  - sem lado: "Qual lado é o mais fraco?" com botões **Esquerdo** / **Direito** (ajuda: o da perna que pareceu mais curta deitada, ou o que cansa primeiro);
  - com lado: "Comece pelo lado {lado}. O lado forte faz as mesmas repetições — nem uma a mais." + link "trocar".

## Testes

Puro: `noTeto`, `progressoTeto` (só chave contam), `ehUnilateral`. Seed: búlgaro nos dois templates, goblet só no A da variação, duração = estimador e ≤ 60, faixas verdes, versões. Telas: botão grava teto; com teto mostra táticas e o link desfaz; lado fraco pergunta e depois instrui; card da Smartfit aparece só com as quatro no teto; linha de progresso no Treino. Telas aguardam estado carregado.

## Fora do escopo

Roteiro completo da fase 2 na Smartfit (é trabalho próprio, depois das fotos dela); teto em
exercícios fora da chave além do botão; lembrete no celular.
