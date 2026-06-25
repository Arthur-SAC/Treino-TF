# Estilo — Combinações + eixo de discrição

**Data:** 2026-06-25
**Módulo:** Beleza → Estilo
**Continua de:** Onda 2 Parte 2 (módulo Estilo já existente: Paleta, Peças, Looks, Wishlist, Íntimo)

## Contexto e motivação

A usuária quer montar **combinações de roupa pra ir comprando e testando**, com acessórios e cores, partindo de uma ideia: não é a roupa "ser feminina" que feminiza — é o **caimento, corte e tamanho** que moldam a silhueta (uma blusa de corte masculino num tamanho menor pode feminizar mais que uma de corte feminino).

Duas restrições reais definem o desenho:

1. **Ambiente não receptivo.** No dia a dia, roupas nitidamente femininas (saia, sutiã aparente, maquiagem) não são aceitas. Ela precisa de conjuntos **"masculinos mas femininos"** que passem despercebidos — calça de cintura alta, modelagem ajustada, grooming discreto (esmalte, sobrancelha, pele). Peças abertamente femininas ficam reservadas pra **quando ela for morar com a noiva** (espaço seguro / casa).
2. **Corpo atual com bastante barriga.** O styling não é só feminizar — é **criar cintura e disfarçar a barriga** ao mesmo tempo, sem TRH (adiada por preservação de fertilidade).

O módulo Estilo hoje tem um catálogo de **peças avulsas** (muitas abertamente femininas) e não tem o conceito de **conjunto montado** nem um eixo de **discrição**. Este design adiciona os dois.

## O que já existe (não muda de comportamento)

- `Paleta` — subtom, contraste, cores favoráveis/desfavoráveis (paleta amazona: vinho, nude quente, ferrugem).
- `Peças` (`Garment`) — catálogo com `whyItWorks` e `cautions`.
- `Looks` — fotos do que vestiu, com rating.
- `Wishlist` — peças avulsas pra comprar.
- `Íntimo` — catálogo íntimo/sensual.
- `Discreto` — **guia já existente** (`GuideAccordion` sobre `ESTILO_DISCRETO`): escada de níveis (do imperceptível ao ousado em espaço seguro), "o que passa → como puxar pro feminino" por categoria, e lista de **peças-curinga andróginas**. É conteúdo estático, sem combinações nem acompanhamento de compra/teste.

### Por que ainda falta algo

A aba `Discreto` já cobre os **princípios** (níveis, categorias, curingas) e a parte conceitual do eixo de discrição. O que **não existe** e é o pedido central da usuária: **combinações montadas como itens acompanháveis** — conjuntos concretos (top + baixo + acessório + cor) com *status* `ideia → comprando → tenho → testei`, pra ir comprando e testando. Este design entrega isso e evita duplicar o guia Discreto (a tela de Combinações **linka** pra ele em vez de reexplicar os princípios).

## Decisões de design

### 1. Modelo de dados

**`Garment` ganha dois campos** (`src/lib/db.ts`):

```ts
export interface Garment {
  id: string;
  name: string;
  category: "top" | "bottom" | "dress" | "outerwear" | "intimate";
  occasion: string[];
  whyItWorks: string;
  cautions?: string;
  imagePath?: string;
  discretion: "discreto" | "livre";   // NOVO — passa despercebido no dia a dia × só casa/noiva
  fitTip?: string;                     // NOVO — dica de corte/caimento/tamanho (a sacada do vídeo)
}
```

Como `discretion`/`fitTip` não são indexados, não exigem mudança de schema do Dexie — só re-seed dos dados.

**Nova tabela `outfits`** (`db.version(8)`):

```ts
export interface Outfit {
  id?: number;
  name: string;
  context: "discreto" | "livre";       // dia a dia × casa/noiva
  occasion: string;                    // trabalho, casual, sair, casa…
  pieces: string[];                    // ["calça alfaiataria cintura alta", "camiseta encorpada slim", "blazer estruturado", "tênis", "esmalte nude"]
  whyItWorks: string;                  // por que o conjunto funciona
  silhouetteNote: string;              // "cria cintura + disfarça barriga com a camada do blazer"
  status: "ideia" | "comprando" | "tenho" | "testei";
  notes?: string;
  lookId?: number;                     // status "testei" pode linkar a um Look (foto)
}
```

Schema Dexie: `outfits: "++id, context, status"`.

`pieces` é um array de strings livres (não referências a `Garment`) — uma combinação pode citar peças que não estão no catálogo, e isso mantém a criação simples.

### 2. Conteúdo (seed)

**~8 peças novas, discretas e pró-silhueta/pró-barriga** — todas `discretion: "discreto"`, cada uma com `fitTip` e `whyItWorks` focados em **criar cintura e disfarçar barriga sem parecer "roupa feminina"**. Exemplos de direção:

