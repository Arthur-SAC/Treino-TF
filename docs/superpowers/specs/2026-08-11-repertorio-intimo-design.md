# Frente 4 — Repertório íntimo

**Data:** 2026-08-11
**Status:** aprovado, pronto pra plano de implementação

## Por que isto existe

O app já tem três sequências de intimidade — `intimidade-grinding`,
`intimidade-cavalgar`, `intimidade-flex-passiva` — e elas já são boas e honestas.
A de cavalgar chega a avisar que penetrar naquela posição depende de manter a
ereção sob compressão e "nem sempre dá".

Então esta frente **não cria do zero: ela aprofunda e corrige** com o que a usuária
contou e o app não sabia.

Três coisas que o conteúdo atual erra ou não cobre:

1. **Ele assume que os dois se revezam.** A realidade dela: ela fica **sempre por
   cima**, e a noiva por cima "não rola por enquanto". Metade das dicas atuais
   pressupõe uma configuração que não acontece.
2. **Ele trata grinding como técnica, não como esforço.** Manter 20 minutos por
   cima, em espaço apertado, é tarefa de resistência de lombar, flexor de quadril e
   glúteo. Ela desiste antes da noiva, e isso não é falta de tesão — é
   condicionamento. `rebolado-basico` é 3×1 min; está subdimensionado.
3. **Falta a via que a noiva aceita.** A noiva quer penetrá-la, **recusou
   strap-on** ("não acha legal um treco") e quer sensação mútua. A via é mão e
   dedos — carne dos dois lados — e o app não tem nada sobre isso.

## Decisão 1 — nível de explicitude

Decisão da usuária: **técnico e direto.** O app nomeia parte do corpo, ângulo,
pressão, ritmo e duração, como manual de técnica. **Não narra cena e não usa
linguagem erótica.** A régua: cada frase tem que ser executável na hora; se for
só excitante, sai.

## Decisão 2 — grinding reescrito para a configuração real dela

`intimidade-grinding` é reescrita assumindo **ela por cima, sempre**, inclusive em
espaço apertado (o carro, com a noiva reclinada no banco do passageiro).

Conteúdo que precisa estar lá, e hoje não está:

**O movimento é frente-e-trás, não cima-e-baixo.** Estocada serve para penetração e
não faz nada pelo clitóris. O que funciona é o púbis dela deslizando contra o da
noiva com contato que **nunca se rompe**.

**A regra que decide o resultado:** quando a respiração da noiva mudar, **congelar
as variáveis** — mesma velocidade, mesma pressão, mesmo ângulo, até o fim. O erro
quase universal é acelerar quando a pessoa responde. Vai ficar monótono para ela
muito antes de ficar para a noiva; aguentar essa monotonia é a habilidade.

**As mãos da noiva na bunda dela são o canal de comando.** Ela não pode ceder o
controle de posição, mas a noiva já segura exatamente onde o comando mora: puxar =
mais forte, segurar parado = mantém o ritmo. Resolve o problema de calibragem sem
precisar falar, usando algo que as duas já fazem.

**O pinto vai para cima, preso contra a barriga, por dentro do cós.** Três razões,
todas verdadeiras ao mesmo tempo: o púbis dela encosta no da noiva (é a superfície
que faz a pressão); ele não é dobrado a cada movimento; e a glande sai da linha de
frente do atrito, o que **melhora o controle dela**. A mesma escolha serve à noiva e
à precocidade. Cueca justa segura; cueca larga deixa escapar. Isto **não é tuck** —
tuck é para aparência com roupa e é incompatível com ereção.

**Tempo:** a maioria precisa de 15 a 25 minutos de estímulo contínuo. Grinding
falha quase sempre por ser tratado como preliminar e interrompido no meio.

## Decisão 3 — "esfregar com roupa" vira conteúdo próprio

Elas já brincam disso e a usuária quer que termine em orgasmo. É sequência
separada, porque o fator decisivo não é o corpo, é o tecido:

