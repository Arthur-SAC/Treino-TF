# Smartfit Jardins já na fase 1 — design

**Data:** 2026-11-09 · **Origem:** conversa com ela nesta data · **Leia antes:** `docs/OBJETIVO.md`
(seções 2, 5 e 8) e `docs/CONTINUAR-AQUI.md` (seções 3–5).

## 1. Intenção e porquê

Ela antecipou a troca pra **Smart Fit Jardins** (Av. Deputado Pedro Valadares, 890, Aracaju)
**já na fase 1**, revogando a decisão de 2026-10-02 ("só na fase 2"). Motivos dela: as máquinas
do prédio não ajustam e não mostram peso — não dá pra medir progressão nem encaixar o quadril —
e a Smartfit fica no caminho a pé do trabalho.

O que a troca promete, sem amenizar: **não acelera a perda da barriga** (quem decide é o
déficit de 2.200 kcal); acelera o músculo construído na fase 1, com a testosterona dela a favor
e progressão de carga mensurável.

Três coisas que ela disse e que mandam no desenho:

1. **"Eu pararia se tivesse muita gente e meu treino virasse 1h–2h por conta de fila."** O que a
   incomoda não é o público, é máquina ocupada. O treino nunca pode depender de uma máquina
   específica.
2. **"Mudaria os exercícios para os que mais são efetivos pro meu objetivo — eu vou aprendendo."**
   A escolha dos exercícios foi delegada (ver seção 5).
3. **"As explicações são complicadas, ruins de entender; o alongamento matinal eu tive que
   pesquisar tudo."** Vale também pro alongamento da noite e pro assoalho.

## 2. Objetivos

- Treino de **todos os ciclos** reescrito pros aparelhos da Smartfit, com os exercícios mais
  efetivos pro objetivo da seção 2 do `OBJETIVO.md`.
- Em cada exercício do treino, duas saídas: **"Ocupado"** (troca na hora, só nesta sessão) e
  **"Não tem aqui"** (o app aprende e para de oferecer o aparelho).
- Explicações de execução **num formato fixo e em linguagem simples** pra todos os exercícios dos
  treinos e todos os movimentos das sequências de alongamento manhã/noite e de assoalho.
- O Hoje reflete a rotina nova (seção 4).
- Sai do app tudo que existia só por causa do prédio.

## 3. Não-objetivos e anti-objetivos

**Não-objetivos:** mudar cardápio, calorias ou o modelo de déficit; mudar fases, tetos ou alvos
(`objetivo.ts`); mudar a divisão semanal (continua 5 treinos, seg–sex); reescrever outras áreas
do app (voz, beleza, estilo); widget; mudança nativa no APK.

**Anti-objetivos — falhou mesmo que funcione se:**
- uma sessão só cabe em 60 min se todas as máquinas estiverem livres;
- algum exercício engrossa ombro/trapézio, alarga dorsal (puxada aberta), ou traz oblíquo com
  carga, supino reto/declinado pesado, ou stiff/good-morning como fonte principal de posterior;
- uma explicação nova precisa de pesquisa fora do app pra ser entendida;
- algum conteúdo novo não chega no aparelho dela (seed sem bump) ou não tem caminho até ele;
- algum rótulo visível passa a revelar conteúdo íntimo ou a transição.

## 4. Rotina nova (decidido por ela)

Seg–sex: sai **16h** do Anexo 1 da Funesa (Getúlio Vargas) a pé → chega **~17h** (rota OSM
~3,9 km, ~50 min) → força **até 60 min** e, **por fora desse teto**, o cardio leve de 15–20 min
(decisão dela, 2026-11-09 — mantém como o código já faz em `comCardioPosTreino`) → sai ~18h15 →
volta a pé (~1–1,8 km) → **cães quando chega em casa** (~18h45) → jantar **~20h**. Total a pé continua
~5 km, então o gasto da caminhada no app não muda.

Consequências no Hoje (o builder ajusta horários padrão, subtítulos e lembretes; números de
horário são decisão do builder dentro desta sequência):
- lanche pré-treino **antes de sair às 16h** passa a ser obrigatório (ela treina depois de 9 h de
  trabalho + 50 min a pé); o subtítulo atual fala em "treino das 18h15" e "depois vêm os cães" —
  está errado agora;
- item de treino ~17h; cães dos dias úteis saem das 17:15 e vão pra depois do treino;
- caminhada do dia útil: continua contando 5 km, agora em duas pernas (trabalho → academia,
  academia → casa);
