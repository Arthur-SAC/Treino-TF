# Onda Cabelo — jornada de crescimento

**Data:** 2026-06-10
**Status:** Spec aprovado para implementação
**Abordagem escolhida:** A — hub de jornada de crescimento (conteúdo estático + re-tematização)

---

## 1. Resumo

O módulo de cabelo foi montado pra *manter um pixie cacheado curto*. A usuária mudou o
objetivo: quer **deixar crescer até um pouco abaixo dos ombros**. Esta onda transforma a
tela de cabelo num **hub de jornada de crescimento**: mantém o cronograma capilar +
registro + histórico que já funcionam, adiciona quatro cards de guia (crescimento,
retenção de comprimento, fase chata/cortes de transição, definição de cachos) e corrige o
marco de cabelo na Trilha. Sem rastreamento de comprimento (decisão da usuária) e sem
migração de schema.

## 2. Contexto

- Cabelo natural cacheado, escuro, hoje curto. **Sem química e sem calor** (prancha/
  secador), e **sem rotina fixa** — ponto de partida saudável, sem dano acumulado.
- Objetivo: crescer até um pouco abaixo dos ombros, cachos saudáveis e definidos.
- Restrição de tempo: rotina simples, dentro da ~1h/dia total.
- Decisões da usuária nesta onda: **não rastrear comprimento** (sem cm, sem fases/foto);
  incluir as três camadas (retenção, fase chata/cortes, definição) de forma enxuta.

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Abordagem | A — re-tematizar a tela + cards de guia | Entrega as camadas pedidas sem overengineering; segue o padrão de conteúdo do app. |
| Rastreamento de comprimento | Nenhum | Decisão explícita da usuária ("só rotina e saúde"). |
| Conteúdo dos guias | Estático em seed TS | Sem tabela/migração de schema; renderizado direto na tela. |
| Cronograma | Mantém (hidratação semanal · nutrição quinzenal · reconstrução mensal) | Continua válido pro crescimento; só re-tematiza a cópia de "pixie" → "crescimento". |
| Marco da Trilha | Atualiza o marco "pixie" → crescimento, com migração | Corrige também na conta atual da usuária. |

## 4. Arquitetura

- **`src/data/hair-guide-seed.ts`** (novo) — constante estática:
  ```ts
  export interface HairGuideSection { id: string; title: string; intro?: string; tips: string[]; }
  export const HAIR_GUIDE: HairGuideSection[];
  ```
  Quatro seções (ver §5). Conteúdo, não dados de DB.
- **`src/pages/beauty/HaircareHome.tsx`** (modificar) — cabeçalho vira "Cabelo · jornada de
  crescimento"; renderiza os cards de `HAIR_GUIDE` (expansíveis, `<details>`/estado local)
  acima do bloco de cronograma; cópia do cronograma re-tematizada (sem "pixie"). Registro e
  histórico de `HaircareEntry` **inalterados**.
- **`src/data/milestones-seed.ts` + `src/lib/path-seed.ts`** — atualizar o marco de cabelo
  e migrar (versão 4) pra corrigir contas existentes.
- Nenhuma mudança em `db.ts` (sem store/índice novo). `HaircareEntry` permanece igual.

## 5. Conteúdo dos guias (§5 — quatro seções)

1. **Crescimento & cronograma** — cresce ~1cm/mês; cacho "encolhe" (shrinkage), parece
   mais curto do que é, paciência; cronograma hidratação semanal / nutrição quinzenal /
   reconstrução mensal (não exagerar proteína, que resseca/quebra); couro cabeludo
   saudável (massagem, limpeza sem agredir); proteína/colágeno vêm da dieta (já no plano);
   constância > intensidade.
2. **Retenção de comprimento** — fronha ou touca de cetim; dormir com o cabelo protegido
   (trança/coque frouxo); baixa manipulação; desembaraçar só úmido, com condicionador,
   dedos ou pente de dente largo, da ponta pra raiz; aparar **só as pontas** a cada 3-4
   meses (tira a ponta dupla sem perder comprimento); secar com camiseta de algodão ou
   microfibra, sem esfregar; manter longe de calor e química (já faz).
3. **Fase chata + cortes de transição** — o meio-termo passa por formatos esquisitos (o
   "triângulo" do cacho, laterais "abrindo"); aparar pra dar **forma** (camadas longas)
   sem encurtar; o que pedir no salão: "quero deixar crescer — só dar forma e tirar as
   pontas, camadas longas, **sem diminuir o comprimento**"; disfarçar com presilha,
   bandana, headband, meio-coque; não cortar por impulso na fase chata.
4. **Definição de cachos** — lavar com shampoo suave/co-wash; aplicar leave-in + gel/
   gelatina no cabelo **encharcado**; "scrunch" pra formar o cacho; plopping com camiseta;
   secar ao natural ou difusor em temperatura/velocidade baixas; não mexer enquanto forma
   a "casquinha" (cast) e depois soltar amassando; refrescar com borrifador de água nos
   dias seguintes; produtos acessíveis BR (leave-in/creme pra cachos, gel/gelatina).

> Disclaimer suave: são boas práticas gerais; resultado varia por tipo de fio. Não
> substitui terapeuta capilar/tricologista, coerente com o disclaimer do app.

## 6. Marco da Trilha

Substituir o marco existente (mês 6) "Marco visual: pixie cacheado formato definido" por
um marco de crescimento:

- **Título:** "💇‍♀️ Cabelo na fase de transição — manter forma e saúde crescendo"
- **Notas:** "Com cronograma consistente + retenção (cetim, baixa manipulação, aparar só
  pontas), o cabelo deve estar visivelmente mais comprido e saudável. Fase do meio-termo:
  dar forma com camadas longas sem encurtar, disfarçar formatos esquisitos com acessórios.
  Rumo a um pouco abaixo dos ombros."
- **Migração:** `MILESTONE_SEED_VERSION` 3 → 4. Bloco de migração `if (msVersion < 4)` que
  **localiza** o marco antigo pelo título (contém "pixie") e o **atualiza** (título +
  notas) se existir; se não existir, adiciona o novo. Idempotente.

## 7. Testes

| Tipo | Cobertura |
|---|---|
| Conteúdo (Vitest) | `HAIR_GUIDE` tem as 4 seções com `id`/`title` e `tips` não-vazio; ids únicos. |
| Migração (Vitest) | `seedPath()` 2x não duplica marcos; após migração não resta marco com "pixie" no título e existe o marco de transição. |

## 8. Fora de escopo

- Rastreamento de comprimento (cm/fases/foto) — decisão da usuária.
- Rotina de "dia de lavagem" com passos/logs no banco (Abordagem B) — descartada.
- Seed de produtos de cabelo na loja de produtos — produtos citados como texto no guia.

## 9. Critérios de aceite

- A tela de cabelo mostra "jornada de crescimento" com 4 cards de guia expansíveis e o
  cronograma re-tematizado; registro/histórico seguem funcionando.
- Conta existente tem o marco de cabelo atualizado (sem mais "pixie") após a migração.
- `npm test` passa.
