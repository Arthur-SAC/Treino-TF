# A tela Hoje como roteiro completo do dia

**Data:** 2026-07-28
**Status:** design aprovado, pendente de plano

## Contexto

A reforma de julho fez a tela Hoje virar rotina diária, e o trabalho de 2026-07-27 ancorou cada item num
horário ajustável. A usuária então usou o app e trouxe a queixa certa: **ela ainda não consegue viver o dia
só pela tela inicial.** Pediu explicitamente que nada ficasse de fora e que não houvesse um "ah, vendo aqui
me passei" depois.

Uma auditoria da tela Hoje contra o código real encontrou oito problemas. Três são bugs; cinco são faltas de
conteúdo que já estavam especificadas nos Blocos C4/C5/D da spec de 2026-07-27 e nunca foram implementadas.

### Os oito achados

| # | Achado | Tipo |
|---|---|---|
| 1 | `RecipeModal` mostra só a variante 0: as 3 opções de cada refeição existem em `slots[].variants[]` e são inalcançáveis pela tela | Bug |
| 2 | O contador de micro-pausas é impossível de incrementar — `rightSlotFor` devolve um `<span>` para `control: "breaks"`, enquanto água e caminhada devolvem botões | Bug |
| 3 | Sábado e domingo exibem o bloco "No trabalho · 7h–16h", e o lanche da tarde some no fim de semana | Bug |
| 4 | Barba/depilação e voz estão em "Quando precisar", não na rotina diária — apesar de serem as duas maiores alavancas de passabilidade | Falta (Bloco D 10/11) |
| 5 | O lanche das 16h tem 10–11 g de gordura, contradizendo a copy que promete sustentar caminhada + treino | Falta (Bloco C5) |
| 6 | Nenhum marcador de esforço nas refeições, apesar da restrição declarada "sou preguiçosa" | Falta (Bloco C5) |
| 7 | Meta de movimento não existe: o passeio com os cães é só um check e não alimenta nada | Falta (Bloco C3) |
| 8 | O item "Dormir" não registra hora real — checkbox sem memória, nunca mostra evolução | Falta (Bloco C6) |

### Decisões da usuária nesta rodada

- **Barba: dia sim, dia não.** Horário não especificado — o design assume **manhã, antes do skincare** (barba
  raspada de manhã dura o dia de trabalho, que é quando a passabilidade importa mais para ela). Ajustável na
  tela de horários como qualquer outro item.
- **Lanche da tarde também no fim de semana** — a critério do design; incluído, porque a fome das 16h não
  sabe que dia é.
- **Movimento medido em MINUTOS, não em passos** — ela não tem contador de passos à mão. O app já tem
  `walkGoalMin` e `dailyLog.walkMin`; é sobre isso que se constrói.
- **Ela perguntou o que fazer nas pausas** — não sabia. Isso vira conteúdo (ver Bloco C).

---

## Bloco A — Refeições

### A1. As três opções aparecem, e ela escolhe

`RecipeModal` passa a ler `plan.slots[]`, não `plan.defaultMeals[]`. Mostra as 3 variantes com o rótulo de
cada uma ("Opção 1 · Banana & ovos cozidos"), o modo de preparo de cada item, e um botão de escolher.

A escolha grava a variante em `db.meals` do dia (mesmo shape já usado), de modo que o resto do app — macros,
lista de compras, contagem de refeições feitas — passe a refletir o que ela realmente comeu, e não sempre a
opção 1.

Se já houver refeição registrada no dia, o modal abre com aquela variante marcada.

### A2. Selo de esforço em cada variante

Novo campo em `MealVariant`: `effort: "zero-preparo" | "5-min" | "air-fryer" | "lote-domingo"`.

Renderizado como etiqueta na lista de opções, para que a escolha em dia cansado não exija ler a receita
inteira. Este é o mecanismo que atende a restrição "sou preguiçosa" — o cardápio já é acessível; o que
faltava era tornar o custo de esforço legível no momento da decisão.

