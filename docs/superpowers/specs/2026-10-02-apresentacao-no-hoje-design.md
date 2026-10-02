# Entrega B — Apresentação no Hoje

**Data:** 2026-10-02 · Segunda de cinco entregas (A Treinador ✅ → **B** → C Hora da Smartfit → D Nativo → E Navegação + dívidas).

## Por que existe

Nas conversas de 2026-09-30 e 2026-10-01 ela pediu como sentar mais feminina sem esforço e sem
apertar a parte íntima, como sair do andar "travado", o que é o "8 com o quadril", e descobriu
que a "perna maior" é a pelve desnivelada. Nada disso está no app, e o que existe atrapalha:

- `PRESENCE_ITEMS`/`presenceSuggestionForDay` (`src/lib/daily-routine.ts`) têm rodízio, mas
  **nenhuma tela o mostra** — só o agendador antigo de notificação do PWA o lê. Falha nº 9 da
  lição 5.1: conteúdo que existe e não chega até ela.
- `corporal-postura-sentar` manda "pernas juntas ou cruzadas, nunca abertas" e cruzar no joelho —
  exatamente o que mais aperta.
- `corporal-caminhada` e `sensual-andar-gingado` mandam pisar **na** linha, o que acentua a pelve
  desnivelada (e dá dor de um lado só).

## Decisões dela (2026-10-02)

| Pergunta | Decisão |
|---|---|
| Onde entra no dia | **Separado por momento**: sentar nas micro-pausas do trabalho; andar e 8 à noite. |
| O que entra no rodízio da noite | Andar, 8 com o quadril **e o gingado**. |
| Gingado desde o início? | **Com progressão**: as primeiras 14 práticas alternam andar e 8; depois entra o gingado. |

## 1. Postura · 5 min (Hoje, 20:15)

- Item novo no bloco **noite** de `today-routine.ts`: `{ id: "postura", block: "noite", label: "Postura", linkKey: "postura", to: "/treino/movimento", defaultTime: "20:15" }`, entre o skincare da noite (20:00) e a voz (21:00). Rótulo **neutro** — o Hoje fica aberto em ambiente não receptivo.
- Módulo puro novo `src/lib/postura-progression.ts`:
  - `SEQUENCIAS_POSTURA = ["corporal-caminhada", "corporal-oito-quadril", "sensual-andar-gingado"]`;
  - `ATE_GINGADO = 14` (práticas concluídas da trilha);
  - `posturaDoDia(diaDoAno, praticasFeitas): { sequenceId, etapa }` — antes de 14 práticas, rodízio por dia do ano entre as duas primeiras; a partir de 14, entre as três. Rodízio **por dia do ano**, nunca dia da semana (falha nº 8).
- `practice-log-helpers.ts` ganha `contarPraticasPostura()` (conta `completed` só dos ids da trilha).
- `Today.tsx` trata `linkKey: "postura"` igual aos alongamentos: rótulo com a duração do catálogo (`rotuloDaSequencia("Postura", id)`), subtítulo = etapa, `to` = `/treino/movimento/<id do dia>`, e o item se marca sozinho quando qualquer prática da trilha é concluída no dia (`trilhaDoItem`).
- O horário entra nos ajustáveis automaticamente (`defaultTime`).

## 2. Sentar nas micro-pausas

- Módulo puro novo `src/lib/sentar.ts`: `sentarDaVez(n: number, diaDoAno: number): { titulo: string; como: string }`.
  - Rodízio entre: **pernas inclinadas pro lado** (com o lado alternando: esquerdo/direito por `(n + diaDoAno) % 2`), **tornozelos cruzados** (alternando qual fica por cima), **joelhos próximos, pés um pouco afastados**.
  - Uma vez por dia — na pausa `n === 1` — vem o **bloco de joelhos juntos, 10–15 min**, com "solta se formigar, se a lombar reclamar ou se perceber que prendeu a respiração".
  - Toda dica termina com "troque de posição a cada 20–30 min".
- `MicroPausaModal` ganha a prop `diaDoAno` e mostra, depois dos movimentos, a seção **"Ao voltar pra cadeira"** com o `sentarDaVez`. O rótulo do item no Hoje continua "Micro-pausa".

## 3. Conteúdo (`src/data/sequences-seed.ts`)

- **Reescrever `corporal-postura-sentar`** (mesmo id; continua no Movimento como referência): posições de baixo esforço como padrão; joelhos juntos em blocos curtos; alternar lados; trocar a cada 20–30 min; cadeira (fundo, pés no chão, joelho na altura do quadril); peça íntima firme com tudo apontado pra cima como tática de conforto; sinais pra soltar. Sem "nunca abertas", sem cruzar no joelho como padrão.
- **Reescrever `corporal-caminhada`** (mesmo id): transferência de peso parada; pés na largura do quadril; câmera lenta com passo curto e joelho de apoio que não trava; **perto da linha, sem cruzar os pés** (pelve); peito calmo e braços soltos; acelerar aos poucos; dose discreta pra rua.
- **Nova `corporal-oito-quadril`** (categoria `apresentacao`, ~5 min): posição base (joelhos levemente dobrados); deslizar pro lado; girar cada lado pra frente; juntar no 8 deitado; ritmo lento com música; erros (ombros, joelho travado, prender a respiração, forçar lombar); lado mais travado = mais devagar (pelve).
- **Gingado** (`sensual-andar-gingado`): o passo "Pé na linha + balanço" passa a "perto da linha, **sem cruzar os pés**".
- `MOVEMENT_VERSION` 12 → 13 (pino em `tests/lib/seeds-chegam-no-aparelho.test.ts`).

## 4. Testes

- `postura-progression`: antes de 14 só caminhada e oito; a partir de 14 as três aparecem; rodízio por dia do ano cobre todos; entrada inválida não quebra.
- Todo id de `SEQUENCIAS_POSTURA` existe no catálogo e é `apresentacao`/`sensual` com ≥ 4 movimentos.
- Rede de conteúdo (lição 5.2 — proíbe a afirmação): nenhuma das três sequências de andar manda pisar **na** linha sem negar o cruzamento; `corporal-postura-sentar` não contém "nunca abertas".
- `sentar`: o bloco de joelhos juntos aparece só em `n === 1`; o lado alterna; toda dica fala em trocar de posição.
- `today-routine`: o item `postura` existe na noite de todos os dias, às 20:15.
- Hoje: o item mostra "Postura" com a duração e leva para a sequência do dia (aguardando o estado carregar).
- `MicroPausaModal`: mostra "Ao voltar pra cadeira".
- `npm run test`, `npm run build`, `npm run build:app` limpos.

## Fora do escopo

Lembrete do celular às 20:15 (pode entrar em Configurações depois); remover `PRESENCE_ITEMS` e o
agendador antigo do PWA (dívida para a entrega E); vídeos.
