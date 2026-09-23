# Chun-Li macia — reorientar o app para o objetivo real

**Data:** 2026-09-23 · **Branch:** `feat/chun-li-macia`
**Status:** design aprovado em conversa, parte por parte (metas e prazos · treino ·
alimentação/vitalidade/rotina).

## Por que existe

Ela vai começar agora, do zero — desde maio só fez a caminhada de 5 km de vez em
quando, sem treino e sem dieta. O app, porém, conta tudo a partir da medição de
13/05/2026 e já esperaria cintura ~88 hoje. Além disso, o objetivo ficou mais
preciso nesta conversa, e o app descreve um corpo diferente do que ela quer.

**O objetivo, nas palavras dela:** "Chun-Li macia" — "gostosa com músculos",
nada quadrado nem super definido; coxa grossa ("cavalona", "não só bunda");
costas bonitas; quadril e bunda grandes e redondos; "durinha, macia", músculo
aparecendo **de leve** (pode secar um pouco, "levemente marcado"); **glúteo
destacado da coxa, não contínuo** — pensado para lingerie; peito maior "no que
der"; força de braço para levantar a noiva na intimidade.

**Referência visual secundária:** ilustração busto 75 / cintura 58 / quadril 119
(cintura÷quadril 0,49). Comparação de silhuetas em
`imagens/objetivo/silhueta-comparacao-2026-09-23.png` (fora do git).

**O que é impossível e o app diz com essa palavra:** sem estrogênio não há mama
nem gordura macia na lateral do quadril; cintura 58 não existe para o esqueleto
dela em caminho nenhum (piso ~80 natural, ~77-80 com lipo).

## Decisões dela (registradas, não reabrir)

| Tema | Decisão |
|---|---|
| Partida | Recomeça do zero; a partida vira a medição nova dela |
| Dieta | **2.200 kcal** (antes 2.300), proteína 150-160 g, verba 250 kcal/dia mantida |
| Gasto real | Caminhada 5 km **seg-sex**; cães todo dia com NEAT baixo → **2.600-2.800 kcal** (antes 2.900-3.100) |
| Aceleradores | Caminhada 5 km também **sáb e dom**; meta de sono **7-7,5 h**; **creatina 3-5 g/dia** |
| Recusados | Caminhada firme com os cães; BBL condicionado ao corpo (fica **depois dos 30**, set/2029) |
| Treino | **5 × ≤60 min**, redistribuindo volume (não alongar, não 6º dia) |
| Academias | **Fase 1 no prédio; fase 2 numa Smartfit** — fase 2 reescrita só quando ela trocar |
| BBL | Fim da fase discreta, de propósito; talvez TRH depois. Decisão dela, não espera |

## Parte 1 — metas e prazos

### 1.1 Partida re-ancorada — automática, pela primeira medição dela
Ela não tem como medir agora e quer começar a treinar já. Então a partida **não é
escrita no código**: é derivada do aparelho.
- Nova constante `RECOMECO_DATA = "2026-09-23"` em `objetivo.ts`. A **partida
  real** é a primeira medição registrada com data ≥ `RECOMECO_DATA` (lida do
  IndexedDB por um hook, ex. `usePartida()`; a regra de escolha é função pura
  testada). `MEDIDAS_PARTIDA` (13/05/2026) vira histórico e deixa de ancorar
  prazo.
- **Com partida:** prazos em **mês de calendário** a partir da data dela (função
  pura, ex. `mesesParaCalendario(inicio, mesMin, mesMax)`); **peso-alvo da fase
  1 derivado da massa magra** dela (Navy androide, `body-composition.ts`) em vez
  de 82 fixo — faixa de %G-alvo declarada em `objetivo.ts`; ritmo estimado a
  partir do peso real e do déficit de `CONSUMO`.
- **Sem partida:** telas que citam prazo ou peso-alvo mostram "aparece depois da
  sua primeira medição" — nunca prazos contados de maio. O Hoje mostra um card
  pedindo a medição (peso, cintura na altura do umbigo, pescoço obrigatórios para
  o cálculo; o resto opcional).
- Metas em cm (cintura 84, piso 80, trava 88) não dependem da partida.
- Textos de seed que hoje interpolam `MEDIDAS_PARTIDA` (`tamanhos-seed.ts`,
  `vitalidade-guide-seed.ts`) passam a citar a partida quando existir ou uma
  formulação sem número; conferir cada um.

### 1.1b Entregas
- **Entrega 1 (primeiro):** parte 2 (treino) + parte 3 (cardápio, vitalidade,
  Hoje) — nada disso depende de medida; publicar assim que pronto.
- **Entrega 2:** parte 1 (partida automática, fases, horizontes, consumo).
  `CONSUMO` (1.2) entra na entrega 1 junto com o cardápio, porque o déficit e a
  verba de comer fora leem dele.

