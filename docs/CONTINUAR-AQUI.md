# Continuar aqui

**Última atualização:** 2026-08-12
**Para retomar, basta dizer:** *"Lê `docs/CONTINUAR-AQUI.md` e continua a reforma."*

Este arquivo existe para que nenhuma sessão comece do zero. Ele carrega o estado,
as decisões já tomadas e as regras que não podem ser reinventadas.

---

## 1. Onde estamos

Reforma do app em **seis frentes**, decidida em 2026-08-10. Três concluídas e no ar.

| # | Frente | Estado | Merge |
|---|---|---|---|
| 1 | Verdade e objetivo | ✅ no ar | `d72b0f8` |
| 2 | Vitalidade sexual | ✅ no ar | `0f53135` |
| 3 | Corpo & treino | ✅ no ar | `6b5fdb7` |
| 4 | Repertório íntimo | 📄 spec pronto | — |
| 5 | Comida em Aracaju | ✅ no ar | (ver git log) |
| 6 | Três modos de estilo | 📄 spec pronto | — |

**Testes:** 441 → 780. Build limpo. Tudo publicado em
https://arthur-sac.github.io/Treino-TF/ (deploy automático a cada `git push origin main`).

**Próximo passo:** escrever o plano da frente 4 ou 6 (a ordem é dela) e executar.
Os specs já estão escritos e aprovados — **não refaça o brainstorming delas.**

---

## 2. O essencial sobre a usuária (para não ter que reexplicar)

Pessoa em transição de gênero, 27 anos em setembro, 1,73 m, mora em Aracaju/SE.
Noiva. Ambiente de moradia não receptivo.

**A mudança que reorganizou tudo:** a terapia hormonal **não tem data**. Não é
"adiada até resolver a fertilidade" — é indeterminada. O app inteiro tinha sido
escrito assumindo que ela estava chegando, e a frente 1 arrancou isso.

**O modelo honesto que substituiu a espera — duas trilhas:**

- **Corpo vestida** tem teto sem hormônio. Redistribuição de gordura, mama, pele
  fina, menos pelo, gordura facial: **impossível**, não difícil.
- **Corpo na cama** é favorecido pela configuração atual. Força, ganho muscular
  rápido, libido, ereção, firmeza, controle, volume seminal — tudo depende da
  testosterona que ela tem. Hormonizar custaria esses.

Não é espera: é conflito real entre dois objetivos dela.

**Medidas de partida (13/05/2026):** 96 kg · cintura 99 · quadril 114 · ombros 120,5
· busto 106,5 · coxa 82,5. Cintura÷quadril **0,87**; ombro÷quadril **1,06** (já é
faixa feminina — **o ombro nunca foi o gargalo, a cintura é**).

**Alvos** (fonte única em `src/lib/objetivo.ts`, nunca escrever à mão):
fase 1 → 80-82 kg, cintura 84 · fase 2 → 85-88 kg, quadril 114 de músculo.
**Na fase 2 a balança sobe de propósito.**

**Rotina real:** acorda 6h · trabalho 7h-16h · **caminha 5 km do trabalho pra casa
(16h-17h)** · cães 17:15 · treino 18:15 · jantar 19:30. Os dois pontos de falha
alimentar são 16h e o jantar — ambos déficit agudo depois de esforço, não fraqueza.

---

## 3. Decisões dela — já tomadas, não perguntar de novo

| Data | Decisão |
|---|---|
| 08-10 | Falar **sem amenizar**. Acolhimento vem de precisão, não de adoçante. |
| 08-10 | Quadril-alvo da fase 2 é **114 cravado**, não faixa. |
| 08-11 | Protocolo de pornografia: **streak**, não orçamento semanal. |
| 08-11 | Pornografia **e** masturbação automática quebram o streak. |
| 08-11 | Streak **visível no Hoje** (contra minha recomendação). Mitigação: o rótulo é "Vitalidade" e nunca descreve o que conta. |
| 08-11 | Explicitude do conteúdo íntimo: **técnico e direto**. Nomeia corpo, ângulo, pressão, ritmo. Sem narrar cena. |
| 08-11 | Academia fica em **~60 min**. Nada é somado ao treino. |
| 08-11 | Domingo de **~1h30** na cozinha carrega a semana; dia útil é montar e esquentar. |
| 08-11 | Estilo: **três modos como eixo** da navegação. |
| 08-11 | Público é **andrógino com calibragem de segurança**, **não masculino**. |
| 08-12 | %BF pela régua **androide** (25,7%), não ginoide (41,6%). |
| 08-12 | Padrão de levantar entra também na **adaptação**; **entrada fica de fora**. |
| 08-12 | Cardápio mostra **grama de cada alimento** em toda tela, e a lista de compras fecha a **semana inteira** — nada de "multiplique conforme a semana". |

