# Fatia 1 — Conteúdo completo e coerente: Treino + Hoje

**Data:** 2026-06-15
**Pilar:** Treino + tela Hoje (primeira de uma série; Beleza, Corpo e Trilha virão depois)

## Problema

A informação do app está **fragmentada e incompleta**: regras moram num módulo mas não são reforçadas onde a usuária age, falta o "como fazer certo", falta o "porquê" e faltam expectativas realistas. No pilar Treino isso aparece como: tarefas sem propósito visível, ausência de orientação de segurança/dor, progressão sem critério explicado, números de série/reps inconsistentes entre biblioteca e sessão, e exercícios de polia que a academia da usuária não comporta.

Contexto da usuária: mulher trans em transição, TRH adiada por fertilidade, objetivo corpo ampulheta / glúteo-prioritário. Academia de prédio com leg press, abdutora, halteres, caneleira, barra, multiestação, polia alta e baixa (a **baixa é curta** e inviabiliza coice/pull-through/abdução no chão), espaldar, bola, step; sem Smith.

## Princípio de solução (escolhido)

**Híbrido:** avisos críticos embutidos no fluxo + cards recolhíveis "Entenda/Antes de começar" para contexto. Reaproveitar `GuideAccordion` (já existe). Conectar cada tarefa ao objetivo da usuária ("pra quê isto serve no meu corpo").

## Escopo desta fatia

### 1. Propósito da sessão (ideia da usuária) ⭐
- Novo campo opcional `purpose: string` em `WorkoutTemplate` (`src/lib/db.ts`). Campo não-indexado → **não exige migração de schema**, apenas popular no seed.
- Popular em `src/data/workout-plan-seed.ts` e nos templates de `src/data/cycles-seed.ts`: cada treino recebe uma frase curta conectada ao objetivo. Ex.: *"Hoje é glúteo pesado — volume pra dar forma ao quadril e levantar o bumbum (a base que a TRH vai preencher depois)"*; *"Hoje afina a cintura e ativa o core, sem engrossar"*.
- Exibir em **dois lugares**:
  - Tela **Hoje** (`src/pages/Today.tsx`): no card do treino do dia, como subtítulo/nota.
  - **Sessão** (`src/pages/workout/SessionDetail.tsx`): em destaque no topo, abaixo do nome.

### 2. Cards de Hoje conectados ao objetivo
- Em `src/pages/Today.tsx`, adicionar micro-frase de propósito (campo `note`) aos cards do pilar treino/expressão: **Movimento**, **Postura**, **Apresentação**, **Caminhada**. Ex.: Postura → *"alinhamento que feminiliza a silhueta na hora"*.
- Skincare e Voz ficam **fora** desta fatia (entram na fatia Beleza), pra não misturar.

### 3. Segurança & aquecimento (card recolhível "Antes de começar")
- No topo de `SessionDetail.tsx`, um `GuideAccordion` com: lembrete de aquecer (referenciando o "Aquecimento articular geral"/"Cardio leve" que já existem no catálogo) e a **regra de ouro da dor**: *queimação/fadiga muscular = ok; dor aguda, articular ou fisgada = pare na hora*.
- Resolve o "o que faço se doer" de forma central, sem editar os ~50 exercícios.

### 4. Quando aumentar a carga (progressão explicada)
- Card recolhível em `src/pages/workout/ProgressionHistory.tsx` com o critério prático: *"Completou todas as séries e reps com forma boa e sobrou fôlego → suba o menor incremento (1–2 kg ou o próximo furo). Se não fechou as reps com forma, mantém a carga."*
- Apenas explica o que a lógica de `src/lib/progression.ts` já faz.

### 5. Coerência de séries/reps (fonte única)
- A **sessão é a fonte de verdade**. Em `src/pages/workout/ExerciseDetail.tsx`, rotular os números vindos da biblioteca como "faixa de referência" e indicar *"os números do seu dia estão na sua sessão"*, eliminando a contradição percebida.

