# Revisão profissional — Fase de Entrada, correções de ciclo, nutrição prática e prioridades de passabilidade

**Data:** 2026-07-27
**Status:** design aprovado, pendente de plano de implementação

## Contexto

A reforma de julho (`2026-07-16-reforma-rotina-transicao-design.md`) entregou o app como rotina diária única
na tela Hoje e já foi mergeada em `main`. Esta revisão não refaz aquilo — corrige erros de programação
identificados numa auditoria do conteúdo (templates dos 5 ciclos, catálogo de 59 exercícios, 3 planos
alimentares) cruzada com duas fontes novas:

1. **Fotos do corpo atual** (`imagens/eu/`, jun/2026) e de referência (`imagens/objetivo/`).
2. **Inventário fotográfico real da academia** (`imagens/academia/`).

### Achado que reorienta a estratégia

A medida de ombro registrada (120,5 cm) é **circunferência torácica na altura das axilas, não largura
biacromial**. Nas fotos, a largura clavicular é estreita-a-média e o deltoide é pouco desenvolvido; a linha
do ombro de costas é suave. O app vinha tratando "ombro largo" como a restrição central da silhueta.

A restrição central real é outra: **o ponto mais largo do corpo hoje é o abdômen**, não o ombro nem o
quadril. De perfil, a projeção mais avançada é abdominal na altura do umbigo e abaixo. O glúteo não tem
projeção posterior — a linha das costas emenda direto na coxa. A coxa já tem volume razoável.

Consequências para o plano:
- **Perder gordura abdominal feminiza a silhueta mais rápido que qualquer outra coisa no curto prazo** —
  mais até que ganhar glúteo. O déficit calórico sobe de importância relativa.
- A razão ombro:quadril alcançável **sem TRH é melhor** do que o app vinha projetando. Ampulheta com ombro
  estreito não exige quadril grande; exige cintura pequena.
- O veto a treino de ombro/trapézio **continua válido** (não desenvolver o que já existe), mas não há
  necessidade de medo de superior leve.

### Inventário real da academia (do prédio)

Bike reclinada horizontal · esteira · duas multiestações (polia alta, voador/peck deck, remada,
extensora/flexora acopladas) · **cadeira abdutora/adutora Olympikus M3** · leg press (confirmado pela
usuária, sem foto) · **banco reclinável com rack de barra** (viabiliza hip thrust com barra) · espaldar de
madeira + barra fixa · step · bola suíça · barra olímpica + barra W + anilhas variadas · halteres coloridos
leves (1–5 kg) · halteres cromados médios · caneleiras 2/3/5 kg · **kettlebells (4–5 unidades)**.

Não há barra guiada (Smith) — confirma o que o catálogo já assume. **Kettlebell não existe no catálogo do
app.** A progressão fina de carga (halteres de 1 a 5 kg, caneleiras de 2/3/5 kg) é exatamente o que uma
iniciante precisa e está disponível.

### Decisão: academia desde o início, sem ciclo de casa

A usuária considerou começar em casa. Descartado, com o acordo dela: em casa ela tem **só colchonete**, e
ponte de glúteo com peso do corpo a 96 kg satura em ~3 semanas sem construir volume. A academia é no
próprio prédio (menor atrito possível) e tem o equipamento certo. Também foi descartado um "plano B de
casa" para dias perdidos — decisão dela, para não criar uma saída fácil.

O que motivava a vontade de ficar em casa não era o equipamento: era o desenho da Adaptação, que **estreia
com hip thrust com barra na segunda-feira** — o exercício de `exposureLevel 4`, o mais exposto do catálogo.
Isso é erro de programação, e é o que a Fase de Entrada resolve.

### Condições pessoais levantadas nesta sessão

- **Sem dor ou lesão.** A limitação é **baixa flexibilidade** — impacta prescrição de dobradiça de quadril e
  posição de pés no leg press (ver Bloco A, semana 2).
