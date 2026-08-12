# Frente 2 — Vitalidade sexual

**Data:** 2026-08-11
**Status:** aprovado, pronto pra plano de implementação
**Antecessora:** [Frente 1 — Verdade e objetivo](2026-08-10-verdade-e-objetivo-design.md)

## Por que isto existe

A usuária relata precocidade e falta de firmeza, e pediu ajuda com consumo de
pornografia e masturbação. Isso deixou de ser item de saúde e virou peça central
do relacionamento: a noiva dela quer penetrá-la, **recusou strap-on** ("não acha
legal um treco"), e as duas querem sensação mútua. A via, então, é mão e dedos —
e a firmeza e o controle dela passaram a ser load-bearing, não conforto.

O app já treina assoalho pélvico todo dia. Mas as 8 sequências existentes são
**todas de contração**. Falta a metade oposta, e ela é a que resolve:

- **soltar** é o que trata precocidade — assoalho hipertônico dispara antes, não
  depois;
- **soltar** é o que permite receber com conforto;
- **soltar** é o que abre o quadril.

Uma habilidade, três objetivos declarados dela.

## Decisão 1 — onde o módulo vive

Pilar novo **Vitalidade**, dentro de **Trilha**, com atalho no Hoje — mesmo padrão
de Fertilidade e Apoio. Não vira aba no menu inferior: as cinco existentes já estão
cheias.

O item diário "Assoalho pélvico · 5 min" **continua no Hoje como está**. Ele passa a
alternar contração e soltura pela progressão. Ela não ganha item novo pra marcar.

## Decisão 2 — a progressão ganha a metade que falta

`pelvic-progression.ts` hoje: identificação (5 práticas) → Kegel clássico (7) →
rotação de 6 variações. Tudo contração.

A ordem nova intercala, e a razão é clínica: **soltar é mais difícil que contrair**,
e treinar só contração fortalece um músculo que já vive tenso.

| Fase | Conteúdo | Práticas |
|---|---|---|
| 1 | Achar o músculo — contração (`pelvic-identificacao`, existente) | 5 |
| 2 | **Achar a soltura** — reverse Kegel pela respiração diafragmática | 5 |
| 3 | Kegel clássico + **alternância contrair ↔ soltar** | 7 |
| 4 | Rotação: as 6 variações existentes + **start-stop** + **preparo pra receber** | contínua |

**Cinco sequências novas** (`category: "pelvic"`, mesma forma das existentes —
`id`, `name`, `level`, `durationMin`, `focus`, `moves[]`):

| id | O que treina |
|---|---|
| `pelvic-soltura-identificacao` | Achar a soltura. Entrada obrigatória pela respiração diafragmática |
| `pelvic-soltura-sustentada` | Manter a soltura, progressiva |
| `pelvic-alternancia` | Contrair ↔ soltar com controle — a coordenação que importa |
| `pelvic-start-stop` | Controle ejaculatório, sozinha, com intenção de treino, sem tela |
| `pelvic-receber-preparo` | Relaxamento voluntário sob pressão gradual |

Duas exigências de conteúdo, não negociáveis:

**A soltura entra pela respiração.** Ninguém relaxa o assoalho pélvico por comando
direto. O caminho que funciona é inspirar para o abdômen deixando o períneo descer
junto. Sequência que mandar "relaxe" vira tentativa frustrada e abandono.

**O start-stop é o exercício, não o pecado.** É a intervenção com melhor evidência
para precocidade e **exige** masturbação. Por isso conta como treino e **não quebra
o streak** (ver Decisão 3).

## Decisão 3 — o streak

A usuária escolheu **protocolo com meta e contagem**, na forma de **streak**, com a
ressalva de risco registrada e assumida por ela: contador que zera pode virar
vergonha, e vergonha é o gatilho mais comum de recaída maior.

**O que conta:** dias consecutivos **sem gasto automático**.

**O que quebra:** pornografia **ou** masturbação no automático — por tédio, ansiedade,
pressa. Decisão dela: os dois quebram. O que o streak protege é a excitação que ela
quer guardar para a noiva, e ela vaza pelos dois caminhos.

**O que NÃO quebra:** sessão de `pelvic-start-stop`. Um protocolo que pune o próprio
tratamento força a escolha entre fazer o exercício e manter o número — e o exercício
perde.

**Recorde preservado:** ao zerar, a tela mostra o atual **e** o melhor já alcançado.
O número que ela perde não desaparece.

**Alvo declarado:** não é abstinência. Ejaculação nunca não melhora ereção nem
controle. O alvo é 2–3 vezes por semana, com pelo menos uma sendo start-stop, sem
tela.

## Decisão 4 — visibilidade, decidida por ela contra minha recomendação

Eu recomendei esconder o streak atrás do atalho: o Hoje é a tela que fica aberta, e
ela mora em ambiente não receptivo. **Ela escolheu visível no Hoje.** Decisão dela,
registrada.

Mitigação que o desenho aplica: o Hoje já tem uma fileira de três `StreakCard`
(Treino, Skincare, Sono). Vira **quatro**, e a quarta se chama **"Vitalidade"** —
o nome do módulo, não a descrição do que conta. Ela lê e sabe; quem olha por cima
do ombro lê "Vitalidade · 19" ao lado de "Sono · 5" e não deduz nada.

Se ela pedir explícito depois, é troca de uma string.

## Decisão 5 — volume de ejaculação

Ela pediu. Entra nesta frente, com **teto declarado**: volume normal é ~1,5–5 mL;
otimizando tudo, sai de baixo-normal para alto-normal. Não multiplica. Suplemento de
"volume" de farmácia é, na maioria, sem evidência — o app não recomenda nenhum.

Quase todas as alavancas já estão no plano:

| Alavanca | De onde vem |
|---|---|
| Intervalo entre ejaculações (sobe até o 5º–7º dia) | **é o próprio streak** |
| Hidratação | água do dia, já registrada — Aracaju + 5 km a pé torna isso a falha provável |
| Força e coordenação do assoalho | bulbocavernoso é o músculo que expulsa — é esta frente |
| Sono e gordura abdominal | testosterona; a barriga converte T em estrogênio |
| Zinco | castanha de caju, barata e local — ponteiro para a frente 5 |
| Edging | mesmo start-stop já prescrito |

Registrar também: **hormonizar derrubaria isso a quase zero.** Reforça o modelo das
duas trilhas da frente 1.

## Arquitetura

**Módulo novo `src/lib/vitalidade.ts`** — puro, sem I/O, sem `Date`. Calcula o streak
a partir de uma lista de dias marcados: streak atual, recorde, e a regra do que
quebra. Quem chama injeta a data de hoje.

**Dados:** um campo opcional em `db.dailyLog` marcando o dia como gasto automático.
Sem tabela nova. As sessões de start-stop **não precisam de estrutura** — são uma
sequência como as outras e caem em `db.practiceLogs`, que já move a progressão.

**Arquivos:**

| Arquivo | Mudança |
|---|---|
| `src/lib/vitalidade.ts` | **novo** — cálculo puro de streak e recorde |
| `src/data/sequences-seed.ts` | 5 sequências novas, `category: "pelvic"` |
| `src/lib/pelvic-progression.ts` | 4 fases, soltura na fase 2 |
| `src/lib/db.ts` | campo opcional no `DailyLog` |
| `src/lib/movement-seed.ts` | **bump de `MOVEMENT_VERSION`** — sem isso as 5 sequências não chegam no aparelho dela |
| `src/pages/path/Vitalidade.tsx` | **nova** — streak, recorde, progressão, painel |
| `src/main.tsx` | rota |
| `src/components/ShortcutsGrid.tsx` | atalho |
| `src/pages/Today.tsx` | quarto `StreakCard` |
| `src/lib/daily-log-helpers.ts` | marcar/desmarcar o dia |

O painel de firmeza, controle e volume usa `GuideSection`/`GuideAccordion`, que o app
já tem, e **puxa dado real** (água de hoje, streak de sono, última cintura, práticas
acumuladas) em vez de texto solto.

## Testes

- `tests/lib/vitalidade.test.ts` — streak com dias consecutivos, dia pulado, virada
  de dia, recorde preservado ao zerar, streak vazio
- `tests/lib/pelvic-progression.test.ts` (existente, estender) — as 4 fases, e que
  **soltura vem antes das variações**
- `tests/data/sequences-soltura.test.ts` — as 5 sequências existem, são `pelvic`, e a
  de soltura menciona respiração diafragmática (o caminho que funciona)
- `tests/lib/vitalidade-start-stop.test.ts` — **start-stop não quebra o streak**; é a
  regra que impede o protocolo de se contradizer
- `tests/lib/seeds-chegam-no-aparelho.test.ts` (existente, estender) — `MOVEMENT_VERSION`
  cobre as sequências novas

## Fora de escopo

Frentes 3 a 6. Especificamente: rebolado como trabalho de resistência e o repertório
com a noiva são **frente 4**; a reforma do cardápio (zinco via castanha, sem
ultraprocessado) é **frente 5**.

Nenhum conteúdo sexualmente explícito além do necessário para instruir a técnica.
O app descreve mecanismo e execução, não narra.