- Calça de alfaiataria de cintura alta (alonga, marca cintura, esconde barriga).
- Camisa de botão estruturada levemente entallada (marca ombro→cintura sem colar na barriga).
- Blazer de ombro marcado + leve cintura (V invertido + cintura = ampulheta sutil).
- Camiseta encorpada de corte slim em tecido que desliza, não cola na barriga.
- Camada longa aberta (colete/cardigã longo) — linha vertical que afina e disfarça a barriga.
- Jaqueta curta que para na cintura (ponto focal alto).
- Suéter/tricô fino com caimento sobre cintura alta.
- Cinto fino discreto na cintura alta sob uma camada (marcação sutil).

**Retroclassificação das ~20 peças atuais:** atribuir `discretion` a cada uma. Saia, vestido, peplum, bodycon → `livre`. Calça cintura alta, decotes, casaco com cinto, legging → conforme o caso (`discreto` quando passa despercebido). Peças `intimate` → `livre`.

**~6 combinações seed:** ~4 **discretas** (trabalho neutro, casual fim de semana, camadas verticais, etc.) + ~2 **livres** (casa/com a noiva), já montadas com `whyItWorks` + `silhouetteNote`, prontas pra comprar/testar (status inicial `"ideia"`).

**Sem card de Princípios próprio** (evita duplicar a aba Discreto). No topo da `CombosView` entra apenas um link curto: "Os princípios estão na aba **Discreto**" apontando pra `/beleza/estilo/discreto`.

### 3. Navegação e telas

- **`StyleTabs`** ganha a aba **Combinações** entre Peças e Looks (a aba `Discreto`, que já existe, continua no fim):
  `Paleta · Peças · Combinações · Looks · Wishlist · Íntimo · Discreto`.
- **`CombosView`** (`src/pages/beauty/style/CombosView.tsx`) — lista de combinações com filtro **Discreto / Livre / Todas** e por status; card (`OutfitCard`) mostra nome, peças, `silhouetteNote` e status. No topo, link curto pra aba Discreto (princípios). Botão "+ novo".
- **`ComboNew`** (`src/pages/beauty/style/ComboNew.tsx`) — criar combinação própria (nome, contexto, ocasião, peças, por que funciona, nota de silhueta, status).
- **`ComboDetail`** (`src/pages/beauty/style/ComboDetail.tsx`) — ver/editar e avançar o status (ideia → comprando → tenho → testei); apagar.
- **`GarmentsView`** (Peças) ganha o mesmo filtro **Discreto / Livre**, somado ao filtro de categoria existente — assim a aba que já existe passa a priorizar o dia a dia discreto.

Novo componente `OutfitCard` (`src/components/OutfitCard.tsx`). Todas as telas seguem a paleta amazona e os padrões visuais dos componentes existentes (`card`, `bg-wine-light`, `text-nude-warm`, `rounded-pill`, etc.).

### 4. Migração / seed

- `db.version(8)` adiciona a tabela `outfits`.
- O seed atual (`seedStyle`) trava com a flag `styleSeeded`. Cria-se uma flag nova **`styleSeededV2`** que, ao rodar:
  - aplica `discretion` (e `fitTip` quando houver) às peças já existentes via `db.garments.put`,
  - adiciona as ~8 peças novas,
  - adiciona as ~6 combinações.
  - É idempotente e **não apaga nada** já salvo pela usuária (looks, wishlist, combinações próprias).

### 5. Testes

- `tests/lib/style-seed.test.ts` (estende o existente): toda peça tem `discretion`; combinações foram populadas e têm `context`, `silhouetteNote`, `status`; idempotência do seed V2.
- `tests/pages/combos.smoke.test.tsx`: `CombosView` renderiza, mostra o card de Princípios e o filtro Discreto/Livre funciona.

## Fora de escopo (YAGNI)

- Referenciar `Garment` por id dentro de `outfits.pieces` (strings livres bastam).
- Reorganização "Dois guarda-roupas" com toggle global (caminho B descartado).
- Maquiagem / sutiã aparente no dia a dia (só entram em combinações `livre`).
- Gerador automático de combinações.

## Arquivos afetados

```
src/lib/db.ts                                  # +campos Garment, +tabela outfits, +version(8)
src/data/garments-seed.ts                      # +discretion/fitTip nas existentes, +~8 peças
src/data/outfits-seed.ts                        # NOVO — ~6 combinações + princípios
src/lib/style-seed.ts                           # flag styleSeededV2, aplica discrição + novas peças + combos
src/components/StyleTabs.tsx                    # +aba Combinações
src/components/OutfitCard.tsx                   # NOVO
src/components/GarmentCard.tsx                  # (eventual) badge de discrição
src/pages/beauty/style/CombosView.tsx          # NOVO
src/pages/beauty/style/ComboNew.tsx            # NOVO
src/pages/beauty/style/ComboDetail.tsx         # NOVO
src/pages/beauty/style/GarmentsView.tsx        # +filtro Discreto/Livre
src/main.tsx                                    # +rotas combinações
tests/lib/style-seed.test.ts                   # estende
tests/pages/combos.smoke.test.tsx              # NOVO
```
