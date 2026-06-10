# Onda Treino/Equipamento — polia, busto e flexibilidade

**Data:** 2026-06-10
**Status:** Spec aprovado para implementação
**Usuária:** uso pessoal (a mesma do app Trein-Final)
**Abordagem escolhida:** A — atualização cirúrgica de conteúdo (sem telas novas)

---

## 1. Resumo

Atualização de conteúdo do pilar Treino a partir da revisão das 13 fotos novas da
academia (2026-06-10). A academia tem **mais equipamento do que estava registrado** —
em especial **polia** (alta e baixa, via multiestação + acessórios soltos), **espaldar**,
**bola suíça** e **step**. Esta onda adiciona ~12 exercícios e revisa os 5 treinos da
fase atual (ciclo `adaptacao`) para usar esse equipamento, refina o trabalho de busto
(pré-TH) e introduz flexibilidade no espaldar. Inclui também dois ajustes pedidos pela
usuária: **peso sugerido inicial** (a sugestão de carga passa a aparecer já no primeiro
uso, antes de haver histórico) e **dicas pra maximizar resultado** por exercício. É
majoritariamente um update de **dados** (seeds) + pequenas seções em telas existentes;
nenhuma tela nova, nenhuma migração de schema.

## 2. Contexto e motivação

A usuária (1,73m, 96kg, medidas: ombros 120,5 / cintura 99 / quadril 114 / coxa 82,5 /
busto 106,5) busca silhueta ampulheta com glúteo grande e busto cheio, sem TRH por ora
(preservação de fertilidade). Pediu explicitamente:

1. Confirmar se a academia tem **polia** — e usar melhor o equipamento real.
2. Exercícios pra **arredondar o peito** chegando o mais perto possível sem TH.
3. **Flexibilidade** (relatou "dureza nas movimentações"), pra vida e intimidade.

### Achados da revisão de equipamento (fotos 2026-06-10)

- **Polia: confirmada.** A multiestação tem polia alta (puxada) e **polia baixa**
  (remada). Há acessórios soltos (barra de puxada + puxador com mosquetão/corrente). O
  "gancho baixo quase no chão" que a usuária mencionou = polia baixa. **A usuária
  confirmou fisicamente (2026-06-10): ao puxar, a pilha de anilhas sobe** — é polia
  funcional. As versões com caneleira ficam como variação (útil em casa / máquina ocupada),
  não como fallback obrigatório.
- Equipamento novo confirmado: **espaldar** (barras de parede), **bola suíça**, **step/
  plataforma**, **bike reclinada**, **barra W (EZ)**, banco scott. Já registrado antes:
  leg press 45°, abdutora/adutora (Olympikus M3), halteres, caneleiras, barra, banco.
- A memória `gym_equipment.md` foi corrigida (a nota antiga dizia "não tem polia").

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Abordagem | A — atualização cirúrgica | Mantém ~1h/dia, muda o treino já, risco baixo. B (dias dedicados) estoura tempo e rouba recuperação do glúteo; C (só biblioteca) contraria a execução guiada. |
| Escopo de ciclos | Só o ciclo `adaptacao` (5 templates atuais) | Mantém a onda enxuta. Variação/hipertrofia/refinamento entram num ajuste rápido quando ela chegar neles. Exercícios novos ficam disponíveis a todos os ciclos (são da biblioteca). |
| Peito (busto) | Leve, inclinado, voador, reps altas — nunca reto pesado | Aproxima o visual de busto cheio sem peitoral quadrado/masculino. Confirmado pela usuária. |
| Polia vs caneleira | Polia onde houver ganho (tensão constante); caneleira como variação/fallback | Robustez caso a polia baixa não mova a pilha. |
| Telas | Nenhuma nova | As telas já leem exercícios/templates do banco. |

## 4. Estratégia de busto pré-TH (fundamento)

Sem TRH não há ganho de tecido mamário. Maximiza-se a **aparência** de busto mais cheio
e redondo por 3 alavancas, todas já alinhadas ao spec original (seção 4):

1. **Prateleira superior** — press/supino **inclinado** leve constrói o peitoral
   clavicular, empurrando a gordura/tecido existente pra cima e pra frente (mais projeção
   e linha de colo). A usuária já carrega gordura no peito — é um trunfo.
2. **Linha do colo** — voador/pec deck + **crucifixo na polia** com aperto no centro
   desenham a borda interna.
3. **Postura + gordura** — retração escapular e peito erguido + manter algum percentual
   de gordura leem como mais cheio.

Execução sempre **leve, repetição alta, inclinado/voador**. Evita-se reto/declinado
pesado (faz peitoral quadrado, caído, masculino). O salto de tamanho real vem com a TH.

## 5. Exercícios novos (biblioteca) — 12

Cada um segue o tipo `Exercise` existente (id, name, category, equipment[], difficulty,
description, commonMistakes[], easierVariation?, harderVariation?, exposureLevel).

