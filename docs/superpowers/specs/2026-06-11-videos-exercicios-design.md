# Vídeos dos exercícios — player de link dentro do app

**Data:** 2026-06-11
**Status:** Spec aprovado para implementação
**Foco:** feature avulsa (pedido da usuária; ver memória `feature-exercise-videos`)

---

## 1. Resumo

Permite **colar um link de vídeo** (YouTube etc.) em cada exercício de treino e cada sequência
de movimento/alongamento, e **assistir dentro do app** (player embutido) além da descrição em
texto. O schema já tem `videoUrl?` em `Exercise` e `DanceSequence`. Também protege esse link de
ser apagado num futuro re-seed de conteúdo.

## 2. Contexto

- `Exercise` (`db.ts`) e `DanceSequence` já têm `videoUrl?` (hoje só um `<a>` "Ver vídeo →" em
  `ExerciseDetail.tsx:69` e `SequenceDetail.tsx:55`).
- Decisão da usuária: **link colado** (YouTube etc.), não arquivo local — assumindo que essa
  parte precisa de internet (abre mão do offline só aqui).
- **Risco de perda:** `seedDatabase` (`seed.ts:56-62`) e `seedMovement` (`movement-seed.ts:20-27`)
  fazem `put()` de TODOS os itens quando a versão de seed sobe — sobrescrevendo o `videoUrl` que
  a usuária colar. Precisa preservar.

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Fonte | Link colado pela usuária por item | Escolha da usuária; popular sob demanda. |
| Player | `<iframe>` p/ YouTube, `<video>` p/ arquivo direto, senão link | Cobre os casos comuns sem libs. |
| Persistência | `db.exercises.update` / `db.danceSequences.update` | As telas leem do IndexedDB. |
| Escopo | Treino (exercícios) + Movimento (sequências) | "exercícios, alongamentos"; voz fica de fora. |
| Re-seed | Preserva `videoUrl`/`gifPath` existentes | Não apagar o link num update de conteúdo. |

## 4. Arquitetura

### 4.1 Lib pura (testável) — `src/lib/video.ts`
- `toEmbed(url): { kind: "youtube" | "video" | "link"; src: string } | null`:
  - YouTube (`watch?v=`, `youtu.be/`, `shorts/`, `embed/`) → `kind: "youtube"`, `src` = URL de
    embed.
  - Arquivo direto (`.mp4/.webm/.ogg/.mov/.m4v`) → `kind: "video"`.
  - Outro `http(s)` → `kind: "link"`. Não-URL → `null`.

### 4.2 Componentes
- `src/components/VideoEmbed.tsx` — recebe `url`, usa `toEmbed`: renderiza `<iframe>` 16:9
  (YouTube), `<video controls>` (arquivo) ou `<a>` "Abrir vídeo ↗" (link).
- `src/components/VideoSection.tsx` — bloco reusável: mostra o `VideoEmbed` quando há link, e um
  botão "adicionar/editar" que abre um `<input type="url">` + Salvar/Cancelar; chama
  `onSave(url)` (string vazia limpa). Props: `url?`, `onSave`.

### 4.3 Fiação
- `src/pages/workout/ExerciseDetail.tsx` — substitui o `<a>` do fim por `<VideoSection>` perto do
  topo (após o subtítulo), persistindo via `db.exercises.update(ex.id, { videoUrl })`.
- `src/pages/workout/SequenceDetail.tsx` — substitui o `<a>` por `<VideoSection>` no mesmo lugar,
  persistindo via `db.danceSequences.update(sequence.id, { videoUrl })`.

### 4.4 Re-seed preservador
- `src/lib/seed.ts` — no bloco de re-seed por `EXERCISE_SEED_VERSION`, antes do `put`, preserva
  `videoUrl`/`gifPath` do registro existente.
- `src/lib/movement-seed.ts` — na migração por `MOVEMENT_VERSION`, preserva `videoUrl` existente.
  (Sem bump de versão agora — só torna o loop seguro pra futuros bumps.)

## 5. Testes

| Tipo | Cobertura |
|---|---|
| Unidade | `toEmbed`: YouTube (`watch?v=`, `youtu.be`, `shorts`, com `list` antes do `v=`) → embed; `.mp4` → video; link comum → link; string sem URL → null. |
| Smoke | `VideoEmbed` renderiza `<iframe>` pra URL de YouTube. |
| Build | `npx tsc -b` aceita as edições. |

## 6. Fora de escopo

- Vídeo em exercícios de voz (mantém só treino + movimento).
- Upload/gravação de arquivo local (a usuária escolheu link).
- Catálogo de vídeos curados embutidos (sem fonte/licença).

## 7. Critérios de aceite

- ExerciseDetail e SequenceDetail permitem colar/editar um link e assistir embutido.
- O link persiste e sobrevive a um futuro re-seed de conteúdo.
- `npm test` e `npm run build` passam.
