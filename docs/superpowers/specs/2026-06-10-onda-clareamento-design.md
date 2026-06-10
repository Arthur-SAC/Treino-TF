# Onda Clareamento — protocolo + rotinas

**Data:** 2026-06-10
**Status:** Spec aprovado para implementação
**Abordagem escolhida:** B — guia educativo + novas rotinas no Skincare (com migração)

---

## 1. Resumo

Adiciona um **guia de clareamento** (página estática no hub de Beleza) com o protocolo
completo — princípios, ativos seguros, regra de ouro (proteção solar/atrito), notas por
área (manchas de sol, axila, virilha, perianal/ânus), prazo e quando procurar dermato — e
**duas rotinas novas** no Skincare (manchas de sol no rosto/corpo; região perianal),
propagadas a contas existentes por uma migração idempotente que não duplica nem sobrescreve
rotinas editadas. Skincare já cobre axila e íntima.

## 2. Contexto

A usuária quer clarear manchas de sol, axilas, virilha e região anal. O Skincare já tem
rotinas de clareamento de **axila** e **região íntima** (clareador Adcos com niacinamida +
alfa-arbutina). Faltam: o protocolo educativo (ativos, segurança, prazo, FPS, quando ir ao
dermato), **manchas de sol** (rosto/corpo) e a **região perianal** explicitamente. A área
perianal é delicada e pede cautela extra + acompanhamento profissional.

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Abordagem | B — guia + rotinas | Pedido da usuária: além do protocolo, quer as rotinas pra executar/rastrear. |
| Guia | Estático, página própria | Mesmo padrão de cabelo/unhas; segurança e didática. |
| Rotinas novas | Manchas de sol (general) + Perianal (intimate) | Cobre o que faltava; reusa o display do Skincare (agrupa por manhã/noite). |
| Migração | `routineSeedVersion`, add por nome ausente | Propaga novas rotinas a contas existentes sem duplicar nem clobberar edições da usuária. |
| Área perianal | Ativos suaves + recomendação forte de dermato | Pele delicada; evitar ácido forte/hidroquinona sem profissional. |

## 4. Arquitetura

- **`src/data/clareamento-guide-seed.ts`** (novo) — `interface ClareamentoSection { id; title; intro?; tips[] }` + `CLAREAMENTO_GUIDE` (5 seções).
- **`src/pages/beauty/ClareamentoHome.tsx`** (novo) — header, `BeautyTabs`, intro, cards `<details>` de `CLAREAMENTO_GUIDE`, e um `DisclaimerCard` reforçando dermato pra área anal/ativos fortes.
- **`src/main.tsx`** — rota `beleza/pele-cabelo/clareamento` → `<ClareamentoHome />`.
- **`src/pages/beauty/BeautyHome.tsx`** — card "Clareamento".
- **`src/data/skincare-routines-seed.ts`** — +2 rotinas (ver §6).
- **`src/lib/beauty-seed.ts`** — migração `ROUTINE_SEED_VERSION = 2`: adiciona qualquer
  rotina do seed cujo `name` não exista no banco (idempotente, não duplica, não sobrescreve).
- Nenhuma mudança em `db.ts` (target `general`/`intimate` já existem).

## 5. Conteúdo do guia (5 seções)

1. **Como o clareamento funciona** — escurece por atrito, sol, inflamação, depilação
   agressiva; ativos seguros (niacinamida, alfa-arbutina, vitamina C, ácido tranexâmico,
   azelaico/kójico); o que NÃO usar sem dermato (hidroquinona; ácidos fortes em mucosa).
2. **Regra de ouro** — protetor solar diário (sem FPS nada clareia e tudo volta); reduzir
   atrito/calor; depilação menos agressiva (gilete escurece — elétrico/laser é melhor,
   liga à Depilação); roupa de algodão; secar bem.
3. **Por área** — manchas de sol (rosto/corpo: vit C + FPS de dia, ativo de noite); axila
   (rotina no Skincare; sem desodorante na hora); virilha (clareador externo, nunca
   mucosa); perianal/ânus (ativos suaves + teste de mancha; nada de ácido forte/
   hidroquinona sem dermato; **área que pede acompanhamento profissional**).
4. **Prazo e expectativas** — 8-12 semanas pra começar a ver, meses pro resultado pleno;
   clareia alguns tons, não "embranquece"; consistência; regride se parar o FPS.
5. **Quando procurar dermatologista** — mancha nova/que muda de cor ou forma; a área anal;
   vontade de ativos mais fortes (peeling, fórmula manipulada); qualquer irritação.

> `DisclaimerCard`: boas práticas gerais, não substituem dermatologista — sobretudo para a
> região anal e para ativos potentes.

## 6. Rotinas novas (Skincare)

1. **"Manchas de sol · rosto e corpo (noturno)"** — target `general`, time `evening`:
   - Limpeza suave; Vitamina C ou ácido suave (niacinamida/tranexâmico) só de noite, fina
     camada; hidratante; nota reforçando **FPS pela manhã** como parte do tratamento.
2. **"Região perianal · clareamento (noturno)"** — target `intimate`, time `evening`:
   - Higiene suave e secar bem; clareador suave (niacinamida + alfa-arbutina) só na pele
     externa, **nunca na mucosa**, após teste de mancha; hidratante; nota recomendando
     **acompanhamento dermatológico** para essa área.

## 7. Testes

| Tipo | Cobertura |
|---|---|
| Conteúdo (Vitest) | `CLAREAMENTO_GUIDE` tem 5 seções com `id`/`title`/`tips` não-vazios; ids únicos. |
| Migração (Vitest) | Conta "existente" (`beautySeeded=true`, `routineSeedVersion=1`) recebe as rotinas novas após `seedBeauty()`; rodar 2x não duplica. |

## 8. Fora de escopo

- Hidroquinona / fórmulas manipuladas / peelings — domínio do dermatologista; o guia
  apenas orienta a procurá-lo.
- Catálogo de produtos clareadores no store — citados no guia/rotinas como texto.

## 9. Critérios de aceite

- Card "Clareamento" abre a página com 5 cards de guia + disclaimer.
- Skincare passa a listar as rotinas de "Manchas de sol" e "perianal" (inclusive em conta
  existente, via migração) sem duplicar.
- `npm test` passa.