### Glúteo na polia (category `gluteo`)
1. `coice-gluteo-polia` — **Coice de glúteo na polia baixa**. equipment: `["polia","caneleira"]`. Tensão constante; clipa a tornozeleira no mosquetão da polia baixa. easierVariation: coice com caneleira (`kickback-cabo`). exposure 3.
2. `pull-through-polia` — **Pull-through na polia**. equipment: `["polia"]`. Dobradiça de quadril puxando o cabo entre as pernas; glúteo + posterior. exposure 3.
3. `abducao-quadril-polia` — **Abdução de quadril na polia**. equipment: `["polia","caneleira"]`. Glúteo médio, em pé, tornozelo clipado na polia baixa. easierVariation: abdução com caneleira. exposure 2.

### Busto / postura
4. `crucifixo-polia` — **Crucifixo na polia (baixo→cima)**. category `peitoral`. equipment: `["polia"]`. Linha do colo; carga leve, reps altas, aperto no centro. exposure 2.
5. `face-pull-polia` — **Face pull na polia**. category `postura`. equipment: `["polia"]`. Versão superior do crucifixo invertido; abre ombros, levanta o busto. exposure 1.
6. `voador-maquina` — **Voador / pec deck na multiestação**. category `peitoral`. equipment: `["maquina-voador"]`. Linha interna do peito; leve, reps altas. exposure 1.

### Flexibilidade no espaldar (category `mobilidade`)
7. `along-isquios-espaldar` — **Alongamento de isquiotibiais no espaldar**. equipment: `["espaldar"]`. Pé numa barra na altura confortável, tronco à frente coluna neutra. exposure 2.
8. `abertura-quadril-espaldar` — **Abertura de quadril apoiada (straddle) no espaldar**. equipment: `["espaldar"]`. Pernas afastadas segurando as barras, desce o quadril. exposure 2.
9. `agachamento-assistido-espaldar` — **Agachamento profundo assistido no espaldar**. equipment: `["espaldar"]`. Segura a barra e desce ao agachamento profundo, abrindo quadril e tornozelo. exposure 1.
10. `espacate-progressao` — **Progressão de espacate apoiada**. equipment: `["espaldar","colchonete"]`. Avanço gradual da abertura frontal usando o espaldar pra apoio/segurança. exposure 3.

### Bola e step (category `gluteo`)
11. `ponte-gluteo-bola` — **Ponte/hip thrust na bola suíça**. equipment: `["bola-suica"]`. Costas na bola, sobe o quadril; instabilidade recruta mais glúteo + core. easierVariation: ponte no chão (`ponte-gluteo-band`). exposure 3.
12. `step-up-gluteo` — **Step-up pra glúteo no step**. equipment: `["step","halteres"]`. Sobe no step empurrando pelo calcanhar, foco no glúteo da perna de cima. exposure 3.

Novas strings de `equipment`: `"polia"`, `"espaldar"`, `"bola-suica"`, `"step"`,
`"maquina-voador"`. (Texto livre, não há enum a alterar.)

## 6. Revisão dos templates (ciclo `adaptacao`) — trocas, não somas

Mantém a duração de cada dia (~1h). Trocas (swap), preservando o número de blocos.

- **Seg — 🍑 Glúteo A · Força:** sem mudança estrutural. (Opcional: nota citando que o
  `stiff` pode virar `pull-through-polia` se a barra estiver ocupada.)
- **Ter — Superior leve + Cintura fina (dia de busto):** mantém `supino-inclinado-halteres`
  (leve). Adiciona `crucifixo-polia` (linha do colo). Troca `face-pull` (halter) →
  `face-pull-polia`. Mantém `remada-baixa-maquina` + core. Nota didática: postura ereta +
  retração escapular = busto mais cheio.
- **Qua — Mobilidade + Dança + Glúteo médio:** adiciona `along-isquios-espaldar`,
  `abertura-quadril-espaldar`, `agachamento-assistido-espaldar` (flexibilidade). Mantém o
  bloco de dança/rebolado. (`espacate-progressao` fica disponível na biblioteca como
  progressão opcional pra não estourar o tempo.)
- **Qui — 🍑 Glúteo B · Unilateral + Coxa:** adiciona `step-up-gluteo` como opção
  unilateral; mantém búlgaro/hip thrust unilateral/stiff unilateral/adutora.
- **Sex — 🍑 Glúteo C · Volume + Core:** troca `kickback-cabo` (caneleira) →
  `coice-gluteo-polia`; adiciona `pull-through-polia`; troca `elevacao-pelvica-banco` →
  `ponte-gluteo-bola` (variação na bola). Mantém abdução + prancha lateral.

## 6b. Carga sugerida inicial (feedback da usuária)