- **Sono de 6 a 7h, mais perto de 6** (ver Bloco C6).
- **Medições:** a usuária opta por atualizar mês a mês quando o treino estabilizar (ver Bloco D, item 15).
- **Academia não é cheia, mas a presença de outras pessoas desanima e faz cancelar sessão.** Dois medos
  distintos, relatados por ela: ser descoberta, e "estar errada em fazer". Consequência de desenho, não de
  conteúdo motivacional: a sessão passa a ser tolerante à sala ocupada (blocos independentes, Bloco A).
  Vale registrar como fato de conteúdo que o app pode dizer com honestidade — leg press, abdutora, adutora
  e hip thrust estão entre os exercícios mais comuns de qualquer academia brasileira; **nada na programação
  dela é identificável como "treino de transição" por um observador.** É indistinguível de qualquer pessoa
  treinando glúteo.

---

## Bloco A — Fase de Entrada (3 sub-fases semanais)

**Princípio de montagem: a exposição é uma rampa, não um corte.** O campo `exposureLevel` (1–5) já existe em
`Exercise`; esta é a primeira vez que ele governa a prescrição, e não só a exibição. O teto sobe a cada
semana:

| Sub-fase | Teto de `exposureLevel` | O que entra de novo |
|---|---|---|
| Entrada · Semana 1 | ≤ 2 | máquina sentada, bike, esteira, solo no colchonete |
| Entrada · Semana 2 | ≤ 3 | **stiff com halteres** (3) e **step-up** (3) — em pé, mas de aparência banal |
| Entrada · Semana 3 | ≤ 4 | **hip thrust** (4) — o movimento mais conspícuo, por último |

Implementação: três ciclos `entrada-1`, `entrada-2`, `entrada-3`, threshold de 5 sessões cada, antes de
`adaptacao`. Reaproveita a máquina de progressão por contagem de sessões que já existe — sem mudança de
schema. Meta nutricional das três: `deficit` (mesma de adaptação).

Objetivos da fase, nesta ordem: (1) aprender os padrões motores, (2) ganhar condicionamento base,
(3) tornar o espaço da academia familiar antes de qualquer movimento conspícuo.

### Estrutura de sessão: dois blocos independentes

**Toda sessão da Entrada se divide em bloco de máquina e bloco de solo (colchonete), executáveis em
qualquer ordem.** Se a sala de solo estiver ocupada, faz o bloco de máquina primeiro e o de solo depois, ou
vice-versa. A sessão nunca depende de a academia estar vazia.

Isso responde a algo que a usuária relatou e que é previsível o bastante para ser programado contra:
ela desanima e cancela quando planeja um horário e aparece gente. Não é falta de disciplina — é um ponto de
falha do desenho, e força de vontade é a mitigação errada. A UI deve deixar a ordem dos blocos trocável na
tela da sessão.

### Templates — Semana 1 (teto ≤ 2)

| Dia | Nome | Duração | Bloco máquina | Bloco solo |
|---|---|---|---|---|
| Seg | Inferior · Máquinas | ~30 min | bike 5 min · leg press · abdutora · adutora · bike zona 2 10 min | ponte de glúteo |
| Ter | Postura + Core | ~25 min | bike 5 min · remada baixa · face pull | prancha · dead bug · vacuum |
| Qua | Glúteo médio | ~30 min | abdutora máquina · bike 10 min | articular · cat-cow · clamshell · abdução deitada · ponte de glúteo |
| Qui | Leve | ~25 min | esteira inclinada 20 min | mobilidade |
| Sex | Inferior B | ~30 min | bike 5 min · leg press pés altos · adutora · bike 10 min | ponte de glúteo unilateral |

**Séries/reps:** 3 séries em tudo, 12–15 reps nas máquinas, 15–20 no solo. Descanso 45–60 s. Carga: a mais
leve que permita sentir o músculo-alvo; a progressão nesta fase é de **reps e execução**, não de carga.

### Semana 2 (teto ≤ 3) — entra a dobradiça

Mesma estrutura, com duas adições:
- **Sexta:** `stiff` com halteres leves (3–4 kg), 3×12. É onde se aprende a dobradiça de quadril — o padrão
  que mais constrói glúteo e o mais difícil de acertar. Em pé, com halteres, tem aparência de exercício
  comum.
- **Quinta:** `step-up-gluteo` no step, 3×10 cada perna.