---

## 4. Regras que atravessam todo o projeto

- Texto e comentário em **pt-BR com acentuação correta**. Nunca ASCII no lugar de acento.
- **Nenhum texto trata a terapia hormonal como etapa futura agendada.** Há varredura
  sobre todo o `src/` (`tests/data/sem-trh-agendada.test.ts`).
- Quando algo é inalcançável sem hormônio, a palavra é **"impossível"**, não "difícil".
- **Nada engrossa ombro nem trapézio.** Restrição mais antiga do programa.
- **A sessão de academia não cresce.** Todo exercício que entra sai de outro.
- Módulos em `src/lib/` declarados puros: **sem `db`, sem `new Date()`**.
- Comentário de código explica o **porquê**, não o quê.
- Faixas de resultado sempre **duplas** (provável × execução excelente).
- **Nenhuma sequência propõe strap-on** — a noiva recusou; repropor é não escutar.
- `npm run test` verde e `npm run build` limpo são condição de commit.

---

## 5. As duas lições que custaram caro — repetir a vigilância

### 5.1 Conteúdo que existe e não chega até ela

Apareceu **sete vezes** nesta reforma, em formas diferentes:

1. Seed alterado sem bump de versão → fica só no código
2. Sequência fora da `PELVIC_ORDEM` → nunca é servida pela rotina diária
3. Id duplicado na rotação → engole outra sequência
4. Exercício no catálogo e em nenhum template (`agachamento-goblet`)
5. Categoria `"cardio"` sem entrada no filtro da biblioteca → exercício invisível
6. Cinco seeds parados por falta de bump — incluindo `seedStyle`, que não tinha versão
7. Trocas aplicadas só em ciclos distantes → objetivo não alcançaria ela por 2,5 meses

**Sempre pergunte: isso chega no aparelho dela?** As versões de seed agora são
exportadas de `src/lib/seed.ts` e travadas por teste
(`tests/lib/seeds-chegam-no-aparelho.test.ts`).

### 5.2 Rede que mira a palavra em vez da afirmação

Aconteceu **quatro vezes**, sempre igual: um teste proibindo uma palavra também
proíbe **negá-la** — e quase apagou exatamente o texto que existia para proteger.

| A rede proibia | Quase apagou |
|---|---|
| `passar despercebid` | *"discrição não é fracasso"* (página de Apoio) |
| `TRH\|hormon` | a explicação honesta do custo de hormonizar |
| `espacate` | *"espacate não é necessário pra nada disso"* |
| `acima da cabeça` | *"acima da cabeça engrossaria ombro"* |

**Padrão correto:** proibir a **afirmação** (promessa, prescrição) e, separadamente,
**exigir** que onde a palavra aparecer ela esteja negando. Mais trabalhoso, e é o
único que não mente.

### 5.3 Outras armadilhas já pagas

- Teste de tela que lê o DOM **antes do `useLiveQuery` liquidar** observa sempre o
  primeiro estado e passa verde com a implementação quebrada. Sempre aguardar um
  texto que muda com o estado.
- Regra de negócio escrita em dois lugares **diverge em silêncio**. Já extraídos:
  `contarPraticasPelvicas`, `contarPraticasDaProgressao`, `contarPraticasFlex`,
  `resolverAlvoSono`, `rotuloDaSequencia`, `DEFAULTS` de settings.
- **Sempre provar por mutação** que uma rede morde: quebre de propósito, confirme
  que o teste falha, reverta.

---

## 6. O processo que funcionou

Para cada frente, nesta ordem:

1. **Spec** — já existe para as frentes 4, 5 e 6. Não refazer.
2. **Plano** — `superpowers:writing-plans`, salvo em `docs/superpowers/plans/`.
3. **Execução** — `superpowers:subagent-driven-development`: um subagente por task,
   revisor independente depois de cada uma, ledger em `.superpowers/sdd/<plano>/`.