### 1.2 Consumo
`CONSUMO`: `gastoEstimadoKcalMin: 2600`, `gastoEstimadoKcalMax: 2800` (comentário
refeito: caminhada seg-sex + sáb/dom, cães NEAT baixo, força 5x), `metaKcal:
2200`. `comer-fora.ts` já deriva déficit e verba — só conferir textos/testes.

### 1.3 Fases
| Fase | Duração | Peso | Cintura / quadril | Nota |
|---|---|---|---|---|
| 1 · Tirar a barriga | ~5,5-6 meses | → ~82 | 84 / ~106 | déficit 2.200; ~0,45-0,6 kg/sem |
| 2 · Construir | até ~mês 21-27 | → 84-87 | 82-84 / 114-116 | glúteo destacado, coxa, peito superior, costas |
| 3 · Marcar de leve | 2-3 meses | −2 a −3 kg | ~82 / ~114 | **não acontece** se BBL agendado |

`FASES` ganha `fase-3` (o tipo `id` cresce). `MARCOS_CINTURA` (88 destrava
superávit; 84 fim da fase 1) mantidos, com meses recalculados. `CINTURA_PISO_CM
= 80` e `CINTURA_LIBERA_SUPERAVIT_CM = 88` mantidos. Números exatos de peso da
fase 1 dependem da partida nova.

### 1.4 Horizontes (`src/data/horizontes-seed.ts`)
- **Trilha 1** reescrita para "Chun-Li macia com glúteo destacado": perna forte,
  glúteo projetado com dobra e degrau, costas com postura, peito cheio em cima,
  pele lisa com músculo que aparece ao contrair. Diz o que não vem sem hormônio
  ou cirurgia. Tetos: natural 0,72-0,76.
- **Peito:** sem estrogênio não há mama; o que dá é peitoral superior/medial +
  postura + sutiã; e a gordura do peito cai na fase 1, então o peito pode
  encolher antes de o músculo compensar.
- **Cirurgia** reescrita: lipo 360 (com lombar) + BBL com preenchimento lateral
  (implante de mama opcional, mesmo horizonte) → ~0,62-0,66. Condições: máximo
  natural atingido, peso estável ~6 meses, parar de secar antes, 2-3 semanas sem
  sentar sobre o glúteo, cirurgião SBCP, hospital, perguntar a camada da injeção
  (só subcutânea). Mortalidade historicamente a mais alta entre estéticas.
  Depois dos 30 por decisão dela. Marca o fim da fase discreta; TRH talvez
  depois — dito como decisão, nunca como espera.
- **Linha do tempo** com meses de calendário (1.1) e os aceleradores.
- Proibições que continuam: nada de "enquanto a TRH não vem", "por enquanto".

## Parte 2 — treino

### 2.1 Escopo
Reescrever os templates da **fase 1**: `entrada-1/2/3` (`entrada-seed.ts`),
`adaptacao` (`workout-plan-seed.ts`) e `variacao` (`cycles-seed.ts`). Hipertrofia,
refinamento e manutenção recebem só os ajustes de volume abaixo, com o
equipamento do prédio como plano B — os exercícios serão reescritos para a
Smartfit quando ela trocar (fora desta spec; registrar em memória).

### 2.2 Semana (adaptação em diante), cada sessão ≤60 min
Sem zona 2 em template nenhum: a caminhada de 5 km (agora todos os dias) é o
cardio, regra vigente desde 2026-08-10.
| Dia | Foco |
|---|---|
| Seg · Inferior A | glúteo projeção + quadríceps (hip thrust, leg press pés ao meio, abdutora, coice caneleira) |
| Ter · Superior A | peito superior + costas médias + braço (supino inclinado halteres, remada baixa pegada neutra, rosca martelo, tríceps testa barra W, face pull) · core |
| Qua · Inferior B | glúteo médio + adutor + quadríceps (abdutora tronco inclinado, abdução deitada, goblet/step-up, adutora, extensora) |
| Qui · Superior B | peito superior + costas + força de levantar (crucifixo inclinado halteres, remada unilateral halter, rosca barra W, carregamento frontal, farmer walk, extensão lombar leve) · core |
| Sex · Inferior C | glúteo máximo + posterior (hip thrust unilateral, flexora, abdutora, coice) |

Rebolado sai da quarta; fica no sábado (dança) e na progressão de vitalidade.