### 6. Ajustes menores
- Explicar **"exposição X/5"** onde aparece (`ExerciseDetail.tsx` / `ExerciseLibrary.tsx`): legenda curta do que o nível significa (quão "à mostra"/avançado é o exercício).
- Novo campo opcional `successCue?: string` em `Exercise` (`db.ts`), preenchido nos exercícios de glúteo prioritários (ex.: *"fez certo se sentir o glúteo, não a lombar"*). Exibir em `ExerciseDetail.tsx` e no `SessionRecorder`.

### 7. Troca dos exercícios de polia baixa
A polia baixa é curta e inviabiliza os movimentos baixos. Substituir **apenas os baixos**; manter `face-pull-polia` e `crucifixo-polia` (polia alta funciona).

| ID atual | Substituto | Equipamento |
|---|---|---|
| `coice-gluteo-polia` | `kickback` (coice em 4 apoios com caneleira) ou `kickback-cabo` (em pé com caneleira) | caneleira / espaldar |
| `pull-through-polia` | stiff com halteres/barra ou good morning (usar exercício existente equivalente; criar se faltar) | halteres / barra |
| `abducao-quadril-polia` | máquina abdutora (já no catálogo) ou abdução com caneleira | abdutora / caneleira |

- Atualizar as referências em `src/data/workout-plan-seed.ts` e `src/data/cycles-seed.ts`.
- Verificar que os exercícios-substitutos existem em `src/data/exercises-seed.ts`; se algum faltar (ex.: good morning), criá-lo com mesmo padrão (descrição, erros, proTips, vídeo).
- Manter as `notes` motivacionais equivalentes ("pico de glúteo", "dobradiça de quadril").

### 8. Tela "Até onde dá pra chegar" (horizontes realistas)
- Nova página com **três horizontes honestos e motivadores**, baseada na análise real:
  - **Sem TRH (agora):** corpo mais atlético, cintura mais marcada, glúteo maior e **firme**; gordura não migra; WHR realista ~0.83–0.85; maior ganho imediato = perder a barriga. Vantagem da usuária: ombros de largura moderada.
  - **Com TRH:** redistribuição de gordura (abdômen → quadril/coxa/glúteo/peito); o glúteo treinado agora vira base; WHR ~0.75–0.78; mama glandular modesta.
  - **Com BBL + prótese:** teto estético; ampulheta plena; WHR ~0.65–0.70; melhor resultado sobre glúteo já treinado.
  - Fio condutor: **perder barriga + construir glúteo agora é pré-requisito de tudo** — melhora o presente e multiplica TRH/cirurgia.
- Tom: sincero (não iludir) + encorajador. Deixar claro que os números de WHR são estimativas.
- Acesso: card/entrada em `src/pages/workout/WorkoutHome.tsx` (rota nova, ex.: `/treino/horizontes`). Conteúdo estático em um seed/const, exibido com `GuideAccordion` ou seções.

## Fora de escopo (próximas fatias)
- Equipamento alternativo genérico por exercício (além da polia).
- Contexto de Kegel/dança, avisos de lesão em dança, critério de avanço de ciclo conectado a medidas.
- "Sem TRH" nos demais pilares; conteúdo de Beleza, Corpo e Trilha.

## Critérios de aceite
- A tela Hoje mostra, no card do treino do dia, **o que aquela sessão faz pelo objetivo**.
- A sessão mostra propósito no topo e o card "Antes de começar" com a regra da dor.
- Nenhum exercício de polia **baixa** permanece no plano/ciclos; substitutos existem e fazem sentido com o equipamento.
- Existe a tela "Até onde dá pra chegar" com os três horizontes, acessível a partir de Treino.
- `npm run build`/typecheck passam; seeds populam sem erro (campos novos opcionais não quebram dados existentes).

## Notas de implementação
- Campos novos (`purpose`, `successCue`) são opcionais → sem migração Dexie; o reseed popula.
- Reaproveitar `GuideAccordion` para todos os cards recolhíveis.
- Manter a paleta amazona / classes existentes (`card`, `text-nude`, etc.).
