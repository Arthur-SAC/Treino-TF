# Análise de Pitch (Web Audio) — medir a voz dentro do app

**Data:** 2026-06-11
**Status:** Spec aprovado para implementação
**Foco:** #3b de 3 (sub-projeto de "Voz + feminização não-corporal")

---

## 1. Resumo

Hoje o app **manda usar um app externo** ("Vocal Pitch Monitor") pra medir a frequência da voz.
Este sub-projeto traz a medição pra dentro: um **medidor de pitch ao vivo** durante o exercício
(microfone → Web Audio), uma **meta de pitch** configurável (faixa feminina, default 165-220 Hz),
e a **frequência média estimada de cada gravação** salva junto dela. Também conserta um risco
real: as **gravações de voz não entram no backup** (perdíveis numa troca de celular).

## 2. Contexto

- `voz-pitch-target` (`src/data/voice-seed.ts`) cita 165-220 Hz e recomenda app externo — a
  medição é 100% delegada e subjetiva.
- `VoiceDetail.tsx` já grava áudio real (`getUserMedia` + `MediaRecorder` → `db.voiceRecordings`).
  Falta análise.
- `VoiceRecording` (`db.ts:264`) não tem campo de pitch; `VoiceRecordings.tsx` lista plana sem Hz.
- `Settings.tsx` (export, linhas ~55-68) **não inclui** `voiceRecordings`, `voicePracticeLogs`,
  `practiceLogs` nem `milestones` — perda de dados no backup.

**Restrição de teste (honesta):** happy-dom (ambiente Vitest) **não tem Web Audio nem microfone**.
Logo: o *algoritmo* de detecção de pitch é testado com onda sintética; o medidor ao vivo, a
análise da gravação real e o backup com áudio precisam de **verificação manual no aparelho**.

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Algoritmo | Autocorrelação (cwilso) em lib pura | Sem dependência; testável com onda sintética. |
| Meta de pitch | Faixa low/high em `settings` (165/220) | Voz fem é faixa, não ponto; feedback "grave/alvo/agudo". |
| Medição ao vivo | Componente `PitchMeter` atrás de botão (gesto p/ mic) | Permissão de microfone exige gesto do usuário. |
| Pitch da gravação | `avgPitchHz?` em `VoiceRecording`, calculado ao salvar | Sem índice → sem bump de schema Dexie. |
| Backup | Incluir voiceRecordings (base64) + voicePracticeLogs + practiceLogs + milestones | Protege o ativo mais valioso da voz. |
| Análise de áudio gravado | `decodeAudioData` + janelas → média | Estimativa robusta o suficiente pra tendência. |

## 4. Arquitetura

### 4.1 Lib pura (testável) — `src/lib/pitch.ts`
- `detectPitchHz(buffer: Float32Array, sampleRate: number): number | null` — autocorrelação com
  interpolação parabólica; retorna `null` em silêncio (RMS baixo) ou fora da faixa plausível de
  voz (50-500 Hz).
- `classifyPitch(hz, lowHz, highHz): "grave" | "alvo" | "agudo"`.
- `averagePitchHz(values: Array<number | null>): number | null` — média dos válidos, `null` se
  nenhum.

### 4.2 Util de áudio (browser, sem unit test) — `src/lib/pitch-audio.ts`
- `analyzeRecordingPitch(blob: Blob): Promise<number | null>` — `AudioContext.decodeAudioData`,
  fatia o canal 0 em janelas de 2048 (hop 1024), roda `detectPitchHz` por janela, devolve
  `averagePitchHz`. Trata erro/decode falho retornando `null`.

### 4.3 Componente — `src/components/PitchMeter.tsx`
- Props: `targetLowHz`, `targetHighHz`. Botão liga/desliga o microfone. Quando ligado:
  `getUserMedia` → `AudioContext` → `AnalyserNode` (fftSize 2048) → loop `requestAnimationFrame`
  lendo `getFloatTimeDomainData` → `detectPitchHz` → estado. Mostra Hz atual + rótulo colorido
  (`classifyPitch`) e a faixa-alvo. Cleanup no unmount (para tracks, fecha contexto, cancela rAF).

### 4.4 Schema
- `src/lib/db.ts` — `VoiceRecording` ganha `avgPitchHz?: number`. **Sem bump de versão Dexie**
  (campo não indexado).

### 4.5 Settings
- `voicePitchTargetLowHz` (165) e `voicePitchTargetHighHz` (220) em `settings-helpers.ts` +
  `useSetting.ts` (DEFAULTS nos dois). Campos de edição no card "Voz" de `Settings.tsx`.

### 4.6 Fiação
- `VoiceDetail.tsx` — seção `PitchMeter` ao vivo (lê os settings); ao salvar a gravação
  (`mr.onstop`), chama `analyzeRecordingPitch(blob)` e grava `avgPitchHz`.
- `VoiceRecordings.tsx` — mostra `~Hz · rótulo` por gravação (quando houver).
- `Settings.tsx` — backup passa a incluir voiceRecordings (base64) + voicePracticeLogs +
  practiceLogs + milestones (export e import).

## 5. Fórmula/algoritmo

Autocorrelação clássica (cwilso `PitchDetect`): trim por amplitude, ACF, primeiro vale, pico,
interpolação parabólica, `f = sampleRate / T0`. Guardas: `RMS < 0.01` → `null`; resultado fora
de `[50, 500] Hz` → `null`.

## 6. Testes

| Tipo | Cobertura |
|---|---|
| Unidade | `detectPitchHz`: onda senoidal de 200 Hz @44100 → ~200 (±5 Hz); 150 Hz → ~150; silêncio (zeros) → `null`. |
| Unidade | `classifyPitch`: grave/alvo/agudo nos limites; `averagePitchHz`: ignora nulls, `null` se vazio. |
| Unidade | settings: defaults 165/220; persistência. |
| Manual (aparelho) | medidor ao vivo mostra Hz coerente; gravação salva com `avgPitchHz`; backup exporta/importa gravações de voz. |

## 7. Fora de escopo

- Streak/comparação A-B de gravações (era da frente "Acompanhamento", não selecionada).
- Análise de ressonância/formantes (pitch só; ressonância segue por instrução textual).
- Backup de `looks` (blob de imagem de schema incerto) — fica como gap conhecido, fora deste passo.

## 8. Critérios de aceite

- `detectPitchHz` mede ondas sintéticas corretamente (testes verdes).
- VoiceDetail tem medidor de pitch ao vivo e salva `avgPitchHz` nas gravações.
- VoiceRecordings mostra o Hz médio e se está na faixa-alvo.
- Meta de pitch configurável em Settings; backup inclui as gravações de voz.
- `npm test` e `npm run build` passam (a parte de áudio fica para verificação manual).
