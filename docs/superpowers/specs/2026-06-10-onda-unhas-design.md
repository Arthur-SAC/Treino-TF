# Onda Unhas — guia de cuidado

**Data:** 2026-06-10
**Status:** Spec aprovado para implementação
**Abordagem escolhida:** A — página de guia (conteúdo estático), sem tracker

---

## 1. Resumo

Módulo novo de unhas como página de guia dentro do hub de Beleza (`beleza/pele-cabelo/unhas`),
no mesmo padrão do guia de cabelo: cards expansíveis com conteúdo estático, sem
rastreamento. Quatro seções: saúde/fortalecimento, cutícula/mãos, curtas-lisas-bonitas
(formato + intimidade) e esmalte discreto x ousado. Sem mudança de schema. De passagem,
corrige o subtítulo "pixie cacheado" do card Cabelo no hub.

## 2. Contexto e constraints da usuária

- Quer unhas cuidadas e femininas, mas **curtas obrigatoriamente**: por atenção/discrição
  (ambiente hostil) e por momentos íntimos (unha grande atrapalha; ativa e passiva).
- Foco escolhido: saúde/fortalecimento, cutícula/mãos, esmalte discreto x ousado. Formato
  entra pela ótica de "curtas, lisas e bonitas" (não comprimento).
- Sem rastreamento (coerente com a preferência da onda de cabelo).

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Abordagem | A — guia estático | Entrega o conteúdo sem overengineering; reusa o padrão do guia de cabelo. |
| Tracker | Nenhum | Não foi pedido; mantém enxuto. |
| Localização | Card + rota no hub `beleza/pele-cabelo` | Igual a Skincare/Cabelo/Depilação. |
| Feminilidade | Cuidado, formato e brilho — não comprimento | Constraint da usuária (discrição + intimidade). |

## 4. Arquitetura

- **`src/data/nails-guide-seed.ts`** (novo) — reusa a forma do guia de cabelo:
  ```ts
  export interface NailGuideSection { id: string; title: string; intro?: string; tips: string[]; }
  export const NAILS_GUIDE: NailGuideSection[]; // 4 seções
  ```
- **`src/pages/beauty/NailsHome.tsx`** (novo) — header "Unhas", `BeautyTabs`, intro, cards
  expansíveis (`<details>`) de `NAILS_GUIDE`. Mesmo visual da `HaircareHome`.
- **`src/main.tsx`** — rota `beleza/pele-cabelo/unhas` → `<NailsHome />`.
- **`src/pages/beauty/BeautyHome.tsx`** — card "Unhas" (link pra rota) + corrigir subtítulo
  do card Cabelo de "Cronograma capilar pro pixie cacheado" → "Jornada de crescimento dos cachos".
- Nenhuma mudança em `db.ts`.

## 5. Conteúdo das seções

1. **Saúde e fortalecimento** — proteína na dieta; óleo de cutícula e hidratação diária;
   base fortalecedora; hábitos que destroem a unha (usar de ferramenta, descascar esmalte,
   acetona pura demais, roer); luva pra limpeza com químicos; manter unhas secas evita
   descamar.
2. **Cutícula e mãos** — não cortar cutícula (empurrar de leve depois do banho + óleo);
   creme de mãos sempre; manutenção semanal rápida (lixar + hidratar); esfoliar as mãos de
   vez em quando.
3. **Curtas, lisas e bonitas (formato + intimidade)** — manter curtas; lixar num sentido só
   (vai-e-vem lasca); formato arredondado/quadrado-suave que afina o dedo; brilho pelo
   polimento (buffer), não pelo comprimento; **borda bem lisa, sem cantos/farpas** — por
   discrição e por intimidade (conforto e segurança, ativa ou passiva); checar o polegar/
   indicador especialmente.
4. **Esmalte: discreto x ousado** — discreto que passa batido (base, brilho incolor, nude/
   rosado translúcido — "suas unhas, melhores") pro trabalho/atenção; ousado (cor,
   francesinha) em casa/com a amada; aplicação que dura (camadas finas, base + top coat,
   selar a pontinha); remoção rápida com algodão+acetona cremosa quando precisar voltar ao
   discreto.

> Disclaimer suave: boas práticas gerais, não substitui manicure/dermatologista.

## 6. Testes

| Tipo | Cobertura |
|---|---|
| Conteúdo (Vitest) | `NAILS_GUIDE` tem 4 seções com `id`/`title`/`tips` não-vazios; ids únicos. |

## 7. Fora de escopo

- Tracker/registro de manutenção (Abordagem B).
- Unhas longas / alongamento em gel/fibra — contra a constraint da usuária.
- Esmalte como catálogo de produtos no store — citado como texto no guia.

## 8. Critérios de aceite

- Card "Unhas" no hub abre a página com 4 cards de guia expansíveis.
- Subtítulo do card Cabelo corrigido (sem "pixie").
- `npm test` passa.