**Ajuste obrigatório por baixa flexibilidade** (relatado pela usuária, sem dor associada): o stiff começa com
**amplitude curta** — desce só até onde o posterior de coxa permite sem arredondar a lombar, e a amplitude
aumenta ao longo das semanas. Isquiotibial encurtado com stiff de amplitude completa é a causa nº 1 de
lombalgia nesse exercício. Mesma razão no leg press: a posição de pés altos pode não ser acessível de
início; começar mais baixa e subir conforme a mobilidade de quadril melhora. O texto do exercício no app
deve trazer esse aviso, não só a instrução ideal.

### Semana 3 (teto ≤ 4) — graduação do hip thrust

Na segunda-feira da semana 3, em duas etapas:
1. Apoiada no banco, **peso do corpo**, 3×15 — aprende o alinhamento e a contração no topo.
2. Quando o padrão estiver limpo, **barra vazia** (~10 kg), 3×12.

Na semana 4 começa a Adaptação já com o movimento conhecido.

---

## Bloco B — Correções nos ciclos existentes

1. **Búlgaro sai da Adaptação** (`qui-gluteo-coxa`) → substituído por `step-up-gluteo`. Agachamento búlgaro
   exige equilíbrio unilateral pesado; a 96 kg e sedentária entrega dor muscular de vários dias, não
   estímulo útil. Volta no ciclo de Variação.
2. **Entra dobradiça de quadril na Adaptação.** Hoje o ciclo tem zero hip hinge — stiff e good morning só
   aparecem no ciclo 2. Adicionar `stiff` leve (3×12) em `qua-mobilidade-danca` ou `qui-gluteo-coxa`.
3. **`puxada-frente-maquina` sai de `h-ter-cintura-costas`** (Hipertrofia). Contradiz a regra explícita de
   não alargar o dorsal / não construir o V. Face pull + remada baixa já cobrem postura sem alargar.
4. **Peitoral volta a leve na Hipertrofia.** Hoje `h-ter-cintura-costas` tem supino inclinado 4×10 +
   cross-over 3×12. Reduzir para 3×12 explicitamente leve. Treino de peitoral não cria tecido mamário;
   leve dá base que projeta, pesado constrói um peito que lê como masculino.
5. **Zona 2 vira item explícito de template**, com duração própria no fim da sessão — hoje existe só como
   observação solta em `cardio-leve-esteira` ("se quiser, deixa a zona 2 mais longa pro fim") e some na
   prática. Passa a ser uma linha de exercício com `repsTarget` de 10–20 min nos dias de força.
6. **Kettlebell entra no catálogo.** Novos exercícios: `kettlebell-swing` (glúteo + dobradiça + cardio no
   mesmo movimento — dos melhores para o objetivo), `goblet-squat-kettlebell`, `levantamento-terra-sumo-kettlebell`.
   Equipamento `kettlebell`. Entram nos ciclos de Variação em diante.

---

## Bloco C — Nutrição

### C1. Correção estrutural: superávit condicionado

**`CYCLE_TO_GOAL.hipertrofia` deixa de apontar direto para `superavit`.** A seleção passa a ser
condicional pela cintura da medição mais recente:

- cintura > 88 cm → `manutencao`
- cintura ≤ 88 cm → `superavit`

Sem medição registrada, assume `manutencao` (opção conservadora).

**Razão:** superávit calórico a 96 kg adiciona gordura, e o padrão de deposição dela é abdominal — piorando
exatamente a métrica-rei (cintura) e o ponto mais largo do corpo. Com o percentual de gordura atual e sendo
iniciante, o glúteo cresce em manutenção ou déficit leve (recomposição). Superávit só passa a fazer sentido
quando ela estiver enxuta.

A tela do plano alimentar deve explicar essa condição em uma frase, não trocar em silêncio.

### C2. Marcos honestos

2200 kcal contra ~2600 de manutenção = ~0,4 kg/semana → **~18 meses** de 96 kg até ~65 kg. Os marcos atuais
dizem 12–14 meses. Corrigir o texto dos marcos, não acelerar o déficit — déficit agressivo com treino de
glúteo iniciante é um mau negócio.

### C3. Meta de passos

Novo item diário no Hoje: meta de passos, iniciando em **7.000/dia** e subindo para 9.000 conforme
consistência. Entrada manual (o app é local e não integra com contador do celular).

