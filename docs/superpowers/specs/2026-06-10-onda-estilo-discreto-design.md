# Onda Discreto — começar discreto (sub-aba de Estilo)

**Data:** 2026-06-10
**Status:** Spec aprovado para implementação
**Abordagem escolhida:** A — sub-aba "Discreto" em Estilo (guia estático)

---

## 1. Resumo

Adiciona uma sub-aba **Discreto** em Estilo (`/beleza/estilo/discreto`) — um trilho de
experimentação gradual de feminilidade pra ambiente hostil. Guia estático em cards
expansíveis, 3 seções: escada de níveis de exposição, por categoria (o que passa e como
puxar pro feminino) e peças-curinga andróginas. Sem mudança de schema.

## 2. Contexto

A usuária vive num ambiente hostil e não mora com a namorada — não pode comprar/usar peças
femininas óbvias ainda, mas quer experimentar e evoluir conforme o corpo muda e ela ganha
espaço. Quer um caminho que comece imperceptível e fique mais ousado em segurança. Foco
escolhido: escada de níveis, por categoria, peças-curinga. (Nota de ritmo/segurança entra
breve no disclaimer, não como seção.)

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Abordagem | A — sub-aba Discreto em Estilo | Contexto natural (roupa/looks/wishlist já estão ali). |
| Conteúdo | Guia estático | Mesmo padrão de cabelo/unhas/clareamento. |
| Segurança | Linha no `DisclaimerCard` (ritmo + espaços seguros) | Respeita a seleção da usuária (não virou seção), sem ignorar o cuidado. |
| Cross-links | Texto referenciando Unhas, Cabelo, Maquiagem, Peças | Conecta os módulos sem duplicar conteúdo. |

## 4. Arquitetura

- **`src/data/estilo-discreto-seed.ts`** (novo) — `interface DiscreetSection { id; title; intro?; tips[] }` + `ESTILO_DISCRETO` (3 seções).
- **`src/pages/beauty/style/DiscreetView.tsx`** (novo) — header, `BeautyTabs` + `StyleTabs`,
  `DisclaimerCard` (ritmo/segurança), cards `<details>` de `ESTILO_DISCRETO`.
- **`src/components/StyleTabs.tsx`** — novo item `{ to: "/beleza/estilo/discreto", label: "Discreto" }`.
- **`src/main.tsx`** — rota `beleza/estilo/discreto` → `<DiscreetView />`.
- Nenhuma mudança em `db.ts`.

## 5. Conteúdo das seções

1. **Escada de níveis** (sobe no próprio ritmo):
   - Nível 1 (ninguém percebe): pele cuidada, sobrancelha alinhada, unhas limpas e lisas,
     cabelo cuidado, postura/voz, perfume neutro, roupa que veste bem.
   - Nível 2 (lê como cuidada/alternativa): corte mais comprido, base/brilho incolor na
     unha, peças unissex ajustadas, bálsamo com leve cor, acessório discreto.
   - Nível 3 (andrógino/fluido, espaços mais abertos): calça de corte feminino neutro,
     blusa com caimento, rímel discreto, esmalte nude, brinco pequeno.
   - Nível 4 (ousado, só em espaço seguro): maquiagem completa, cor nas unhas, silhueta
     feminina marcada, vestido/saia, lingerie.
2. **Por categoria (o que passa → como puxar pro feminino)** — roupa (neutros, corte que
   veste bem, gola V sutil, cintura discreta, camadas); maquiagem (começa pela pele/
   sobrancelha/bálsamo, depois rímel; cor só em espaço seguro); unhas (base/brilho incolor
   agora — ver módulo Unhas); cabelo (crescer + cuidar — ver módulo Cabelo); acessórios
   (anéis, pulseiras finas, óculos, bolsa/lenço neutros); perfume (notas mais doces/florais
   leves entram sem bandeira).
3. **Peças-curinga andróginas** (compra primeiro, passa batido, mas já feminiliza) — calça
   de corte reto/leve flare que afina a cintura; blusa/camiseta de caimento; cardigã/
   oversized que suaviza os ombros; blazer ou jaqueta jeans neutra; bralette leve por baixo
   (conforto + sugestão de busto); lenço/echarpe + acessórios pequenos. Cada uma com o
   "porquê funciona" pro corpo-alvo.

> `DisclaimerCard`: vá no seu ritmo — sua segurança vem primeiro; deixe o ousado pros
> espaços seguros (casa, com a amada, ambientes queer). Não é corrida.

## 6. Testes

| Tipo | Cobertura |
|---|---|
| Conteúdo (Vitest) | `ESTILO_DISCRETO` tem 3 seções com `id`/`title`/`tips` não-vazios; ids únicos. |

## 7. Fora de escopo

- Catálogo navegável de peças com fotos (a sub-aba Peças já cobre garments). O guia cita
  as peças-curinga como texto.
- Modo discreto/PIN no app — a usuária já decidiu não ter (spec original).

## 8. Critérios de aceite

- Sub-aba "Discreto" aparece em Estilo e abre o guia com 3 cards + disclaimer.
- `npm test` passa.