4. **Revisão final da branch inteira** no modelo mais capaz.
5. **Uma leva de correção**, depois re-revisão com escopo fechado.
6. **Merge** com verificação no resultado do merge, depois **push** (que dispara o deploy).

**Instrução que salvou o trabalho quatro vezes:** dizer ao implementador que, se um
teste do plano falhar contra o conteúdo do plano, ele deve **parar e reportar** em
vez de "consertar" o teste. Nas quatro vezes o plano estava errado, não o código.

---

## 7. O que falta, com o essencial de cada uma

### Frente 4 — Repertório íntimo
`docs/superpowers/specs/2026-08-11-repertorio-intimo-design.md`

Não cria do zero: `intimidade-grinding`, `intimidade-cavalgar` e
`intimidade-flex-passiva` já existem e já são honestos. O que muda:

- O conteúdo atual **assume que as duas se revezam**; ela fica **sempre por cima**,
  inclusive em espaço apertado (carro, noiva no banco do passageiro).
- **A noiva quer penetrá-la e recusou strap-on.** A via é mão e dedos — carne dos
  dois lados. Consome a soltura da frente 2, não duplica.
- `rebolado-basico` é 3×1 min e precisa virar resistência de 5 min contínuos: manter
  20 min por cima é tarefa de lombar, flexor de quadril e glúteo.
- Regras que precisam estar escritas: movimento **frente-e-trás** (não estocada);
  **congelar as variáveis** quando a respiração dela mudar; as mãos dela na bunda são
  o canal de comando; **pinto pra cima** preso contra a barriga; a costura frontal do
  jeans é a vilã do esfregar com roupa.

### Frente 6 — Três modos de estilo
`docs/superpowers/specs/2026-08-11-tres-modos-estilo-design.md`

- **Público** (andrógino, teto de segurança no nível 3 da escada) · **Casa** (ela mesma;
  justa marca por contato, folgada marca por contraste) · **Íntimo** (lingerie).
- **Os modos não são exclusivos:** ela quer calça larga e camisa solta **com lingerie
  por baixo** — público por fora, íntimo por baixo.
- Peça **de ver** (renda) × peça **de usar** (microfibra lisa, sem costura frontal):
  renda é abrasiva em 20 min de atrito e machuca a noiva.
- Migração de dado: `Garment.discretion` tem dois valores e vira três modos.
- **Corrige a frente 1**, que registrou "público masculino" — está errado.
- Tamanhos dela: cueca **GG**, calcinha **52**. Compra-se pelo **quadril e coxa**, nunca
  pela cintura. E o tamanho vai mudar em 6-8 meses — comprar pouco agora.

---

## 8. Onde está cada coisa

| O quê | Onde |
|---|---|
| Números-alvo (fonte única) | `src/lib/objetivo.ts` |
| Specs das seis frentes | `docs/superpowers/specs/2026-08-1*-*.md` |
| Planos executados | `docs/superpowers/plans/` |
| Progressões (assoalho, flexibilidade) | `src/lib/pelvic-progression.ts`, `src/lib/flex-progression.ts` |
| Streak de vitalidade | `src/lib/vitalidade.ts` |
| Versões de seed (exportadas e travadas) | `src/lib/seed.ts`, `src/lib/movement-seed.ts`, `src/lib/style-seed.ts` |
| Rotina do dia | `src/lib/today-routine.ts` |
| Cardápio (fonte única) | `src/data/meal-plan-seed.ts` · versão em `src/lib/path-seed.ts` |
| Roteiro de domingo · porção de cada pote | `src/data/marmita-domingo-seed.ts`, `src/lib/marmita-porcoes.ts` |
| Fotos dela | `imagens/eu`, `imagens/objetivo` — **gitignored, nunca versionar** |

---

## 9. Dívidas registradas

- Montagem de alvo de sono e fase pélvica ainda copiada entre `Today.tsx` e
  `Vitalidade.tsx` — a regra foi extraída, a montagem não.
- `session-order.test.ts` usa fixtures locais, então não pega regressão nos templates reais.
- Adaptação ficou sem remada por 4-8 semanas (decisão consciente: remada constrói
  largura de dorsal, que o programa evita; `face-pull-polia` cobre a postura).
- `cross-over-cabo` virou órfão do catálogo.
