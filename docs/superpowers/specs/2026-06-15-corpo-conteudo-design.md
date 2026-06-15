# Fatia 3 — Conteúdo completo e coerente: Corpo

**Data:** 2026-06-15
**Pilar:** Corpo (medidas, fotos, silhueta/WHR/%BF, comparação)
**Princípio (aprovado):** híbrido — avisos no fluxo + cards recolhíveis (`GuideAccordion`); cada tela ensina a usar o dado; tom sincero; contexto "sem TRH" explícito onde muda a interpretação.

Contexto: mulher trans, TRH adiada. Hoje as telas mostram número/gráfico sem ensinar a medir, a ler nem o que é meta realista.

## Itens (do diagnóstico)

### Alta
1. **Como medir certo.** `MeasurementForm.tsx` tem campos sem orientação. Adicionar, por campo (cintura, quadril, ombros, pescoço, coxa, braço), o ponto exato + postura + tensão da fita. Ex.: cintura = linha natural acima do osso do quadril, em pé, expira normal, fita justa sem apertar; quadril = parte mais larga do bumbum. Pode ser um card recolhível "Como medir certo" no topo de `Measurements.tsx` + dicas curtas nos labels.
2. **Frequência de medição.** Dizer cadência: medidas a cada ~2–4 semanas (mesmo horário, de manhã em jejum, sem treinar antes). Nota em `Measurements.tsx`.
3. **Gráficos com leitura.** `WhrChart`/`MeasurementChart`: explicar como ler (linha caindo = cintura/quadril melhorando rumo à meta; variação natural diária existe — olhe a tendência, não o ponto).
4. **O que é WHR + meta.** `Silhouette.tsx`: explicar WHR (cintura ÷ quadril), por que valores menores = silhueta mais ampulheta, faixas, e que sem TRH o teto realista é ~0,83–0,85 (alinhar com a tela "Até onde dá pra chegar" do Treino).
5. **%BF: faixas + contexto trans.** Explicar as faixas (essencial/atleta/fitness/média) em linguagem simples, que é estimativa por fita (Navy), e que sem TRH a gordura tende a se distribuir de forma androide (barriga) mesmo em %BF "ok" — usar a tendência, não o número.
6. **Guia de fotos comparáveis.** `Onboarding`/`Photos`/`PhotoUpload`: checklist de padronização — mesma luz/fundo, mesma roupa (ou roupa íntima), pose (frente/lado/costas, pés paralelos, braços ao lado), câmera na altura do quadril/corpo inteiro, mesmo horário. Card recolhível e/ou nota perto do botão de tirar foto.

### Média
7. **Estratégia déficit/superávit clara.** `Silhouette.tsx`: deixar explícito qual é a meta na fase atual (em superávit: ganhar quadril aceitando pouco de cintura; em déficit: secar barriga mantendo glúteo).
8. **Ombro/quadril explicado.** Por que razão < 1,0 lê como feminino; treinar ombro pesado sobe a razão (evitar), glúteo/quadril baixa a razão (priorizar).
9. **Trava de cintura com meta.** Onde já há aviso de cintura subindo em superávit, dizer a meta prática (ex.: tolerar até ~+1–1,5 cm de cintura se o quadril está crescendo mais que isso).
10. **Expectativas de tempo.** Quanto demora ver mudança (semanas a meses), variação natural (água, sono, intestino), e quanto dá pra mudar só com treino sem TRH.

### Baixa
11. **Fórmula Navy explicada** (1 linha: estimativa por circunferências, não exata).
12. **Fotos-objetivo: como escolher referências realistas** (genética/altura/com ou sem TRH).

## Critérios de aceite
- Medidas e Fotos ensinam a coletar dado padronizado; Silhueta explica WHR, %BF, ombro/quadril e a meta da fase; tudo com tendência > número e contexto sem TRH.
- `npm test` e `npm run build` passam; guias estruturados cobertos por teste de dados quando aplicável.

## Fora de escopo
- Mudar fórmulas de cálculo (`body-composition.ts`, `waist-hip-ratio.ts`) — só explicá-las.