**O passeio com os cães (1h/dia) é o motor dessa meta** — é o que a torna realista em vez de um fardo.
Continua sendo NEAT, não zona 2: é lento, com paradas. O texto do app deve dizer isso claramente para não
criar a impressão de que o passeio substitui o cardio.

Consertar junto o contador `activeBreakCount` (pausas ativas), que hoje nunca é incrementado.

### C4. Rotina ancorada no dia real

O dia da usuária, confirmado nesta sessão:

| Horário | Bloco |
|---|---|
| 6h | Acorda → mobilidade 15 min → café da manhã |
| 7h–16h | Trabalho (almoço ~12h, marmita) |
| **16h** | **Lanche pré-treino** (sente fome nesse horário, ainda no trabalho/saída) |
| 16h30 | Chega em casa |
| ~16h40–17h40 | Passeio com os cães (1h) — NEAT, conta para a meta de passos |
| ~17h45–18h30 | Academia |
| ~19h | Jantar (pós-treino) |
| Noite | Mobilidade 10 min (intimidade integrada) · desenho/leitura |

**O lanche das 16h é o pré-treino**, ~1h45 antes do treino. Deve ser: carboidrato de digestão fácil +
proteína moderada, **baixa gordura e baixa fibra** — para não pesar durante 1h de caminhada e o treino em
seguida. Precisa ser **portátil** (comido no trabalho ou na saída).

O jantar das 19h é a refeição pós-treino: proteína + carboidrato.

A tela Hoje deve refletir exatamente esta ordem, com o passeio dos cães como item marcável entre o lanche e
o treino.

### C5. Comida fácil de Aracaju

Restrição declarada: **"sou preguiçosa"**. Todas as opções precisam passar no teste de ≤ 10 min de preparo
ativo, ou zero preparo, ou vir de lote feito no domingo.

O cardápio já foi localizado para Aracaju (cuscuz, macaxeira, peixe, jerimum, feijão de corda,
`MEAL_PLAN_VERSION=5`). O que falta é o filtro de **praticidade**. Revisar as variantes com este critério e
priorizar:

- **Zero preparo:** sardinha em lata, atum em lata, iogurte, banana, queijo coalho, ovo cozido feito em lote
- **≤ 5 min:** cuscuz (cuscuzeira ou micro-ondas), tapioca, ovo mexido, whey
- **Lote de domingo:** frango desfiado, carne moída, feijão de corda, macaxeira cozida (congela bem),
  jerimum, arroz — a marmita de domingo já está na rotina e passa a ser a espinha dorsal do almoço
- **Air fryer** onde couber (filé de peixe congelado)

### Equipamento disponível (confirmado pela usuária)

**Em casa:** air fryer, cuscuzeira, micro-ondas, geladeira.
**No trabalho:** geladeira e micro-ondas.
**Almoço:** marmita, esquentada no trabalho.

Ou seja: nenhuma restrição de preparo. O lanche das 16h pode ser refrigerado (não precisa ser de
prateleira), e o almoço de marmita confirma o lote de domingo como espinha dorsal do plano.

### Desenho das quatro refeições

| Refeição | Hora | Alvo | Critério de montagem | Exemplos |
|---|---|---|---|---|
| Café | 6h | ~500 kcal | ≤ 7 min, ela sai 7h | Cuscuz na cuscuzeira + ovo mexido · tapioca + ovo · whey batido (o único whey do dia) |
| Almoço | 12h | ~650 kcal | Marmita do lote de domingo, só esquentar | Frango desfiado / carne moída / peixe + arroz + feijão de corda + jerimum ou macaxeira + salada |
| **Lanche pré-treino** | **16h** | **~350–400 kcal** | **Carbo de digestão fácil + proteína moderada, baixa gordura e baixa fibra** | Iogurte natural + banana + aveia · sanduíche de pão de forma com peito de peru + fruta |
| Jantar (pós-treino) | 19h | ~600 kcal | Air fryer ou ≤ 10 min | Filé de peixe ou frango na air fryer + macaxeira ou batata doce + legume · ovos + cuscuz nos dias sem energia |