- **minha sugestão, aceita sem objeção:** aviso discreto ~16h pra olhar a lotação no app da
  Smart Fit antes de sair. Rótulo neutro (passa no filtro de discrição).
- Fim de semana não muda (sábado dança, domingo livre). O modo `esteira` (esteira de 1 h depois
  do treino) continua existindo; o builder confere se os horários dele seguem coerentes.

## 5. O treino

### 5.1 Regras que não mudam
Faixas semanais e proibidos da seção 8.3 do `OBJETIVO.md`; sessão **≤ 60 min pelo estimador**
(`src/lib/session-duration.ts`); `durationMin` = estimador; dias de força começam com
cardio + articular; cardio leve pós-treino da fase 1 (2026-11-04) continua; padrão de levantar
entra por **troca**, nunca soma; **ids de template existentes ficam** (o histórico aponta pra
eles); ids de exercício existentes ficam quando o exercício continua o mesmo.

### 5.2 Seleção (decisão minha, delegada por ela)
Por músculo, o que entra como base:
- **Glúteo máximo (projeção, destacado da coxa):** hip thrust (máquina de glúteo ou barra),
  coice na polia baixa, búlgaro, extensão a 45° com viés de glúteo; agachamento/afundo fundo pelo
  estímulo em alongamento.
- **Glúteo médio (quadril largo de frente):** cadeira abdutora com tronco inclinado ≥ 3x/semana +
  abdução na polia baixa.
- **Quadríceps:** leg press, cadeira extensora, búlgaro; hack só como "se tiver".
- **Posterior:** **cadeira flexora sentada** como fonte principal (cresce mais que a deitada) +
  pull-through na polia; stiff pouco.
- **Adutor:** cadeira adutora.
- **Peito de cima:** supino inclinado com halteres + peck deck/crucifixo inclinado.
- **Costas:** remada sentada pegada neutra, remada unilateral, face pull. Sem puxada aberta.
- **Braço e levantar:** roscas, tríceps na polia, farmer walk, carregamento frontal.
- **Cintura:** pallof na polia + vacuum. Sem oblíquo com carga.

Aparelhos confirmados por ela: polia que desce até o chão, máquina de hip thrust, cadeira
abdutora/adutora, leg press, extensora, flexora sentada, banco inclinado, peck deck, remada, halteres
(carga máxima desconhecida). **Smith incerto** → nunca é exercício principal; só aparece como
substituto "se tiver" ou com alternativa. A página oficial da unidade não lista aparelhos; não
inventar catálogo além disso.

### 5.3 Escopo dos ciclos
Reescrever **todos** os ciclos que usam academia (Entrada, Adaptação, Variação e hipertrofia, refinamento,
manutenção) — ela fica na Smartfit de vez, e assim a fase 2 começa sem outra reforma (decisão
minha). As faixas: hipertrofia no topo, refinamento no meio, manutenção nunca deixa glúteo
médio < 12 séries. A régua `tests/data/fase1-chun-li.test.ts` ganha irmã pra fase 2 no mesmo
padrão.

### 5.4 Recomeço pela Entrada (decisão dela)
Ela não treinava com regularidade e prefere **contar que está começando agora**: o app volta pro
**início da progressão** (`entrada-1`) quando a versão nova chegar no aparelho dela — por
migração automática, uma vez só, sem ela fazer nada. Só o ciclo de treino recomeça: partida,
medidas, fases pela cintura, cardápio e histórico de sessões **não** são tocados.

A **Entrada** (3 semanas, `src/data/entrada-seed.ts`) é reescrita pra Smartfit. Ela nasceu como
rampa de exposição contra gente; agora a rampa é de **carga e aprendizado** — semana 1 com carga
leve, achando aparelho e regulagem (é a "mini-entrada" da seção 8.2 do `OBJETIVO.md`), semanas 2–3
subindo. Adaptação e Variação seguem depois, pela progressão que já existe. Ids de template ficam.

### 5.5 Aparelhos — o que ela sabe
**Máquina de hip thrust: confirmada.** É a base da projeção (barra vira substituto). **Flexora:
sentada, confirmada.** Máquina de coice, extensão a 45°, hack e smith: **não sabe** → entram só
como "se tiver"/substituto, nunca como única opção.

## 6. "Ocupado" e "Não tem aqui"

