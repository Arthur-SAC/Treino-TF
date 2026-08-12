# Frente 6 — Três modos de estilo

**Data:** 2026-08-11
**Status:** aprovado, pronto pra plano de implementação

## Por que isto existe

O módulo Estilo hoje se organiza por **tipo de coisa**: Paleta, Peças, Combinações,
Looks, Wishlist, mais duas abas soltas (Íntimo, Discreto). Ela não se veste por tipo
de peça — se veste por **contexto**.

E o modelo de dois valores que o código usa (`Garment.discretion: "discreto" |
"livre"`) não cobre o que ela descreveu: são **três** contextos, não dois.

## Correção obrigatória herdada da frente 1

O spec da frente 1 registrou que "público masculino é escolha declarada dela".
**Está errado, e ela corrigiu em 2026-08-11:**

> "eu queria público meio andrógino mas com uma pegada segura pro ambiente que vivo"

Público **não é masculino** — é **andrógino com calibragem de segurança**. A
diferença importa porque andrógino não é um ponto fixo: é uma faixa dentro da qual
ela sobe e desce conforme o dia e o ambiente. Todo texto do app que disser
"masculino em público" precisa ser corrigido nesta frente.

## Decisão 1 — os três modos viram o eixo

Decisão da usuária. O módulo passa a abrir pelo contexto:

```
ESTILO
├─ Público   andrógino, com teto de segurança
├─ Casa      ela mesma
└─ Íntimo    lingerie
      └─ peças · combinações · looks dentro de cada
```

**Público** — vive entre os níveis 1 e 3 da escada que já existe em
`estilo-discreto-seed.ts`. O nível 3 (calça de corte feminino, blusa com caimento,
rímel discreto, esmalte nude) é o **teto que o ambiente comporta**, não o teto do
que ela quer. A escada permanece como o mecanismo de calibragem do dia.

**Casa** — sem teto de segurança. Shortinho, peça justa, peça folgada. O eixo aqui
**não é esconder ou mostrar**: é o que valoriza o que ela está construindo — bunda,
cintura, perna.

Uma distinção que precisa estar escrita, porque ela mesma a nomeou sem perceber que
eram duas técnicas: *"justas ou folgadas mas que marquem bem ou deixem mais
visível"*. **Justa marca por contato; folgada marca por contraste** — ombro solto
sobre cintura marcada faz o quadril parecer maior. As duas servem, por mecanismos
opostos, e cada peça de casa é etiquetada pelo efeito que produz.

**Íntimo** — com a divisão descoberta em 2026-08-11 e que o app ainda não tem:

| | Para quê | Critério |
|---|---|---|
| **De ver** | ela olhar | renda, transparência, detalhe |
| **De usar** | grinding e sexo | microfibra lisa, **sem costura frontal**, compressão firme, cós alto |

Renda é abrasiva em 15–25 min de atrito contínuo e machuca a noiva; costura frontal
central é uma crista que rala. A peça mais funcional é a menos glamourosa, e o app
precisa dizer isso em vez de deixar ela descobrir doendo.

## Decisão 2 — a camada de baixo é um modo dentro do outro

Os modos **não são exclusivos**. Ela declarou o que quer:

> "a ideia de usar uma calça mais larga e uma camisa mais solta e por baixo ter uma
> lingerie sexy e safada"

Isso é **Público por fora e Íntimo por baixo, ao mesmo tempo**. O modelo de dado
precisa suportar um look que combina modo de fora e camada de baixo — senão o app
força ela a escolher entre os dois e perde exatamente a coisa que ela pediu.

Consequência prática: cós alto serve às três funções de uma vez — alonga a bunda,
comprime a barriga (que é o problema dela hoje) e segura o pinto para cima, que é o
que a frente 4 prescreve para grinding. É a peça que aparece nos três modos.

## Decisão 3 — o dado migra de dois valores para três

`Garment.discretion: "discreto" | "livre"` vira três modos. **Isso é migração de
banco**, e as peças que ela já cadastrou precisam sobreviver:

- `"discreto"` → `"publico"`
- `"livre"` → **precisa de decisão por peça**, porque hoje agrupa casa e íntimo

Regra de migração: peças com `category: "intimate"` viram `"intimo"`; as demais
`"livre"` viram `"casa"`. Peça que ela criou fica com o estado dela preservado — o
seed nunca sobrescreve o que ela editou.

## Decisão 4 — tamanhos e compra ficam registrados

Descoberto em 2026-08-11 e hoje sem lugar no app:

- **Compra-se pelo quadril e pela coxa, nunca pela cintura.** Cueca é vendida por
  cintura, calcinha por quadril; ela tem 15 cm de diferença e coxa grossa. Peça
  apertada na coxa achata a bunda.
- Tamanhos atuais: **GG** em cueca (tabela Lupo: cintura 96–101, quadril 111–116 —
  as duas medidas dela caem no meio), **52** em calcinha plus.
- **A tabela varia por marca** — a Zorba começa o GG em cintura 100, e ela cai fora.
  Conferir sempre a faixa que contém 114 de quadril.
- **Aviso de compra:** cintura vai de 99 a ~84 e quadril de 114 a ~106 em 6–8 meses,
  e o quadril volta a 114 na fase 2. O tamanho faz 52 → 48/50 → 52. Comprar enxoval
  completo agora é dinheiro com data de validade; 2 ou 3 peças até o marco dos 88.

Isso vira conteúdo dentro do modo Íntimo e da Wishlist, ligado aos alvos de
`objetivo.ts` — quando a cintura mudar, o aviso muda junto.

## Arquitetura

| Arquivo | Mudança |
|---|---|
| `src/lib/db.ts` | `Garment.discretion` → três modos; migração de versão |
| `src/lib/style-seed.ts` | **bump de `styleSeedVersion`** (hoje 3) + migração dos dois valores para três |
| `src/components/StyleTabs.tsx` | abas viram os três modos; Paleta/Wishlist ficam dentro |
| `src/pages/beauty/style/*` | navegação por modo; `DiscreetView` e `IntimateView` viram as telas de Público e Íntimo; tela de Casa é nova |
| `src/data/garments-seed.ts` | cada peça recebe o modo; peças de casa ganham o efeito (marca por contato × por contraste) |
| `src/data/estilo-discreto-seed.ts` | escada vira o calibrador do modo Público; "masculino" some |
| `src/main.tsx` | rotas |

## Testes

- `tests/data/tres-modos.test.ts` — **novo**: toda peça tem um dos três modos; nenhuma
  ficou com valor antigo
- `tests/lib/style-seed-migracao.test.ts` — **novo**: `"discreto"` → `"publico"`;
  `"livre"` + `intimate` → `"intimo"`; `"livre"` + resto → `"casa"`; peça editada por
  ela sobrevive; rodar duas vezes não duplica
- `tests/data/publico-nao-e-masculino.test.ts` — **novo**: nenhum texto do app
  descreve o modo público como "masculino"
- `tests/data/intimo-ver-usar.test.ts` — **novo**: peças íntimas declaram se são de
  ver ou de usar; nenhuma peça de renda é recomendada para grinding
- `tests/lib/seeds-chegam-no-aparelho.test.ts` (estender) — `styleSeedVersion`

## Fora de escopo

Maquiagem, cabelo, unhas e depilação continuam nos módulos próprios. Esta frente
mexe em roupa e em como o app organiza contexto de vestir.
