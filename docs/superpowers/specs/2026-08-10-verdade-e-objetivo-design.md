# Frente 1 — Verdade e objetivo

**Data:** 2026-08-10
**Status:** aprovado, pronto pra plano de implementação

## Por que isto existe

O app inteiro foi escrito assumindo que a TRH está chegando. `horizontes-seed.ts`
tem uma linha do tempo ancorada em "~28: começa a TRH"; o ciclo de manutenção se
descreve como "fase ideal pra alinhar com o início da TRH"; a Silhueta explica os
limites como provisórios.

A TRH não tem data. Enquanto o app falar assim, ele entrega um plano de espera
para uma coisa sem prazo — e todo objetivo que ele mostra é uma promessa que ele
não pode cumprir.

Esta frente não muda treino nem dieta. Ela troca o **modelo** e os **números**, e
as outras cinco frentes passam a falar a língua nova.

## Medidas de partida (13/05/2026)

Altura 1,73 m · peso 96 kg · IMC 32 · gordura estimada 26–30% (Navy) ·
massa magra estimada ~71 kg.

| Medida | cm |
|---|---|
| Pescoço | 40,0 |
| Ombros | 120,5 |
| Busto | 106,5 |
| Cintura | 99,0 |
| Quadril | 114,0 |
| Coxa (cada) | 82,5 |
| Braço | 34,0 |

Derivadas: **cintura÷quadril 0,87** · **ombro÷quadril 1,06**.

O ombro÷quadril de 1,06 já está em faixa feminina (homem cis típico: 1,15–1,25).
Ombro nunca foi o gargalo. A cintura é.

## Decisão 1 — os números do objetivo

Hoje esses números não existem em lugar nenhum do código: estão dissolvidos em
prosa dentro de seeds. Passam a existir num módulo único.

**Fase 1 — tirar a barriga (0–8 meses):**

| | de | para |
|---|---|---|
| Peso | 96 kg | 80–82 kg |
| Cintura | 99 | 84 |
| Quadril | 114 | ~106 (gordura saindo) |
| Cintura÷quadril | 0,87 | ~0,79 |

**Fase 2 — construir glúteo (8–30 meses):**

| | de | para |
|---|---|---|
| Peso | 81 kg | **85–88 kg** |
| Cintura | 84 | 82–84 |
| Quadril | 106 | 114–116 (músculo) |
| Cintura÷quadril | 0,79 | **0,75–0,78 provável · 0,72–0,74 com execução excelente** |

Duas coisas que o app tem que dizer em voz alta, porque contradizem o instinto:

1. **Na fase 2 a balança sobe, de propósito.** 85 kg na fase 2 é o momento em que
   deu certo, não o momento em que falhou.
2. **O quadril termina no mesmo 114 de hoje.** Mesmo número, conteúdo diferente
   — gordura vira músculo. Por isso a fita sozinha engana e o comparador de
   fotos não. O app tem que empurrar a foto, não o número.

Faixa de resultado dupla (provável × execução excelente) em vez de número único:
número único ou ilude ou desanima.

## Decisão 2 — a TRH sai do caminho crítico

Remoção de toda formulação que trate a TRH como etapa futura agendada. Ela
continua existindo no app como **possibilidade sem data**, nunca como pré-requisito
nem como o que "vai arredondar depois".

No lugar entra a leitura honesta, que o app nunca fez:

- **Sem TRH não vem:** redistribuição de gordura pro quadril e coxa, mama, pele
  mais fina, menos pelo corporal, mudança na gordura facial. Isso não é "difícil",
  é impossível. Teto declarado, não escondido.
- **Sem TRH vem melhor:** força, ganho muscular rápido, libido, ereção, firmeza,
  controle. Metade dos objetivos dela depende de testosterona. A TRH *custaria*
  esses.
- Portanto: **não é espera, é um conflito real entre dois objetivos dela.** O app
  passa a mostrar duas trilhas — **corpo vestida** (tem teto sem TRH) e **corpo na
  cama** (favorecido pela configuração atual) — em vez de uma trilha travada.