Equipamento confirmado: air fryer, cuscuzeira, micro-ondas e geladeira em casa; geladeira e micro-ondas no
trabalho; almoço é marmita.

### A3. O lanche das 16h vira pré-treino de verdade

Composição atual — opção 1: 2 bananas + 2 ovos cozidos (11 g de gordura); opção 2: tapioca + ovo mexido +
queijo coalho (10 g). Ela come 16h, caminha 1h com os cães e treina 17h45. Gordura e fibra alta atrasam o
esvaziamento gástrico e pesam no treino.

Novas variantes do lanche, todas ≤ 5 g de gordura, portáteis e compatíveis com geladeira no trabalho:
- **Iogurte natural + banana + aveia** — `zero-preparo`
- **Pão de forma com peito de peru + fruta** — `zero-preparo`
- **Cuscuz pequeno + banana** (feito de manhã, comido frio ou no micro-ondas do trabalho) — `5-min`

As variantes com ovo e queijo coalho **não somem**: migram para o café da manhã, onde a gordura não
atrapalha e ela tem cuscuzeira. Nenhuma receita é perdida.

---

## Bloco B — Rotina do dia

### B1. Barba entra na rotina, em dias alternados

Novo item `barba`, bloco manhã, `defaultTime: "06:15"` (entre o alongamento e o skincare). Aparece **em dias
alternados**, calculado a partir do dia do ano para ser estável e não depender de histórico.

Subtítulo liga ao guia que já existe na `DepilacaoHome` (barbear rente + dermaplaning + camuflagem com
corretivo alaranjado). O guia é bom; o problema sempre foi descoberta.

### B2. Voz entra na rotina, todo dia

Novo item `voz`, bloco noite, `defaultTime: "21:00"`, 5 min, linkando para `/beleza/voz`. Voz só melhora com
frequência — exatamente como a mobilidade, que já é micro-dose diária. Hoje está enterrada como 4ª sub-tab
de Beleza.

Com barba e voz na rotina, os dois saem do grid "Quando precisar" para não duplicar. O grid continua com
fertilidade, apoio, cabelo, estilo, corpo e maquiagem.

### B3. Fim de semana ganha blocos próprios

`buildBlocks` passa a variar o bloco do meio por dia:
- **Dia de semana:** "No trabalho · 7h–16h" com almoço, micro-pausas e água (como hoje)
- **Sábado e domingo:** "Durante o dia" com almoço, água e movimento — sem micro-pausas de expediente

O lanche da tarde passa a existir nos sete dias. No fim de semana ele fica no bloco da tarde junto com a
dança (sábado) ou o descanso (domingo).

### B4. Micro-pausas ganham botão e conteúdo

Hoje `rightSlotFor` devolve um `<span>` para `control: "breaks"` — o contador é matematicamente sempre zero,
e ele aparece em dois lugares (a linha e o `StreakCard`).

A linha passa a abrir um **card de pausa** (mesmo padrão de `RecipeModal`/`SkincareRoutineModal`) com 2 a 3
movimentos da vez, rotativos por número de pausas já feitas no dia. Marcar como feita incrementa
`dailyLog.activeBreakCount`.

**Conteúdo das micro-pausas** (novo seed). Critério de seleção: servem os alvos reais dela — glúteo dormente,
flexor de quadril encurtado, ombro protraído, cabeça anteriorizada (todos visíveis nas fotos de perfil) — e
**são discretos**, porque o ambiente de trabalho não é receptivo.

| Movimento | Duração | Discrição | Por quê |
|---|---|---|---|
| Levantar e ficar em pé | 1 min | invisível | O ganho principal é interromper o tempo sentada; o resto é bônus |
| Apertar o glúteo em pé | 10× 3s | invisível | Sentar "desliga" o glúteo; mantém a conexão acordada entre treinos |
| Queixo pra trás | 10× | invisível, sentada | Corrige cabeça anteriorizada — o que mais masculiniza a linha do pescoço de perfil |
| Juntar as escápulas | 10× 2s | invisível, sentada | Tira o ombro da frente; postura ereta é a mudança de silhueta que funciona hoje |
| Alongar flexor do quadril | 30s cada | precisa de um canto | Encurta de sentar e puxa a pelve, achatando o glúteo |
| Ir até o bebedouro | 2 min | normal | Resolve pausa, hidratação e minutos de movimento de uma vez |