- **A costura frontal do jeans é a vilã** — grossa, rígida, e cai exatamente sobre o
  clitóris. Nenhuma roupa de baixo compensa. Malha, moletom fino ou legging sem
  costura grossa na frente.
- **Atrito seco assa depois de 15 min.** Desconforto dela nesse ponto é abrasão, não
  falta de tesão.
- **A escada:** começa vestida por completo e reduz camada ao longo de meia hora. A
  barreira é o que faz funcionar; tirar roupa cedo demais destrói o mecanismo.
- **Serve à usuária também:** é a melhor situação para treinar o próprio controle —
  excitação alta, estímulo indireto, sem o gatilho da penetração. É start-stop feito
  a dois.

## Decisão 4 — a via que a noiva aceita

Sequência nova sobre **receber por mão e dedos**, que é o que a noiva quer e aceita:

- carne dos dois lados, sensação mútua real — coisa que strap-on nenhum entrega;
- progressão em escada: preparo, um dedo, mais, ao longo de meses;
- lubrificante em quantidade que parece exagero e não é;
- a habilidade que sustenta tudo é o **relaxamento voluntário do assoalho pélvico**,
  que é a fase 2 da **frente 2** — esta frente consome aquilo, não duplica;
- fisting é o horizonte distante dessa via, nomeado como tal, **não** como próximo
  passo.

**Grinding coxa a coxa** entra como a resposta ao "sentir junto": prazer simultâneo,
zero equipamento, e é literalmente o que a noiva já elogia.

## Decisão 5 — rebolado vira trabalho de resistência

`rebolado-basico` (3×1 min) e as sequências de dança viram progressão de
**resistência**, porque é isso que a queixa dela descreve:

| Fase | Alvo |
|---|---|
| 1 | 3 × 1 min (o que existe hoje) |
| 2 | 3 × 2 min contínuos |
| 3 | 2 × 4 min contínuos |
| 4 | 5+ min contínuos sem perder ritmo |

Complementos que sustentam o movimento sob carga: resistência de lombar
(extensão isométrica), flexor de quadril, e glúteo em alta repetição. Isso **não
soma tempo de academia** — mora nas sequências de movimento, que são separadas do
treino de força.

## Arquitetura

**Módulo novo `src/lib/rebolado-progression.ts`** — puro, mesmo padrão de
`pelvic-progression.ts` e `flex-progression.ts` (frente 3).

**Sequências** em `sequences-seed.ts`, `category: "intimidade"`:

| id | Estado |
|---|---|
| `intimidade-grinding` | **reescrita** — ela sempre por cima, congelar variáveis, pinto pra cima, tempo |
| `intimidade-esfregar-roupa` | **nova** — tecido, escada de camadas, treino de controle |
| `intimidade-receber-maos` | **nova** — progressão de receber, consome a soltura da frente 2 |
| `intimidade-cavalgar` | mantida, ajustada para "sempre por cima" |
| `rebolado-*` fases 2 a 4 | **novas** — resistência |

`MOVEMENT_VERSION` precisa de bump — sem isso nada disso chega no aparelho dela.

## Testes

- `tests/lib/rebolado-progression.test.ts` — fases e progressão de duração
- `tests/data/intimidade-configuracao.test.ts` — nenhuma sequência de intimidade
  pressupõe a noiva por cima; `intimidade-grinding` contém a regra de congelar as
  variáveis e a orientação do pinto para cima
- `tests/data/intimidade-strapon.test.ts` — nenhuma sequência propõe strap-on como
  solução (a noiva recusou; propor de novo é o app não escutar)
- `tests/data/sequences-seed.test.ts` (estender) — as novas existem e têm `focus`
- `tests/lib/seeds-chegam-no-aparelho.test.ts` (estender) — `MOVEMENT_VERSION`

## Fora de escopo

O treino do assoalho pélvico em si é **frente 2** — esta frente **consome** aquele
módulo e não redefine nada dele. Flexibilidade de quadril é **frente 3**.

Nada de narrativa erótica: o app descreve mecanismo e execução.