**O lanche das 16h é a refeição mais restrita do dia em composição**, e é a que mais erra na prática. Ela come
às 16h, caminha 1h com os cães a partir das ~16h40 e treina às ~17h45. Gordura e fibra alta atrasam o
esvaziamento gástrico e pesam durante a caminhada e o treino. Por isso: iogurte sim, castanha e pasta de
amendoim não — essas ficam em outra refeição.

O jantar das 19h é o pós-treino, e é onde a proteína e o carboidrato fecham o dia.

### Lote de domingo

O domingo já é "livre + marmita" na rotina. Passa a ser tratado explicitamente como o mecanismo que faz o
plano funcionar numa semana cansada. A lista de compras semanal que já existe deve derivar deste lote.

Cozinhar de uma vez: frango desfiado, carne moída, feijão de corda, macaxeira cozida (congela bem), jerimum,
arroz, ovos cozidos. Peixe fica para preparo na hora na air fryer (Aracaju, barato e fresco).

### Marcador de praticidade

Cada variante de refeição ganha um marcador visível de esforço, para que a escolha em dia cansado seja
óbvia sem ler a receita inteira: **"pronto em 5 min"**, **"air fryer"**, **"do lote de domingo"**,
**"zero preparo"**. Este é o mecanismo que atende a restrição declarada pela usuária ("sou preguiçosa") —
o cardápio já é acessível, o que faltava era tornar o custo de esforço legível na hora da decisão.

Cada variante ganha um marcador de praticidade visível (ex.: "pronto em 5 min" / "do lote de domingo"), para
que a escolha em dia cansado seja óbvia. Whey permanece em 1× no café — sem aumentar dependência de
suplemento.

---

### C6. Meta de sono

A usuária dorme **6 a 7 horas, mais perto de 6**. Este é o achado de saúde mais subestimado da auditoria, e
age exatamente contra o objetivo declarado:

- Sono curto eleva cortisol, e cortisol deposita gordura **abdominal** — a área-problema dela e o ponto mais
  largo do corpo hoje.
- Aumenta a fome no dia seguinte, tornando o déficit de 2200 kcal muito mais difícil de sustentar.
- Reduz a síntese proteica muscular, que é o que constrói glúteo.
- Somado à vitamina D provavelmente baixa (ver item 14), explica bem a fadiga relatada.

Sair de 6h para 7h30 provavelmente faz mais pela cintura dela do que uma sessão extra de academia por
semana.

Novo item de rotina: meta de sono com **horário-alvo de deitar calculado a partir do despertar das 6h →
22h30**. Deve aparecer no bloco da noite da tela Hoje, com a explicação do porquê em uma frase — "durma
mais" sem razão não é seguido por ninguém. Registro simples (deitou no horário: sim/não), sem tracker
elaborado.

## Bloco D — Fora do treino: prioridades de passabilidade

Constatação da auditoria: **os itens que mais decidem a leitura de gênero não estão no treino, e são
justamente os que o app deixa em sub-abas que só aparecem se a usuária lembrar de abrir.** O Hoje é
cronológico e não pondera alavancagem.

10. **Barba/depilação vira item diário no Hoje.** Nas fotos há sombra visível em queixo e buço — de perto,
    é o item nº 1 de passabilidade. O guia de depilação estratégica (barba sem TRH + camuflagem com
    corretivo alaranjado) já existe e está bem feito; o problema é descoberta. Passa a ser linha diária na
    tela Hoje. **Laser/eletrólise vira marco com data-alvo e custo estimado** — é a intervenção mais
    transformadora e a mais fácil de adiar indefinidamente.
11. **Voz vira item diário curto (5 min) no Hoje.** Voz é o segundo item mais decisivo depois de rosto/pelo,
    e só melhora com frequência — exatamente como a mobilidade, que já é micro-dose. Hoje está enterrada
    como 4ª sub-tab de Beleza. Sugerir um exercício do dia, rotativo entre as categorias existentes.
12. **Cabelo — reforçar o "porquê" no guia.** O cabelo atual tem volume no topo e nas laterais. Volume no
    topo alonga o rosto (bom); volume lateral alarga (ruim). O corte já escolhido (cacheado andrógino,
    comprimento chegando ao maxilar) resolve — e comprimento na altura do maxilar **suaviza a mandíbula**,
    que é o ganho de passabilidade mais barato disponível. O guia hoje traz o cronograma sem explicar isso.
