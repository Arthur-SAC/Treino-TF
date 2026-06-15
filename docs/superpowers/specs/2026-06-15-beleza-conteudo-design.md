# Fatia 2 — Conteúdo completo e coerente: Beleza

**Data:** 2026-06-15
**Pilar:** Beleza (skincare, clareamento, depilação, cabelo, unhas, voz, estilo, maquiagem)
**Princípio (já aprovado):** híbrido — avisos críticos embutidos no fluxo + cards recolhíveis (`GuideAccordion`) pro contexto; cada orientação autossuficiente (sem obrigar a cruzar módulos); tom sincero; quando relevante, deixar explícito o contexto "sem TRH". Disclaimers via `DisclaimerCard` onde houver risco (ácidos/mucosa).

Contexto: mulher trans, TRH adiada por fertilidade. Dor original da usuária: informação espalhada (ex.: FPS está na rotina da manhã mas a regra "todo dia, inegociável" só aparece no Clareamento).

## Itens (do diagnóstico)

### Alta
1. **FPS reforçado onde se aplica.** A rotina "Rosto · manhã" já inclui FPS, mas a regra de que protetor é **inegociável todo dia, mesmo sem clareamento ativo e mesmo em casa** não aparece ali. Adicionar destaque na `SkincareHome` (card recolhível "A regra de ouro da pele") e uma nota curta no passo de FPS da rotina matinal. Fonte: `skincare-routines-seed.ts`, `clareamento-guide-seed.ts:24`.
2. **Ácidos × depilação.** Nenhum aviso de compatibilidade. Adicionar em `foliculite-guide-seed.ts` (seção de técnica de barbear/depilação): "não raspe/depile com lâmina 12–24h após ácido potente (glicólico/retinol); separe (raspar de manhã, ácido à noite)".
3. **Clareador axilar × desodorante (durante o dia).** A rotina axilar diz "sem desodorante à noite", mas é silenciosa sobre o dia. Adicionar passo/nota: desodorante normal de dia; só evitar aplicar por cima do clareador úmido (esperar ~2–3h após secar).
4. **Estilo discreto com produtos concretos.** Os níveis citam "bálsamo com cor" etc. sem marcas; outros módulos (maquiagem) são específicos. Adicionar produtos/marcas brasileiras concretas por nível em `estilo-discreto-seed.ts` e/ou referência cruzada às rotinas de Maquiagem.

### Média
5. **Cabelo × proteção UV.** `hair-guide-seed.ts` não menciona sol. Adicionar bullet na seção de retenção: UV danifica e desbota cachos abertos → boné/leave-in com FPS em exposição longa.
6. **Foliculite ↔ clareamento acoplados.** Depilação agressiva encrava → inflama → mancha; clareador sozinho não resolve. Adicionar em `clareamento-guide-seed.ts` (por área, axila/virilha) a conexão explícita com o módulo Depilação (laser ataca pelo + encravado + futura mancha).
7. **Unhas: frequência de lixamento.** `nails-guide-seed.ts` não diz cadência. Adicionar: lixar a cada 3–4 dias, num sentido só; não lixar todo dia (enfraquece a borda).
8. **Voz: cronograma semanal.** `voice-seed.ts`/VoiceHome dizem "15 min/dia" sem dizer o que fazer cada dia. Adicionar cronograma sugerido (aquecimento + passing diário; sensual/articulação 2–3×/semana) e o **contexto honesto sem TRH**: voz não muda por hormônio, muda por treino (pitch + ressonância) — expectativa realista.

### Baixa
9. **Maquiagem ↔ estilo discreto.** Pontes entre níveis discretos (2–3) e as rotinas "Diário"/"Trabalho" de Maquiagem.
10. **Depilação: intervalo entre sessões de laser.** Adicionar "~4–6 semanas entre sessões" no guia de depilação/foliculite.

## Critérios de aceite
- A regra do FPS ("todo dia, inegociável") aparece no fluxo de skincare, não só no Clareamento.
- Avisos de compatibilidade ácido×depilação e clareador×desodorante presentes e claros.
- Estilo discreto cita produtos concretos; cabelo menciona UV; unhas e voz têm cadência; voz tem o recado honesto sem TRH.
- `npm test` e `npm run build` passam; novos guias seguem o formato `GuideSection` e são cobertos por teste de dados quando estruturados.

## Fora de escopo
- Reestruturar navegação da Beleza (duplicação Maquiagem/Voz nas abas) — tratar separado, é UX não conteúdo.