BBL continua no app como alavanca futura, com as três verdades: precisa de gordura
pra colher, é historicamente a cirurgia estética de maior mortalidade (embolia
gordurosa; técnica subfascial reduziu bastante), e feita sobre glúteo já treinado
rende muito mais. Ordem correta: treino agora, cirurgia depois dos 30 se ainda
quiser. Treinar não atrasa — prepara.

## Decisão 3 — prazos reais, e são melhores que os antigos

Destreinada com ~28% de gordura é a configuração que mais rápido responde que
existe: dá pra perder gordura e ganhar músculo ao mesmo tempo. Essa janela fecha.

| Quando | O quê |
|---|---|
| Semana 8–10 | Primeira mudança visível em foto |
| Mês 3–4 | Cintura 88 — destrava o superávit |
| Mês 6–8 | Cintura 84, peso ~81. **A silhueta vira aqui** |
| Mês 8–30 | Fase 2: glúteo |

Faz 30 em setembro de 2029. Chega em ~2 anos, com mais de um ano de margem. O que
limita não é idade nem biologia — é adesão. O app cobra consistência, não relógio.

## Decisão 4 — a rotina bate com o dia real

A rotina atual não sabe que ela **caminha 5 km do trabalho pra casa todo dia**.
Isso são ~370 kcal/dia de movimento não contabilizado, e desloca todos os horários
da tarde.

| | app hoje | real |
|---|---|---|
| Lanche | 16:00 | **15:30** (na mesa, antes de sair) |
| Caminhada 5 km | não existe | **16:00–17:00** |
| Cães | 16:40 | 17:15–18:15 |
| Treino | 17:45 | **18:15** |
| Jantar | 19:00 | **19:30** |

Mudanças:

- **Item novo `caminhada-trabalho`** (5 km, 16:00–17:00, `control: "walk"`), contando
  no movimento do dia.
- **Horários corrigidos** nos `defaultTime` de `lanche-saida`, `treino` e `jantar`.
- **Zona 2 sai dos dias de perna** em `cycles-seed.ts`. O app prescreve 15–20 min de
  zona 2 no fim dos dias de inferior — ela já fez 5 km de zona 2 às 16h. A
  prescrição duplicada alonga a sessão em 20 min, empurra o jantar pras 20h, e
  20h é exatamente quando o jantar descontrolado acontece. Uma remoção conserta
  três coisas.

## Decisão 5 — metas de consumo, com espaço pra erro

Gasto real estimado **2.900–3.100 kcal/dia** (Mifflin-St Jeor + 5 km + 1h de cães +
força 4–5×/semana).

- **2.300 kcal/dia** (déficit ~700 → ~0,7 kg/semana)
- **150–160 g de proteína/dia** — inegociável; é o que protege o músculo no déficit
- **250 kcal/dia declaradas como discricionárias**, sem culpa e sem linguagem de
  fracasso

O último item é decisão de projeto, não indulgência. Os dois pontos de falha dela
são 16h e o jantar — ambos déficit agudo após esforço, ambos fisiologia funcionando
certo, nenhum dos dois é fraqueza. Plano que finge que besteira não acontece quebra
na primeira semana. Plano que reserva espaço sobrevive dois anos, e dois anos é o
que o objetivo exige.

## Decisão 6 — tom

Sai a amenização. Nomeadamente:

- "chubby é o começo sexy da trajetória" → o começo é um corpo com 28% de gordura
  e uma trajetória de 2 anos. Isso já é motivo suficiente.
- "passar despercebido" → **público masculino é escolha declarada dela**, não
  derrota nem limitação. Casa feminina, íntimo safada, público masculino: três
  modos escolhidos, um contexto cada.
- Todo "por enquanto", "enquanto isso" e "até lá" ligado à TRH some.

Regra permanente: o app diz o que é. Acolhimento vem de precisão, não de adoçante.

## Arquitetura

**Módulo novo: `src/lib/objetivo.ts`** — fonte única dos números.