### 2.3 Volume semanal alvo (no ciclo mais alto da fase 1; entrada e adaptação sobem até ele)
| Grupo | Séries | Regra |
|---|---|---|
| Glúteo máximo | 18-22 | viés de projeção (hip thrust, coice, extensão com viés de glúteo) |
| Glúteo médio | 15-21 | abdutora máquina **3x/semana**; reps 12-25 |
| Quadríceps | 12-16 | |
| Adutor | ~6 | |
| Posterior | 6-8 | maioria **flexora**; stiff/good-morning limitados (não encher a dobra infraglútea) |
| Peito | 9-12 | só inclinado + crucifixo; nada de supino reto/declinado pesado |
| Costas | 9-12 | remadas + face pull; **nunca puxada aberta** |
| Bíceps / tríceps | ~6 / ~6 | |
| Core | — | transverso e antirrotação; nada de oblíquo carregado; carregamento 2x |

Manutenção: glúteo médio nunca abaixo de 12, com máquina.

### 2.4 Entrada (3 semanas) mantida
Rampa de exposição (`exposureLevel` 2→3→4) intacta; ganha 1 exercício leve de
braço e 1 de peito. Blocos da sessão e reordenação do miolo (`session-order.ts`)
intactos.

### 2.5 Catálogo (`exercises-seed.ts`)
Novos: `cadeira-extensora`, `flexora-em-pe` (rolo da multiestação, unilateral),
`rosca-martelo`, `rosca-barra-w`, `triceps-testa-barra-w`, `remada-unilateral-halter`,
`farmer-walk`, `extensao-lombar` (no banco/bola). Cada um com `block`,
`exposureLevel`, músculos, passos. `smith-squat` (nome interno do leg press)
mantém o id por compatibilidade de histórico; só conferir que nada na tela diz
"Smith". Nada na polia baixa além da remada (`no-low-pulley.test.ts`).

### 2.6 Testes
- Volume por grupo e por ciclo da fase 1 dentro das faixas de 2.3 (teste que
  conta séries por categoria/músculo).
- `durationMin` de cada template ≤60 e coerente com o estimador.
- Nenhum exercício proibido (puxada aberta, desenvolvimento, elevação lateral,
  encolhimento, supino reto/declinado, oblíquo com carga) em template algum.
- Bump das versões de seed de exercícios e templates
  (`seeds-chegam-no-aparelho.test.ts`).

## Parte 3 — alimentação, vitalidade e rotina

### 3.1 Cardápio 2.200
Café 450 · almoço 650 · **lanche 450** (era 500) · **jantar 650** (era 700).
Piso de proteína (150 g) e piso de gordura mantidos e testados. Gramas, lista de
compras (peso de compra cru) e exportação recalculados juntos. Whey escrito **em
gramas de pó**, não "scoop". Bump de `MEAL_PLAN_VERSION`.

### 3.2 Fases 2 e 3
Planos de manutenção ~2.750 e superávit ~2.950 (trava cintura ≤88 intacta).
Plano de fase 3 ~2.400 (déficit curto), só oferecido se BBL não estiver
agendado — sem agenda de BBL no app hoje, então aparece como opção declarada.

### 3.3 Vitalidade na comida
- Mantidos: beterraba, peixe 2x/semana, carne/ovo.
- Entram: **melancia** em alguns lanches (citrulina); **1-2 castanhas-do-pará/dia**
  no lugar de uma porção de caju — teste garante **nunca >2/dia** (selênio).
- Texto honesto: efeito da comida é modesto; o que pesa é déficit moderado,
  sono, treino e perder a barriga; fórmulas de farmácia sem evidência — sem
  nomear substância (`vitalidade-guide.test.ts` proíbe os nomes).

### 3.4 Hoje
- **Creatina 3 g** diária no café (item marcável). Aviso nas primeiras 2 semanas
  a partir da primeira marcação: "+1-2 kg de água, não é gordura". (Não há
  gráfico de peso no app; o aviso fica no item.)
- **Caminhada 5 km sáb e dom**, horário ajustável (seg-sex já é
  `caminhada-trabalho`).
- **Sono 7-7,5 h:** horário de dormir padrão ajustado para caber 7-7,5 h até
  as 6h (≈22h30-23h); StreakCard de sono conta só noites ≥7 h.
- Pedido de medição nova (1.1).
- Mantidos: verba de comer fora, lanche 16h pré-treino, vitamina D semanal no
  domingo, marmita de domingo.

## Fora do escopo
- Exercícios da fase 2 para a Smartfit (quando ela trocar; incluirá mini-entrada
  de 1-2 semanas de exposição baixa).
- Agenda/checklist de BBL no app.
- Imagem de silhueta dentro do app (repo é público; fica em `imagens/`, fora do git).

## Riscos
- **Seed sem bump não chega no celular** — toda mudança de seed bumpa versão.
- **Merge local não publica** — só `git push origin main` atualiza o PWA.
- Até a primeira medição, o app não mostra prazo nem peso-alvo — por desenho.
