# Frente 5 — Comida de verdade em Aracaju

**Data:** 2026-08-11
**Status:** aprovado, pronto pra plano de implementação

## Por que isto existe

A frente 1 mudou **quanto** ela come — 2.200 → 2.300 kcal, com os três planos
fechando exatos contra o que mostram na tela. Não mudou **o quê**.

Ela pediu duas coisas: menos ultraprocessado (citou trocar peito de peru por patê
de atum ou parecido) e comida fácil, porque se declara preguiçosa e mora em
Aracaju.

E os dois pontos de falha dela são conhecidos e estruturais: **16h**, quando sai do
trabalho com fome antes de andar 5 km, e **o jantar**, quando chega em casa às 19h30
depois de ~2h30 de movimento. Nenhum dos dois é fraqueza — são déficit agudo depois
de esforço. Plano que exige decisão com fome perde.

## Decisão 1 — o domingo carrega a semana

Decisão da usuária: **~1h30 de domingo, 2 ou 3 pratos em paralelo.** Dia de semana
vira **montar e esquentar**, entre zero e cinco minutos.

Não é o teto ambicioso de 3h: domingo longo demais vira domingo pulado, e domingo
pulado quebra a semana inteira. 1h30 com panelas em paralelo entrega proteína em
lote, um carboidrato e um feijão.

O app já tem o item "Marmita da semana" no domingo. Ele deixa de ser um item vago e
vira **roteiro com ordem de execução** — o que vai ao fogo primeiro, o que cozinha
sozinho enquanto ela faz outra coisa, e o que só precisa esfriar antes de guardar.

## Decisão 2 — o que sai e o que entra

**Sai:** peito de peru e o resto do ultraprocessado do lanche.

**Entra**, com preferência declarada por ingrediente que existe barato em Sergipe:

| Entra | Por quê |
|---|---|
| Patê de atum caseiro | pedido dela; substitui o peito de peru direto |
| **Castanha de caju** | zinco — alavanca de volume seminal (frente 2), e é produto local |
| Macaxeira, jerimum, feijão de corda | já estão no plano, ficam e ganham peso |
| Tapioca, queijo coalho, ovo | zero preparo real, alta saciedade |
| Peixe local (tainha, sardinha) | já está no plano; barato e bom no lote de domingo |
| Fruta da estação | banana já está; entra opção |

**Não entra suplemento de volume nem nada sem evidência.** A frente 2 já declarou
esse teto.

## Decisão 3 — as duas refeições que decidem o resultado

**O lanche das 15:30** (a frente 1 já moveu o horário) precisa de proteína de
verdade e ser comível na mesa de trabalho, sem preparo e sem cheiro. É ele que
segura 5 km + 1h de cães + treino. Se falhar, o jantar descontrola.

**O jantar das 19:30** tem que estar **pronto antes de ela chegar**. Não é
preferência: decidir com fome às 19h30 depois de 2h30 de movimento é o cenário em
que ela já falha hoje. Toda variante de jantar precisa ser marcada como saída do
lote de domingo ou como montagem de até 5 minutos.

## Decisão 4 — os números da frente 1 são invioláveis

Esta frente **muda os alimentos, não as metas**. Continua valendo, e há teste
guardando cada um:

- `kcalDaily` do plano de déficit = `CONSUMO.metaKcal` = **2.300**
- soma dos `targetKcal` dos slots = `kcalDaily`, **nos três planos**
- comida real da variante 0 dentro de **3%** do `kcalDaily`
- proteína entregue ≥ `CONSUMO.proteinaGMin` (**piso**, exceder é bom)
- as variantes de um mesmo slot dentro de ±15% do `targetKcal`

**Sete variantes estão hoje entre 12% e 15% de desvio** — margem apertada herdada da
frente 1. Esta frente é o lugar certo para pagar essa dívida: ao trocar alimentos,
reaproximar essas variantes do alvo.

## Decisão 5 — a dívida de manutenção e superávit

Registrada na frente 1 e **paga aqui**: os planos de manutenção (2.450) e superávit
(2.700) foram calculados contra um gasto estimado de ~2.700. Com a caminhada de 5 km
contada, o gasto real é **2.900–3.100** — ou seja, o plano chamado "manutenção" é
hoje um déficit de ~550 kcal.

Ela entra em manutenção quando a cintura chegar a 88 (mês 3–4). Se não for corrigido
antes disso, ela vai construir glúteo em déficit sem saber.

Recalibrar: manutenção ≈ **3.000**, superávit ≈ **3.300**, mantendo a invariante de
que a soma dos slots é igual ao `kcalDaily` de cada plano.

## Arquitetura

Sem módulo novo. `meal-plan-seed.ts` continua sendo a fonte, com a mesma forma:
`SLOTS` com `targetKcal` e variantes, cada variante com `foods` e `ingredients`.

| Arquivo | Mudança |
|---|---|
| `src/data/meal-plan-seed.ts` | alimentos trocados; variantes reaproximadas do alvo; manutenção e superávit recalibrados |
| `src/lib/seed.ts` | **bump da versão do plano alimentar** — sem isso não chega no aparelho |
| `src/data/*` (roteiro de domingo) | "Marmita da semana" vira roteiro com ordem de execução |
| `src/lib/shopping-list.ts` | conferir que a lista acompanha os ingredientes novos |

**`ingredients` tem que acompanhar `foods`.** Mudar quantidade de alimento sem
mudar o ingrediente correspondente faz a lista de compras divergir da receita — erro
já cometido e pego na frente 1.

## Testes

- `tests/data/meal-plan-coerencia.test.ts` (existente, estender) — mantém as
  invariantes de kcal e proteína **para os três planos** depois da recalibração
- `tests/data/sem-ultraprocessado.test.ts` — **novo**: nenhum alimento da lista
  banida (peito de peru e afins) aparece em nenhuma variante
- `tests/data/variantes-proximas-do-alvo.test.ts` — **novo**: nenhuma variante acima
  de 10% de desvio do `targetKcal` (aperta o guard de 15%, pagando a dívida)
- `tests/data/esforco-semana.test.ts` — **novo**: toda variante de jantar e de lanche
  tem `effort` de `zero-preparo`, `5-min` ou `lote-domingo`; **nenhuma exige fogão em
  dia de semana**
- `tests/lib/shopping-list.test.ts` (existente) — lista bate com os ingredientes
- `tests/lib/seeds-chegam-no-aparelho.test.ts` (estender) — versão do plano alimentar

## Fora de escopo

As metas calóricas e de proteína vêm de `src/lib/objetivo.ts` (frente 1) e **não são
alteradas aqui** — exceto a recalibração de manutenção e superávit, que é dívida
explicitamente registrada para esta frente.