- Cada exercício de cada template tem **um substituto declarado** que trabalha o mesmo músculo e
  de preferência usa halter, polia ou banco (o que quase nunca tem fila). O substituto respeita os
  proibidos e não estoura os 60 min.
- **Ocupado:** troca só nesta sessão, sem gravar nada; a ordem dentro do bloco é flexível — ela
  pode pular o exercício e voltar depois, e as séries continuam contadas no exercício que ela de
  fato fez.
- **Não tem aqui:** grava em settings (persistente, entra no backup) **por id de exercício** —
  vale em todos os templates de todos os ciclos que usam aquele exercício (decisão minha: marca
  uma vez; por aparelho inteiro arriscava apagar vários com um toque errado). A partir daí o
  template mostra o substituto no lugar, e as faixas semanais continuam valendo com o substituto
  (o teste cobre o caso). Precisa haver um caminho pra desfazer (aparelho apareceu, ou
  tocou sem querer).
- O progresso/carga fica atribuído ao exercício realmente feito.
- Agrupar exercícios de cada sessão por área (máquinas de perna / polia e halteres) é desejável
  pra ela não atravessar o salão; o builder decide se dá pelo campo `block` existente.

## 7. Explicações de execução

Formato fixo, nesta ordem, em **cada exercício usado nos templates** e **cada movimento** das
sequências de **alongamento manhã, alongamento noite e assoalho pélvico**:

1. **Posição** — uma linha.
2. **Movimento** — 2 a 4 passos numerados, uma ação por passo.
3. **Onde sentir.**
4. **Tá errado se…** — sensação/visual do erro → a correção.
5. **Pra render mais** — 1 a 2 intensificadores sem precisar de mais carga (pausa, descida
   lenta, amplitude).
6. **Regulagem** — só em máquina (banco, encosto, pino).

Regra de linguagem: **nenhum termo técnico sem tradução na mesma frase** ("rotação interna —
girar o joelho pra dentro"); frases curtas; "você"; pt-BR com acento; sem emoji. O assoalho segue
a decisão de 2026-08-11 — técnico e direto, sem narrar cena — e nenhum rótulo visível muda.

Os campos atuais (`description`, `commonMistakes`, `proTips`, `successCue` em `Exercise`;
`description` por move em `sequences-seed.ts`) podem ser reaproveitados ou substituídos por
campos estruturados — decisão do builder, desde que a tela mostre os blocos separados e que o
**teste exija os blocos preenchidos** pra todo exercício de template e todo movimento dessas
sequências (padrão da lição 5.2 do `CONTINUAR-AQUI.md`: exigir a presença, não proibir palavra).
O player de vídeo por link colado continua.

## 8. O que sai

- Teto do prédio: "não tem mais peso aqui", táticas no teto, setting `tetoPredio` (limpar no
  aparelho dela), card "Hora da Smartfit" (`SmartfitCard`) e seus testes
  (`teto-predio`, `SessionRecorder-teto`, `WorkoutHome-teto`, `SmartfitCard`).
- `tests/data/no-low-pulley.test.ts` era do prédio — vira o oposto onde fizer sentido ou sai.
- Textos que falam em caneleira/espaldar/academia do prédio como limitação.
- O builder confere se o advisor de ciclo e a fase 2 ainda referenciam "trocar de academia".

## 9. Restrições técnicas (do projeto)

Seed mudou → sobe a versão certa (`EXERCISE_SEED_VERSION`, `TEMPLATE_SEED_VERSION`,
`MOVEMENT_VERSION`…) e o pino em `tests/lib/seeds-chegam-no-aparelho.test.ts`; Dexie carimba
`id` → gravar cópias; setting novo entra em `DEFAULTS` e no backup; lembrete novo em
`src/lib/lembretes/planejar.ts` com teste e filtro de discrição; módulos de `src/lib/` puros;
`npm run test` verde e `npm run build` limpo por commit; nada de TRH como etapa futura;
**`git push origin main` só com permissão dela**. Atualizar `docs/OBJETIVO.md` e
`docs/CONTINUAR-AQUI.md` no fim.

## 10. Deixado ao builder

Ordem das entregas (sugestão minha: 1 · treino + Ocupado/Não tem aqui + saída do teto + Hoje;
2 · explicações), nomes de id novos, estrutura de dados dos blocos de explicação, onde o
substituto é declarado (template ou exercício), horários exatos dentro da seção 4, e o desenho
visual dos botões — seguindo o Hoje como centro e caminho curto.
