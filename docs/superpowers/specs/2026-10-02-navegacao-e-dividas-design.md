# Entrega E — Navegação em 4 abas + dívidas

**Data:** 2026-10-02 · Última de cinco (A ✅ → B ✅ → C ✅ → D ✅ → **E**). Depois dela, publica tudo e ela instala o APK.

## Decisões dela (2026-10-02)

| Pergunta | Decisão |
|---|---|
| Navegação | **4 abas: Hoje · Progresso · Guia · Vitalidade** (eram 6: Hoje, Treino, Corpo, Beleza, Vitalidade, Trilha). Ela gosta do Hoje e acha as outras abas confusas (08-13). |
| Vitalidade | Continua com aba própria e rótulo neutro (decisão de 08-13 mantida). |

## 1. Navegação

**Nenhuma rota muda.** Todas as telas continuam no mesmo endereço — links do Hoje, dos lembretes
(`/corpo/medidas`, `/configuracoes`…) e os "← voltar" de cada tela seguem funcionando. Mudam a barra
de baixo e entram duas telas-índice.

- `src/lib/abas.ts` (puro): `type Aba = "hoje" | "progresso" | "guia" | "vitalidade"` e
  `abaDaRota(pathname): Aba`:
  - `/vitalidade`, `/trilha/vitalidade` → vitalidade;
  - `/progresso`, `/corpo/*`, `/trilha` (Marcos, exato), `/trilha/marcos/*`, `/trilha/evolucao`, `/trilha/diario`, `/treino/horizontes`, `/treino/progressao` → progresso;
  - `/guia`, `/treino/*` (o resto), `/beleza/*`, `/trilha/alimentacao/*`, `/trilha/apoio`, `/trilha/fertilidade`, `/trilha/direitos`, `/refeicoes-hoje` → guia;
  - o resto (`/`, `/hoje/*`, `/configuracoes`) → hoje.
- `BottomNav`: quatro itens — Hoje `/`, Progresso `/progresso`, Guia `/guia`, Vitalidade `/vitalidade` — e a aba acesa vem de `abaDaRota(useLocation().pathname)`, não do prefixo do `NavLink`. Com 4 abas o rótulo volta ao tamanho normal (a nota dos 0.62rem sai).
- Rotas novas em `main.tsx`: `progresso` → `ProgressoHome`, `guia` → `GuiaHome`.
- `ProgressoHome` (`src/pages/ProgressoHome.tsx`): h1 "Progresso"; cartões, em ordem:
  Evolução `/trilha/evolucao` · Medidas `/corpo/medidas` · Fotos `/corpo/fotos` · Silhueta `/corpo/silhueta` ·
  Comparação `/corpo/comparacao` · Marcos `/trilha` · Até onde dá pra chegar `/treino/horizontes` ·
  Progressão de carga `/treino/progressao` · Diário `/trilha/diario`.
- `GuiaHome` (`src/pages/GuiaHome.tsx`): h1 "Guia"; blocos com título e links:
  - **Treino**: Treino e plano `/treino` · Biblioteca `/treino/biblioteca` · Movimento `/treino/movimento` · Ciclos `/treino/ciclos`;
  - **Alimentação**: Cardápio `/trilha/alimentacao` · Refeições de hoje `/refeicoes-hoje` · Lista de compras `/trilha/alimentacao/lista-compras` · Marmita de domingo `/trilha/alimentacao/domingo`;
  - **Beleza**: Pele e cabelo `/beleza` · Depilação `/beleza/depilacao` · Maquiagem `/beleza/maquiagem` · Voz `/beleza/voz` · Estilo `/beleza/estilo`;
  - **Apoio**: Apoio `/trilha/apoio` · Saúde · planos `/trilha/fertilidade` · Direitos `/trilha/direitos`.
- Os rótulos e os itens das duas telas exportam suas listas (`ITENS_PROGRESSO`, `BLOCOS_GUIA`) para a rede de discrição (`EXPOE`) e para o teste de que toda rota listada existe no router.
- Copy: `lib/linha-do-tempo.ts` "Mede na aba Corpo" e `pages/body/Onboarding.tsx` "na aba Corpo" → "em Progresso → Medidas".

## 2. Dívidas

1. **Zona 2:** a dica "Ao terminar" de `SessionDetail` diz que a caminhada das 16h já entrega a zona 2. Passa a seguir `modoCaminhada` (caminhada: texto atual; esteira: "a esteira inclinada do dia já entrega…"; pausada: "a caminhada está pausada — a zona 2 de hoje não vem de lugar nenhum; se quiser compensar, 20–30 min de esteira inclinada depois da força"). O exercício `cardio-zona2` (`exercises-seed.ts`) troca "É a caminhada de 5 km do trabalho para casa" por texto que vale pros dois (caminhada ou esteira do dia) → `EXERCISE_SEED_VERSION` +1.
2. **Treinos por semana:** `TREINOS_POR_SEMANA = 5` em `objetivo.ts`, usado em `ritmo.ts`, `revisao-semanal.ts`, no `StreakCard` "Treino" do Hoje e no `SemanaCard`.
3. **Lista antiga de presença:** `PRESENCE_ITEMS`/`presenceSuggestionForDay` saem de `daily-routine.ts`; o lembrete das 21h do PWA (`notification-scheduler.ts`) passa a considerar feito quando há prática de `SEQUENCIAS_POSTURA` no dia. Testes de `daily-routine.test.ts` sobre a lista saem.
4. **Rede de andar:** o teste de conteúdo também proíbe "sobre a linha", "na frente do outro" e "linha única" nas três sequências de andar.
5. **Teste do Hoje dependente de ordem:** `tests/pages/Today.test.tsx` limpa `measurements` no `beforeEach`.

## Testes

`abaDaRota` com um caso por grupo de rota (incluindo `/trilha` exato × `/trilha/alimentacao`); `BottomNav` mostra 4 abas com os hrefs certos e acende Progresso em `/corpo/medidas` e Guia em `/treino/biblioteca`; toda rota de `ITENS_PROGRESSO`/`BLOCOS_GUIA` existe no router; rótulos passam pelo `EXPOE`; as duas telas renderizam os itens; `SessionDetail` mostra o texto do modo; `TREINOS_POR_SEMANA` é a fonte (teste que muda o import? — basta o valor exportado e os consumidores importando); o lembrete de presença usa a trilha de postura. Suíte, `build` e `build:app` limpos.

## Fora do escopo

Reorganizar as telas internas (Treino, Corpo, Beleza, Trilha continuam como sub-índices); remover rotas legadas.
