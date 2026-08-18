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
| 4 | Repertório íntimo | ✅ no ar | (ver git log) |
| 5 | Comida em Aracaju | ✅ no ar | (ver git log) |
| 6 | Três modos de estilo | ✅ no ar | (ver git log) |

**A reforma das seis frentes está completa.**

**Testes:** 441 → 845. Build limpo. Tudo publicado em
https://arthur-sac.github.io/Treino-TF/ (deploy automático a cada `git push origin main`).

**Próximo passo:** não há frente pendente. O que existe é a lista de dívidas da
seção 9 e o que ela trouxer de novo. Duas conversas de 2026-08-12 ficaram sem
virar trabalho, de propósito — ela pediu pra deixar pra depois:

- **Peito sem hormônio.** O marco de busto promete "fullness de gordura no
  peito" enquanto o plano está em déficit tirando gordura do corpo todo. Ela
  decidiu **não** corrigir agora. Não trazer de novo sem ela pedir.
- **TH de janela definida.** Ela levantou a ideia de hormonizar para desenvolver
  mama (que é permanente) e depois parar para recuperar a função. O app inteiro
  assume "TH não tem data"; esta é uma terceira via que ele não considera.
  Ela disse que quer conversar depois.
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
| 08-12 | Estilo abre pelos **três modos** (público/casa/íntimo); paleta, peças e wishlist ficam depois, porque atravessam os três. |
| 08-12 | Íntimo tem duas prateleiras: **de ver** e **de usar**. Renda nunca é peça de usar. |
| 08-13 | **Vitalidade ganha aba própria** na barra de baixo (6 abas), reunindo sequências a dois + streak + lingerie. Rótulo "Vitalidade" — nunca descreve o que tem dentro, porque a barra fica visível pra quem olhar o celular dela. |
| 08-13 | Ela **gosta da tela Hoje** ("tudo que tenho que fazer no dia") e acha as outras abas confusas. Ao acrescentar tela, perguntar antes se cabe no Hoje. |

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
8. Rodízio indexado por dia da semana (0-6) numa lista que passou de 7 itens →
   os índices 7+ nunca eram alcançados (`presenceSuggestionForDay`, frente 4)
9. **Conteúdo alcançável só por caminho que ela não percorre.** Relatado por ela
   em 2026-08-13: foi procurar o que serve pra uma noite com a noiva e não achou.
   As sequências estavam na 8ª e última seção de Treino → Movimento, o streak só
   pelo atalho do Hoje (a Vitalidade nem estava nas abas da Trilha), e a lingerie
   em Beleza → Estilo → Íntimo. **Três abas de baixo diferentes.** O seed estava
   certo, o bump estava feito, e mesmo assim o conteúdo não chegava.

10. **Promessa sem agenda que a cumpra.** Três relatos dela em 2026-08-17/18,
    todos achados usando o app de verdade: o vacuum dizia "faça quase todo dia"
    e aparecia num dia por ciclo de treino; o assoalho caía às 10h no
    expediente, sendo que metade da progressão é deitada no chão — e o app
    **já sabia**, tinha "Deitada, precisa de chão" escrito por sequência; e as
    micro-pausas mostravam "0 de 6" sem dizer quando parar nem que havia
    conteúdo atrás do toque. Somado a isso, o padrão de expediente era 9h-18h
    genérico enquanto o dela é 7h-16h.

**A pergunta, agora com três metades:** *isso chega no aparelho dela* (versão de
seed), *existe caminho até isso* (aba, filtro, rodízio, ordem na página) **e a
agenda permite fazer** (horário, lugar, frequência)? As três falham em silêncio e
produzem o mesmo resultado: conteúdo que existe e não serve.

**Teste que guarda a terceira:** `tests/lib/promessa-tem-caminho.test.ts`. Se um
exercício promete frequência diária, ele precisa existir fora do treino — a
sessão de academia não cresce.

**Sempre pergunte: isso chega no aparelho dela?** As **cinco** versões de seed
são agora exportadas e travadas por pino em
`tests/lib/seeds-chegam-no-aparelho.test.ts`: `EXERCISE_SEED_VERSION` e
`TEMPLATE_SEED_VERSION` (`seed.ts`), `MEAL_PLAN_VERSION` (`path-seed.ts`),
`STYLE_SEED_VERSION` (`style-seed.ts`) e `MOVEMENT_VERSION` (`movement-seed.ts`).
Nenhuma sobrou privada.

E a pergunta tem uma segunda metade, aprendida na frente 4: **existe caminho até
o conteúdo?** Bump de versão põe o dado no aparelho; rodízio, filtro e ordem
decidem se ela algum dia o vê.

### 5.2 Rede que mira a palavra em vez da afirmação

Aconteceu **seis vezes**, sempre igual: um teste proibindo uma palavra também
proíbe **negá-la** — e quase apagou exatamente o texto que existia para proteger.
As duas últimas foram em redes escritas nesta reforma, ou seja: conhecer a
armadilha não basta, é preciso conferir o formato de cada rede nova.

| A rede proibia | Quase apagou |
|---|---|
| `passar despercebid` | *"discrição não é fracasso"* (página de Apoio) |
| `TRH\|hormon` | a explicação honesta do custo de hormonizar |
| `espacate` | *"espacate não é necessário pra nada disso"* |
| `acima da cabeça` | *"acima da cabeça engrossaria ombro"* |
| `renda` em peça de usar | *"tecido liso, **sem renda** no corpo da peça"* |
| `masculin` | *"cintura baixa empurra silhueta pra estilo masculino"* |

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
| Três modos de estilo · migração | `src/lib/db.ts` (`StyleMode`), `src/lib/style-seed.ts` (`migrarModos`) |
| Guia de tamanho e compra | `src/data/tamanhos-seed.ts` (números interpolados de `objetivo.ts`) |
| Fotos dela | `imagens/eu`, `imagens/objetivo` — **gitignored, nunca versionar** |

---

## 9. Dívidas registradas

- Montagem de alvo de sono e fase pélvica ainda copiada entre `Today.tsx` e
  `Vitalidade.tsx` — a regra foi extraída, a montagem não.
- `session-order.test.ts` usa fixtures locais, então não pega regressão nos templates reais.
- Adaptação ficou sem remada por 4-8 semanas (decisão consciente: remada constrói
  largura de dorsal, que o programa evita; `face-pull-polia` cobre a postura).
- `cross-over-cabo` virou órfão do catálogo.
