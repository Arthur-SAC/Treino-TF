# Rotina consolidada do dia

**Data:** 2026-06-15
**Telas/arquivos:** `src/pages/Today.tsx` (principal), `src/lib/notification-scheduler.ts`, settings (`src/lib/db.ts` defaults / `Settings.tsx`), dados de cuidados (skincare/cabelo/unhas/clareamento/depilação) só para classificação, não reescrita.
**Princípio (aprovado):** organizar o dia em poucos blocos coerentes, eliminando duplicação (esteira dupla) e cobrança fragmentada. Estética: **sem emoji** — usar a tipografia que o app já tem (cabeçalhos `uppercase tracking-wider`, glifo `✦` para destaque).

## Problema

Hoje a tela "Hoje" empilha ~10 cartões, cada um marcado "pendente/destaque", cobrando isoladamente: Treino, Caminhada (cardio separado), Movimento, Postura, Apresentação, Skincare manhã, Skincare noite, etc. Além disso a esteira aparece **duas vezes**: 5–7 min de aquecimento dentro do treino (`workout-plan-seed`) + meta diária de Caminhada zona 2 (~30 min). A usuária quer menos blocos **e** menos tempo, no formato que ela mesma descreveu.

## Forma desejada (3 blocos + apoio)

### Bloco 1 — Cuidados ao acordar
Cuidados de beleza com encaixe matinal, agrupados sob um cabeçalho próprio:
- Skincare manhã (diário, já tem `time: "morning"`).
- Cabelo — finalização/penteado do dia.
- Maquiagem (se for sair).
- (opcional) Look do dia / estilo.

### Bloco 2 — Treino + cardio (1 bloco, esteira uma vez)
- A **Caminhada zona 2 (~30 min)** deixa de ser cartão/lembrete separado e vira o **finalizador do treino**, na mesma ida à academia: aquece curto → levanta peso → fecha com a zona 2 na mesma esteira.
- O cartão de Treino passa a representar "Treino + cardio zona 2" como um bloco único; registrar o cardio aí satisfaz a meta de caminhada (sem nag duplicado).
- *Honestidade fisiológica (exibida):* o cardio longo vem **depois** de levantar (antes fatigaria as pernas e prejudicaria o glúteo) — por isso "finalizador", não aquecimento.

### Bloco 3 — Antes de dormir
Dois agrupamentos sob o mesmo cabeçalho noturno, ambos opcionais:
- **Cuidados da noite:** Skincare noite; Clareamento (nos dias da onda); Cabelo — tratamento do cronograma (nos dias certos); Unhas — lixar (cadência ~3–4 dias); Depilação (na cadência).
- **Presença & intimidade:** postura, andar/gingado, dança, mobilidade + sequências de `intimidade`. Sugestão leve do dia (ex.: "hoje: gingado"), sem marcar como obrigação.
- Voz: não é cuidado de manhã/noite — entra aqui como prática **opcional** do bloco noturno de presença (não em Cuidados).

### Apoio (sem destaque agressivo)
Hidratação, refeições e diário permanecem na tela como apoio, em variante neutra (sem `highlight` competindo com os 3 blocos).

## Comportamento de cobrança (cadência + nags)

- Cada item de cuidado por cadência aparece **em destaque quando a cadência bate naquele dia, onde o app já rastreia isso** (ex.: skincare por log diário); onde não há rastreamento de "última vez" por módulo, fica como **link discreto com a nota de cadência** ("a cada 3–4 dias"), sem destaque nem nag — não criar tracking novo só pra isso nesta fatia. Skincare manhã/noite seguem diários.
- **Lembretes:** trocar os toques separados de Postura e Caminhada (horário fixo) por **um único lembrete noturno** de presença (novo setting `presencaReminderTime`, default ~21:00). Skincare manhã/noite seguem com seus lembretes. Pausas ativas e hidratação seguem como estão.
- O resto do dia fica livre de cobrança; o bloco de presença é opt-in.

## Mapeamento de tempo dos cuidados (classificação estática)

| Cuidado | Quando | Cadência |
|---|---|---|
| Skincare | manhã + noite | diário |
| Cabelo (finalização) | manhã | diário leve |
| Cabelo (tratamento/cronograma) | noite | semanal |
| Maquiagem | manhã | se for sair |
| Estilo / look | manhã | diário, opcional |
| Clareamento | noite | onda |
| Unhas (lixar) | noite | ~3–4 dias |
| Depilação | noite | onda |
| Voz (prática) | noite (presença) | opcional |

## Escopo de implementação

1. **`Today.tsx`** — reorganizar em três seções com cabeçalhos tipográficos ("Cuidados ao acordar", "Treino + cardio", "Antes de dormir") + apoio. Fundir o cartão de Caminhada no bloco de treino (cardio finalizador; bater cardio conta a meta). Agrupar postura/movimento/apresentação/andar + intimidade num único cartão "Antes de dormir" em vez de 3–4 cartões. Reduzir variantes `highlight` concorrentes a no máximo o foco do dia + o que está realmente pendente no bloco atual.
2. **`notification-scheduler.ts`** — adicionar lembrete noturno único de presença (`shouldRemindOncePerDay`, considera "feito" se qualquer prática de presença foi registrada hoje). Remover/silenciar os toques fixos separados de Postura e Caminhada.
3. **Settings/defaults** — adicionar `presencaReminderTime`; aposentar (ou repurposar) `posturaReminderTime` e `walkReminderTime`. Atualizar `Settings.tsx` se expõe esses campos.
4. Sem alteração de cálculo/treino: os templates de treino **não** são reescritos exercício a exercício — o cardio entra por wording/apresentação como finalizador.

## Fora de escopo
- Rebalancear o plano de treino ou a fisiologia das cargas.
- Criar páginas novas de cuidado; reaproveitar as rotas existentes (`/beleza/...`).
- Mexer em hidratação/refeições/diário além de baixar o nível de destaque.

## Critérios de aceite
- Tela "Hoje" mostra os 3 blocos (Cuidados ao acordar / Treino + cardio / Antes de dormir) + apoio, sem emoji.
- Caminhada não aparece mais como bloco separado cobrando; cardio é finalizador do treino e contar o cardio satisfaz a meta diária.
- Práticas de presença agrupadas num cartão noturno, com lembrete único à noite; sem nags fixos separados de postura/caminhada.
- Cuidados (pele/cabelo/unhas/clareamento/depilação) classificados em manhã/noite; destaque quando o app já sabe a cadência, senão link discreto com a nota — sem criar tracking novo.
- `npm test` e `npm run build` passam; lógica nova (ex.: "feito hoje" da presença, contagem de cardio→meta) coberta por teste.