Ritmo alvo: a cada 1h–1h30, ~2 min, 5 a 6 vezes no expediente.

### B5. Movimento em minutos, alimentado pelo passeio

O item dos cães passa a **creditar minutos** em `dailyLog.walkMin` ao ser marcado (1h), em vez de ser só um
check. `walkGoalMin` sobe de 30 para **75 min/dia** — o passeio cobre 60 e sobra uma folga pequena para o
deslocamento e as idas ao bebedouro, de modo que a meta seja alcançável sem ser automática.

O item de água e o de movimento mantêm os botões de incremento manual que já têm.

O texto deve continuar dizendo com clareza que o passeio é **NEAT, não cardio zona 2** — é lento, com
paradas. Não substitui os 15–20 min contínuos do fim do treino.

### B6. Dormir registra a hora real

O item `dormir` (22:30) passa de checkbox para registro: marcar grava a hora real em
`dailyLog.sleepAt`. Um novo `StreakCard` mostra quantas noites dos últimos 7 dias ela deitou até o alvo.

Sem isso o item nunca mostra evolução, e sono é a alavanca que ela mais subestima: 6h eleva cortisol, que
deposita gordura abdominal — o ponto mais largo do corpo dela.

---

## Bloco C — Sequência final do dia

Ordem resultante da tela Hoje em dia de semana, com horários padrão:

| Bloco | Item | Hora |
|---|---|---|
| **Manhã** | Alongamento · 15 min | 6h |
| | Barba (dias alternados) | 6h15 |
| | Skincare manhã | 6h25 |
| | Café + whey · montar marmita | 6h35 |
| | Sol · 10–15 min (opcional) | — |
| **No trabalho** | Almoço | 12h |
| | Micro-pausas de postura | ao longo do dia |
| | Água | ao longo do dia |
| **Saída** | Lanche pré-treino | 16h |
| | Passear com os cães · 1h | 16h40 |
| | Treino do dia | 17h45 |
| **Noite** | Jantar (pós-treino) | 19h |
| | Skincare noite | 20h |
| | Voz · 5 min | 21h |
| | Alongamento noite · 10 min | 21h30 |
| | Seu tempo: desenho + leitura | — |
| | Diário | — |
| | Dormir | 22h30 |

Todos ajustáveis em `/hoje/horarios`, que já existe.

---

## O que não muda

Fora de escopo: os ciclos de treino e a Fase de Entrada (recém-mergeados), o módulo de estilo, fertilidade,
apoio, maquiagem, e a lógica de superávit condicionado. O grid "Quando precisar" permanece, menos os dois
itens que sobem para a rotina.

Continuam pendentes de outra rodada, e devem ser registrados como tal: marcos honestos (~18 meses até 65 kg,
não 12–14), marco do exame de vitamina D com data, o "porquê" do corte de cabelo no maxilar, e a dívida dos
sete `durationMin` inflados em templates não tocados.

## Testes

- `RecipeModal` renderiza as 3 variantes com rótulo, e escolher uma grava em `db.meals`.
- Toda variante de refeição tem `effort` definido.
- Nenhuma variante do lanche passa de 5 g de gordura.
- Sábado e domingo não exibem bloco com rótulo de trabalho, e têm lanche.
- O item de barba aparece em dias alternados e não em todos.
- Voz e barba não aparecem simultaneamente na rotina e no grid de atalhos.
- Marcar micro-pausa incrementa `activeBreakCount`; a rotação de movimentos cobre todos os itens do seed.
- Marcar o passeio credita 60 min em `walkMin`.
- Os itens com horário de cada bloco seguem em ordem cronológica (teste já existente, deve continuar verde).
- Suíte existente (318 testes) permanece verde; build PWA limpo.