A engine de auto-progressão (`suggestNextLoad`) já funciona e a UI já mostra
"Sugestão: X kg (aplicar em todas)" — **mas só depois do primeiro registro** daquele
exercício (sem histórico, `suggested` fica `null` e nada aparece). Não há bug: a sessão
salva `date` como `"YYYY-MM-DD"` e a query `.below(hoje+"z")` inclui o histórico
corretamente. O que falta é um **peso de partida**.

- Novo campo opcional **`startLoadKg?: number`** em `Exercise`, conservador, só pra
  exercícios com carga externa (halteres, barra, máquinas, polia).
- `SessionRecorder`: quando não há histórico (`suggested === null`) e existe
  `startLoadKg`, mostra "Sugestão inicial: {startLoadKg} kg (aplicar em todas)",
  reutilizando o botão `applySuggestion`. Após o 1º registro, a auto-progressão assume.
- Exercícios de peso corporal (mobilidade, dança, prancha, espaldar, etc.) não recebem
  `startLoadKg`; o recorder mostra um rótulo "Peso corporal" no lugar da sugestão.

## 6c. Dicas pra maximizar resultado (feedback da usuária)

Além de ensinar a execução e os erros, cada exercício ganha dicas práticas de resultado.

- Novo campo opcional **`proTips?: string[]`** em `Exercise`.
- Exibido como seção **"Dicas pra maximizar"** em `ExerciseInfoModal` e `ExerciseDetail`
  (mesmo padrão visual de "Como fazer" / "Erros comuns"; só renderiza se houver tips).
- Conteúdo escrito pra **todos os ~40 exercícios** (existentes + os 12 novos), 2-4 dicas
  cada, alinhadas ao objetivo (glúteo, cintura fina, busto feminilizado, postura).

Ambos os campos são **opcionais** no tipo `Exercise` — **sem migração de schema Dexie**
(não alteram store nem índice). Chegam a contas existentes via re-seed (bump de versão).

## 7. Implementação técnica

1. **`src/lib/db.ts`** — adicionar campos opcionais `startLoadKg?: number` e
   `proTips?: string[]` à interface `Exercise`. (Sem mudança de `this.version(...)` —
   campos opcionais não exigem migração.)
2. **`src/data/exercises-seed.ts`** — adicionar os 12 exercícios novos ao array
   `EXERCISES`; preencher `proTips` em todos os ~40 e `startLoadKg` nos exercícios com carga.
3. **`src/data/workout-plan-seed.ts`** — aplicar as trocas da seção 6 nos 5 templates.
4. **`src/components/SessionRecorder.tsx`** — quando `suggested === null`, usar
   `exercise.startLoadKg` como sugestão inicial; rótulo "Peso corporal" se não houver.
5. **`src/components/ExerciseInfoModal.tsx`** e **`src/pages/workout/ExerciseDetail.tsx`** —
   nova seção "Dicas pra maximizar" (renderiza só se `proTips?.length`).
6. **`src/lib/seed.ts`** — bumpar `EXERCISE_SEED_VERSION` (3 → 4) e `TEMPLATE_SEED_VERSION`
   (2 → 3). O re-seed por `put()` é idempotente (mesmo id sobrescreve), então atualiza
   contas existentes **sem apagar histórico** de `workout_sessions`.
7. Nenhuma migração de schema Dexie. Nenhuma tela nova (só novas seções em telas existentes).

## 8. Testes

| Tipo | Cobertura |
|---|---|
| Lógica/seed (Vitest) | Estender `tests/lib/seed.test.ts`: todos os `exerciseId` referenciados nos templates existem em `EXERCISES`; os 12 ids novos estão presentes; ids únicos; cada exercício novo tem os campos obrigatórios preenchidos. |
| Conteúdo (Vitest) | Todo exercício tem `proTips` não-vazio; todo exercício com carga (equipment inclui halteres/barra/máquina/polia) tem `startLoadKg > 0`; exercícios de peso corporal não têm `startLoadKg`. |
| Progressão (Vitest) | `suggestNextLoad` já coberto; manter verde. |
| Regressão | Re-seed é idempotente: rodar `seedDatabase()` 2x não duplica e não derruba sessões existentes (mock/local). |

## 9. Fora de escopo (desta onda)

- Templates dos ciclos `variacao`/`hipertrofia`/`refinamento` (ajuste futuro rápido).
- Telas novas, gifs/vídeos dos exercícios novos (reaproveita o padrão atual de descrição
  textual; mídia entra no polimento geral).
- Confirmação física da polia baixa (ação da usuária; fallback de caneleira cobre o risco).

## 10. Critérios de aceite

- Os 12 exercícios aparecem na biblioteca com técnica, erros comuns e nível de exposição.
- Os 5 treinos da semana refletem as trocas da seção 6.
- Todo exercício mostra a seção "Dicas pra maximizar"; exercícios com carga mostram um
  **peso sugerido inicial** já no primeiro uso (antes de qualquer histórico).
- Conta existente recebe o conteúdo novo após o bump de versão, com histórico de cargas
  preservado.
- `npm test` passa.
