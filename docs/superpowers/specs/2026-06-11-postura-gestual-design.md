# Postura/Gestual à mostra — apresentação feminina no cotidiano

**Data:** 2026-06-11
**Status:** Spec aprovado para implementação
**Foco:** #3a de 3 (sub-projeto de "Voz + feminização não-corporal")

---

## 1. Resumo

As 4 sequências de **gestual feminino** (postura ao sentar, marcha, mãos, olhar) já existem,
mas estão rotuladas como `category: "sensual"` e enterradas no MovementHome — nunca aparecem na
rotação diária. Este sub-projeto as promove a uma categoria própria **"apresentacao"**, ajusta
os nomes pro enquadramento de *passing cotidiano* (não sedução), dá uma seção própria no
MovementHome e um **card "Apresentação" rotativo no Hoje**.

## 2. Contexto

`corporal-postura-sentar`, `corporal-caminhada`, `corporal-gestual-maos`,
`corporal-olhar-expressao` (em `src/data/sequences-seed.ts`) são `category: "sensual"`. A
rotação do Today (`suggestedSeq`, Today.tsx:54-63) cobre dança/mobilidade/pélvico mas **nunca**
as `corporal-*`. Para uma usuária focada em passing diário, marcha e gestual femininos são
alavancas de feminização tão visíveis quanto pele/cabelo, e estão escondidos.

Re-seed: `src/lib/movement-seed.ts` re-aplica `SEQUENCES` (upsert) quando `MOVEMENT_VERSION`
sobe — então recategorizar exige bump de versão (5 → 6) pra valer no banco já populado.

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Categoria | Nova `"apresentacao"` (separada de `"sensual"`) | Passing cotidiano ≠ dança sensual; merece destaque próprio. |
| Nomes | Tirar "sensual/sedutora" dos 4 | Enquadra como apresentação do dia a dia, não sedução. |
| Hoje | Card "Apresentação" rotativo (1 dos 4 por dia) | Surfacing diário sem poluir; mesmo padrão do card de Postura. |
| Conteúdo (moves) | Mantido | Recategorização, não reescrita. |

## 4. Arquitetura

- **`src/lib/db.ts`** — adicionar `"apresentacao"` ao union `DanceSequence.category`.
- **`src/data/sequences-seed.ts`** — nos 4 `corporal-*`: `category: "apresentacao"` e nomes
  ajustados (ver §5).
- **`src/lib/movement-seed.ts`** — `MOVEMENT_VERSION` 5 → 6.
- **`src/pages/workout/MovementHome.tsx`** — nova seção "Apresentação · gestual e postura
  feminina no dia a dia" (filtra `category === "apresentacao"`), posicionada logo após
  Mobilidade. A seção "Sensual" continua (sobram 4 sequências sensual = dança avançada).
- **`src/pages/Today.tsx`** — card "Apresentação" rotativo: escolhe 1 dos 4 ids por
  `dayOfWeek % 4`, com check via `practiceLogs` (mesmo padrão de `posturaDoneToday`).

## 5. Renomeações

| id | antes | depois |
|---|---|---|
| `corporal-postura-sentar` | Postura e como sentar (feminino sensual) | Postura e como sentar |
| `corporal-caminhada` | Caminhada sensual | Caminhada feminina |
| `corporal-gestual-maos` | Gestual de mãos e cabelo | Gestual de mãos e cabelo *(mantém)* |
| `corporal-olhar-expressao` | Olhar e expressão sedutora | Olhar e expressão |

## 6. Testes

| Tipo | Cobertura |
|---|---|
| Conteúdo (Vitest) | os 4 `corporal-*` têm `category: "apresentacao"`; nenhuma sequência `apresentacao` perdeu `moves`. |
| Regressão | ajustar qualquer teste em `movement-seed.test.ts` que conte sequências `"sensual"` (passa de 8 → 4). |
| Build | `npx tsc -b` aceita o novo valor do union. |

## 7. Fora de escopo

- Backup das gravações (vai pro 3b, junto da voz).
- Conteúdo novo de gestual/checklist "mundo real" (possível evolução futura).

## 8. Critérios de aceite

- Os 4 gestuais aparecem numa seção "Apresentação" própria no MovementHome.
- O Hoje mostra um card "Apresentação" rotativo com check diário.
- `npm test` e `npm run build` passam.