Hoje cada número de objetivo é prosa dentro de um seed, o que é exatamente por que
o app conseguiu contradizer a si mesmo (Silhueta prometendo superávit que o plano
alimentar negava). O módulo exporta as fases, as medidas de partida, os alvos por
fase, as faixas de WHR, os prazos e as metas de consumo. É puro, sem I/O, testável.

Todas as telas que hoje afirmam algo sobre objetivo passam a ler daqui — mesma
disciplina que `useResolvedGoal` já aplica pra meta nutricional.

**Arquivos alterados:**

| Arquivo | Mudança |
|---|---|
| `src/lib/objetivo.ts` | **novo** — fonte única dos números |
| `src/data/horizontes-seed.ts` | reescrita: duas trilhas em vez de três etapas com TRH no meio; linha do tempo sem data de TRH |
| `src/data/cycles-seed.ts` | manutenção deixa de ser "fase pra alinhar com TRH" (l. 7, 303, 312, 408); zona 2 sai dos dias de perna |
| `src/lib/silhouette.ts` | `leverGuidance` sem TRH como provisório (l. 52) |
| `src/data/milestones-seed.ts` | "Fase 5 — alinhar com TRH" (l. 96) vira fase de manutenção própria; marcos de fertilidade/TRH ficam, sem data; **entram marcos de cintura 88 e 84** |
| `src/data/workout-plan-seed.ts` | "fundação que a TRH vai arredondar depois" (l. 17) |
| `src/lib/today-routine.ts` | item `caminhada-trabalho`; horários 15:30 / 18:15 / 19:30 |
| `src/pages/path/FertilityTRH.tsx` | TRH como possibilidade sem data |
| `src/data/estilo-discreto-seed.ts` | "passar despercebido" → escolha declarada |
| `.gitignore` | `*.png` (há um PNG solto na raiz; hoje fora do git, mas um `git add -A` o levaria) |

`CINTURA_LIBERA_SUPERAVIT_CM = 88` em `meal-plan.ts` **fica como está** — está bem
calibrado e é o gatilho do marco do mês 3–4.

## Testes

O projeto já tem cobertura de seeds (`tests/data/`) e de lógica pura (`tests/lib/`).
Seguir o padrão:

- `tests/lib/objetivo.test.ts` — fases, alvos, derivadas (WHR de partida = 0,87;
  ombro÷quadril = 1,06), monotonicidade das fases
- `tests/data/sem-trh.test.ts` — **nenhum seed contém TRH como etapa agendada**;
  varredura por "com TRH", "início da TRH", "~28", "depois da TRH"
- `tests/data/zona2-caminhada.test.ts` — nenhum template de dia de perna termina em
  `cardio-zona2`
- `tests/lib/today-routine.test.ts` (existente, estender) — `caminhada-trabalho`
  presente de segunda a sexta com `control: "walk"`; `defaultTime` de lanche/treino/
  jantar nos valores novos

## Fora de escopo

Frentes 2 a 6, cada uma com spec própria: vitalidade sexual (assoalho pélvico com
relaxamento, firmeza, controle, pornografia), corpo & treino, repertório íntimo,
comida em Aracaju, três modos de estilo. Carreira de ilustração e jogos fica fora
do app — é identidade real dela, mas é outro produto.

## Aberto

**As medidas de 13/05 estão num app diferente.** A tela do print tem 4 abas
(INÍCIO/TREINO/CORPO/MENU) em roxo; o Trein-Final tem 5 (Hoje/Treino/Corpo/Beleza/
Trilha) em nude e vinho, e o badge "XGG / 48" não existe neste código.

Se `db.measurements` estiver vazia aqui, `useResolvedGoal` devolve o caminho
conservador pra sempre, a guarda de cintura não dispara e nenhum marco novo
acontece — o app fica inerte por falta de dado, não por erro de lógica.

A implementação precisa confirmar isso e, se for o caso, incluir a entrada das
medidas de 13/05 no Trein-Final antes de qualquer outra coisa.