13. **Postura vira micro-lembrete durante o expediente.** Nas fotos de perfil o ombro está protraído e a
    cabeça anteriorizada — padrão de quem programa sentada. Corrigir muda a leitura do tronco imediatamente,
    sem depender de nenhum ganho físico. Encaixa no sistema de pausas ativas que já existe.
14. **Exame de sangue (vitamina D) vira marco com data-alvo.** Pendente há meses e é a explicação mais
    provável da fadiga relatada.
15. **Lembrete de medição vira mensal e explícito quanto à consequência.** A usuária optou por medir
    mês a mês assim que o treino ficar regular — decisão aceita, não é preciso forçar cadência maior. O que
    o app precisa deixar claro é o efeito de não medir: **enquanto não houver medição recente, a regra do
    Bloco C1 mantém a nutrição em `manutencao` nos ciclos de crescimento em vez de liberar superávit.** Isso
    é o comportamento conservador e correto, mas tem que estar escrito na tela para não parecer defeito.

---

## O que não muda

Confirmado como bem construído e fora de escopo desta revisão: glúteo prioritário 4×/semana; veto a
desenvolvimento/elevação lateral/trapézio/puxada aberta; cintura trabalhada só com transverso e vacuum
(sem oblíquo com carga); a estrutura de 5 ciclos com progressão automática; todo o módulo de estilo
discreto; os módulos de fertilidade/TRH e apoio/disforia.

## Realismo, dito com clareza

As fotos de referência em `imagens/objetivo/` mostram mulheres cis com **quadril ósseo largo** — na foto de
lingerie, a largura vem do ilíaco, não só de músculo. Isso não muda sem cirurgia. O que se constrói é glúteo
médio e máximo por cima da estrutura óssea, o que arredonda e alarga o contorno de verdade, mas não replica
uma bacia larga.

O que compensa: com ombro estreito e deltoide pequeno, a razão ombro:quadril alcançável é **melhor** do que
o app vinha projetando. A ampulheta virá da cintura, não do quadril. Num vestido que marca a cintura, o
resultado realista sem TRH é a leitura de mulher curvilínea — e a virada visual acontece quando a cintura
cruza os 88 cm.

Ressalva honesta que deve permanecer no app: **o corpo entrega a silhueta de longe e na foto; de perto, a
leitura é rosto, cabelo, pele, pelo facial e voz, nessa ordem.** É por isso que o Bloco D não é acessório.

## Ordem de implementação sugerida

Se for preciso fatiar, a ordem de retorno é:

1. **Bloco A** (Fase de Entrada) — desbloqueia o começo imediato
2. **Bloco C1** (superávit condicionado) — corrige o erro de maior impacto negativo
3. **Bloco B** (correções de ciclo)
4. **Bloco D itens 10 e 11** (barba e voz no Hoje) — maior alavanca de passabilidade
5. **Bloco C4/C5/C6** (rotina do dia real + comida fácil + meta de sono)
6. Restante do Bloco D + C2/C3

## Testes

- Os ciclos `entrada-1/2/3` aparecem nessa ordem antes de `adaptacao`; `cycle-advisor` promove entre eles a
  cada 5 sessões e de `entrada-3` para `adaptacao`.
- **Rampa de exposição respeitada:** todo exercício dos templates de `entrada-1` tem `exposureLevel ≤ 2`,
  de `entrada-2` tem `≤ 3` e de `entrada-3` tem `≤ 4`. Teste automatizado sobre o seed — é a regra central
  da fase e não pode se perder numa edição futura.
- Toda sessão da Entrada tem os dois blocos (máquina e solo) identificáveis e reordenáveis.
- `getActiveMealPlan()` retorna `manutencao` no ciclo `hipertrofia` quando a cintura mais recente > 88;
  `superavit` quando ≤ 88; `manutencao` quando não há medição.
- `puxada-frente-maquina` não é referenciado por nenhum template.
- Nenhum template de qualquer ciclo referencia exercício inexistente no catálogo.
- Suíte existente (254 testes) permanece verde; build PWA limpo.
