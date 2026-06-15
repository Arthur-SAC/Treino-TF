# Intimidade & Sensualidade — Movimento

**Data:** 2026-06-15
**Módulo:** Movimento (`src/pages/workout/MovementHome.tsx`, `src/data/sequences-seed.ts`, `src/lib/db.ts`)
**Princípio (aprovado):** híbrido — nova seção `intimidade` para as sequências aplicadas + guia que conecta o conteúdo existente + andar com gingado dentro de `sensual`. Tom frânco e adulto, consensual, matched com a voz clínica-acolhedora que o app já usa em "Flexibilidade pra vida íntima" e "PC + movimento de quadril".

## Contexto

Usuária: mulher trans (genitália masculina, TRH adiada), em relação com a namorada. O propósito real de toda a parte de mobilidade/flexibilidade/dança é **ser flexível e sexy nos momentos íntimos** — tanto numa pegada passiva (ser posicionada confortavelmente) quanto ativa (cavalgar por cima, com penetração da parte dela quando possível, ou grinding região-contra-região). Hoje esse conteúdo existe mas está organizado por modalidade (mobilidade, dança, twerk…) e não explicita o propósito nem cobre as capacidades específicas desses objetivos.

## Honestidades técnicas (precisam aparecer no conteúdo)

- **Cavalgar penetrando** depende de mais que flexibilidade: manter ereção na posição de montaria (pélvis em anteversão + quadril alto comprimem e dificultam) e o **alinhamento com a posição da parceira** — não é só o corpo dela. O **grinding (descer e esfregar)** é o plano mais universalmente alcançável e controlável.
- **W-sit / montaria ajoelhada** depende de rotação interna de quadril + flexão profunda de joelho; parte é treinável, parte é osso (anteversão femoral). Quase todo mundo chega numa versão; o W perfeito não é garantido. Força o lado interno do joelho — pose/treino pontual, não posição padrão por horas.
- Aquecer antes; parar se doer (joelho/lombar); comunicação e consentimento com a parceira são parte da prática.

## Escopo

### 1. Estrutura
- Adicionar `"intimidade"` ao union `DanceSequence.category` em `src/lib/db.ts`.
- Nova seção em `MovementHome.tsx`: **"Intimidade · flexibilidade e sensualidade a dois"**, renderizada com `SequenceCard` como as demais. Posição: depois de `sensual`.
- Guia recolhível (`GuideAccordion`) no topo dessa seção, com: mapa do que já serve (flexibilidade-intima, pelvic, twerk, dança) + as honestidades técnicas + aquecimento/consentimento/parar se doer.
- Andar com gingado entra na categoria **`sensual`** (não cria categoria nova pra ele).

### 2. Três sequências novas em `intimidade`
1. **"Cavalgar com controle"** (ativa) — montaria ajoelhada (sentar sobre os pés abertos, base do W) com resistência progressiva; báscula pélvica (anteversão↔retroversão) controlada; empurrão de quadril a partir de glúteo+core; mobilidade de flexor de quadril. Nota honesta embutida sobre penetração vs. grinding.
2. **"Grinding pélvico"** (ativa/sensual) — rebolado, figura 8 e onda corporal aplicados como atrito controlado em três bases (deitada por cima, sentada por cima, de quatro). Ritmo lento, pélvis "pra baixo e pra frente". Reaproveita a mecânica que ela já treina em dança/twerk.
3. **"Flexibilidade passiva a dois"** (passiva) — adutor profundo (borboleta→pancake), isquios (pernas pra cima/atrás), abertura de quadril (frog, happy baby), coluna. Versão "alvo" orientada a ser posicionada confortável por mais tempo.

### 3. Andar com gingado (em `sensual`)
Sequência leve partindo da "Caminhada feminina": molejo nos joelhos → transferência de peso com queda de quadril no ritmo → pé na linha com balanço → contra-rotação leve de ombro → praticar com música → dose discreta pro dia a dia.

### 4. Decisões de formato
- Sequências `intimidade` são **standalone** (capability-oriented, repetíveis), no padrão das de `mobilidade` — não multi-semana. "Flexibilidade passiva a dois" pode referenciar a trilha progressiva de `flexibilidade` que já existe.
- Cada sequência segue o tipo `DanceSequence`: `id`, `name`, `category`, `level`, `durationMin`, `focus`, `moves: DanceMove[]` (cada move: `name`, `description`, `durationSec`, `repeat?`). Categoria nova exige atualizar o union em `db.ts` **e** o teste `tests/lib/movement-seed.test.ts` se for asseverar contagem.

## Fora de escopo (desta fatia)
- **Revisão de consolidação da rotina diária** (fundir cardio/esteira/mobilidade pra não duplicar esforço) — pedido explícito da usuária, mas é uma análise separada que depende de olhar a rotina inteira (treino, cardio, dança, mobilidade, pele). Fica como **fatia seguinte**, após esta.
- Mudar o player de sequências, o schema de `practiceLogs`, ou a lógica de `SequenceCard`.

## Critérios de aceite
- Nova categoria `intimidade` no tipo e seção visível no Movimento com as 3 sequências + guia.
- Andar com gingado disponível em `sensual`.
- Conteúdo carrega as honestidades técnicas (penetração/grinding, W-sit/joelho, aquecer/consentir).
- `npm test` e `npm run build` passam; `tests/lib/movement-seed.test.ts` atualizado pra cobrir a categoria `intimidade` (contagem + moves não-vazios), mantendo as asserções existentes de `flexibilidade`/`twerk`/`apresentacao`.
