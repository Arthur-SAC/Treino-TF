# Reforma do Trein-Final — o app definitivo da transição

**Data:** 2026-07-16
**Status:** Design aprovado, pronto pra plano de implementação
**Abordagem:** Reformar o app existente (não recomeçar do zero) — reaproveita módulos e histórico, reancora tudo numa rotina diária.

---

## 1. Objetivo

Transformar o Trein-Final no app único e definitivo que guia **todas as frentes** da transição da usuária, de forma que ela **só abra o app, olhe a tela Hoje e vá clicando** — sem caçar funções nem esquecer nada. O app agrega a rotina do dia por horário, leva pra aba certa e deixa marcar feito/não feito.

## 2. Perfil e restrições (âncoras do design)

- Pessoa em transição de gênero (masc→fem), **sem TRH ainda** por **preservação de fertilidade**.
- Mora em **Aracaju/SE** (sol forte, calor — pesa em hidratação, pele e vitamina D).
- Objetivo de físico: **ampulheta suave / curvy**, treino **glúteo-prioritário**, **sem masculinizar ombro**.
- **Medidas atuais (13/05/2026):** ombro 120,5 · busto 106,5 · **cintura 99** · **quadril 114** · coxa 82,5 · braço 34 · roupa XGG/48. Gordura concentrada no abdômen, membros mais finos.
- **Iniciante e sedentária começando** — não quer gastar 2h na academia; treino deve crescer aos poucos.
- **Rotina real (dia de semana):** 6h acorda (banho, arruma, café, marmita) → 7h trabalho (às vezes 7h30) → 12h almoço (1h) → 16h sai (chega ~16h30/17h, **com mais fome**) → passear com cães (1h) → treino ~18h (pode inverter com os cães) → noite: **desenho + leitura** antes de dormir.
- Hobbies a proteger: desenho e leitura à noite. Sábado mais livre; domingo dia de descanso + marmita.
- **Queixa de energia:** cansaço/moleza frequente. Suspeita confirmada como provável: **vitamina D baixa** (quase não pega sol — trabalha em local fechado, sai com sol já baixo). Ambiente **não receptivo** à identidade → feminização discreta no dia a dia.

## 3. Equipamentos disponíveis (academia do prédio)

Bicicleta **horizontal/reclinada** (cardio baixo impacto), esteira Olympikus, máquina **adutora/abdutora** Olympikus M3, multiestação (polia **alta** OK; polia **baixa é curta**), banco com suporte de barra, espaldar + barra, step, bola suíça, caneleiras (~até 3 kg), halteres/anilhas/barra reta e W. **Sem Smith.** Não há leg press isolado evidente (a multiestação pode cobrir).

---

## 4. Bloco 1 — Backbone: tela Hoje ancorada no dia (implementar primeiro)

A tela Hoje é a espinha. Reorganiza a rotina **por blocos de horário**, destaca "foco agora" pelo horário atual, tudo com caixa de ✓, cada item leva pra aba certa. Referência visual: `scratchpad/today-mockup.html` (publicado como artifact).

**Blocos do dia de semana:**
- **Manhã (~6h):** Sol da manhã (opcional/fim de semana) · Alongamento 15 min · Skincare manhã · Café+whey + lembrete de marmita.
- **No trabalho (7h–16h):** Almoço · Micro-pausas de postura (discretas, contador) · Água (contador +200 ml).
- **Fim de tarde (~16h30):** **Lanche da saída (pré-treino)** · Passear com cães (1h, botão **⇄ inverter** com treino) · **Treino do dia** + cardio zona 2.
- **Noite (~20h):** Skincare noite · Alongamento 10 min (flexibilidade + quadril/assoalho pélvico) · **Seu tempo: desenho + leitura** (descanso protegido, não é "tarefa") · Diário/humor.
- **Esta semana (contextual):** exame de vitamina D/ferro/B12 (marco) · sábado dança · domingo marmita.
- **Quando precisar (atalhos):** Fertilidade & TRH · Apoio · Voz · Depilação · Cabelo · Estilo.

**Comportamento por dia:** sábado entra "modo dança"; domingo abre avisando "dia de marmita" com lista e receitas; lembretes de medir/fotos aparecem quando vencem.

O motor de "foco agora" já existe (`computeFocus`, `daily-routine`) — será reancorado nesses horários.

---

## 5. Bloco 2 — Treino (glúteo-prioritário, iniciante, curto)

Sessões de **30–40 min**, sempre fechando com **cardio zona 2** (bike reclinada ou esteira).

| Dia | Foco | Exemplos com os aparelhos |
|---|---|---|
| Seg | Inferior A (leve) | Leg press/agachamento · abdutora (glúteo médio) · elevação de quadril c/ halter · panturrilha |
| Ter | Postura + core (sem inflar ombro) | Puxada leve polia alta · remada leve · face-pull · prancha + "vacuum" |
| Qua | Inferior B (posterior) | Elevação de quadril · stiff/RDL · good-morning (polia baixa curta) · afundo no step |
| Qui | Mobilidade + cardio leve | Fluxo de mobilidade + zona 2 (dia leve, mas faz "algo") |
| Sex | Inferior C (glúteo foco máx.) | Elevação de quadril forte · abdutora · coice de caneleira · afundo/agachamento |
| Sáb | Dança + caminhada | (Bloco 3) |
| Dom | Livre + marmita | — |

**Princípios embutidos:**
- **Anti-masculinização de ombro:** sem desenvolvimento militar / elevação lateral pesada. Superior só leve, pra postura.
- **Cintura fina:** nada de oblíquo com carga (engrossa). Foco em prancha e transverso/"vacuum". Afinar real vem da gordura (Bloco 4).
- **Progressão em 4 fases** (mapeia nos "ciclos" existentes): **Adaptação** (sem 1–4) → **Base** (1–3 meses) → **Glúteo-foco/avançado** (3 meses+) → **Manutenção**. O app sobe de fase automaticamente.

**Expectativa honesta de resultado:** ~3 meses (barriga menor, postura, glúteo levantando), ~6 meses (silhueta curvilínea), ~12 meses (shape ampulheta-suave). Sem TRH, ombro/estrutura óssea não mudam e a gordura mantém padrão masculino; a curva vem de **glúteo/coxa + perda de cintura + postura + roupa de cintura alta**. Alvo realista: corpo "slim-thick suave / curvy natural" que de roupa feminina discreta lê como feminino. Quando a TRH entrar, potencializa a base já construída.

---

## 6. Bloco 3 — Movimento (mobilidade + intimidade + dança)

- **Micro-dose manhã (~15 min):** desperta quadril e coluna (gato-camelo, mobilidade de quadril, abertura torácica).
- **Micro-dose noite (~10 min):** flexibilidade profunda **+ intimidade integrada** (não é módulo separado): agachamento profundo/mālāsana, borboleta, adutores, pombo, flexor de quadril; **assoalho pélvico** (kegel **e** reverse kegel/relaxamento). Serve mobilidade de quadril para posições desejadas.
- **Firmeza/ereção (enquadre de saúde, sem drama):** cardio melhora circulação; reduzir excesso ajuda a "resetar" sensibilidade; assoalho pélvico ajuda. Fica como nota honesta dentro do movimento.
- **Dança/rebolado — sábado:** trilha progressiva (isolamento de quadril → círculos → figura-8 → rebolado/twerk, conectada ao glúteo treinado). Usa o player de link de vídeo já existente; 1–2 tutoriais por semana.

---

## 7. Bloco 4 — Nutrição + hidratação

- **Meta:** ~**120–140 g proteína/dia** (~30 g/refeição), **déficit leve** (recomposição). Regra do prato: ½ legume, ¼ proteína (palma), ¼ carbo (punho) — sem balança.
- **Timing real:** café 6h (tapioca/cuscuz + ovo + whey) · almoço 12h (marmita) · **lanche da saída 16h30** (banana+ovos ou tapioca+ovo, pré-treino) · jantar pós-treino · ceia leve se com fome.
- **Menos suplemento:** 2 ovos ≈ 1 dose de whey. Whey só **1x/dia no café** por praticidade; resto é comida real (ovo, frango, peixe, feijão). **Ovo:** cozinhar fresco (8 min) ou em pequenas levas — nada de pote de 12 parado a semana toda.
- **Carbo:** arroz **integral como padrão** ou meio a meio (mais fibra/saciedade), mas **macaxeira e cuscuz de milho** já servem — sem virar refém do integral.
- **Comida local barata (Nordeste):** ovo, frango (coxa mais barata), peixe barato (sardinha/tainha/pescada), feijão de corda, cuscuz, tapioca, macaxeira, banana, jerimum, quiabo, frutas (manga, caju).
- **Marmita de domingo:** frango desfiado + ovos + feijão + macaxeira + legumes assados → monta a semana rápido.
- **Hidratação (item diário de 1ª linha):** meta **~2,5–3 L/dia**, com deixas por horário (acordar, trabalho, lanche 16h30, treino, noite). Contador na tela Hoje (+200 ml). **Água de coco** pós-treino no calor.

---

## 8. Bloco 5 — Pele (rosto + corpo + íntima); preços aprox. jul/2026

- **Rosto oleoso/congestionado:** gel de limpeza com **ácido salicílico** (Neutrogena Acne Proofing ~R$44). Começar devagar, hidratar depois.
- **Axila:** Principia AD-01 (clareia + controla suor, ~R$49).
- **Virilha/coxa (corpo):** Principia Emulsão EC-01 (~R$43, rende muito).
- **Corpo (geral):** hidratante corporal diário (~R$20–30; versão com **ureia** se houver foliculite/"bolinhas") + **protetor solar corporal** áreas expostas (Nivea Sun corpo ~R$40–55).
- **Genital/íntima (pele fina):** Ada Tina Gliventi Bio Sensitive (~R$165). **Alerta:** teste antes, só pele externa, **nada de ácido forte em mucosa**.
- **Protetor solar facial toque seco (inegociável em Aracaju):** Nivea Sun Facial FPS60 (~R$45).
- **Custos:** kit rosto+axila+virilha+solar ≈ **R$181**; + corpo ≈ **R$60–85**; + íntima ≈ **R$165**.
- **Rotina no app:** manhã (limpeza salicílica → hidratante → protetor) e noite (limpeza → tratamento → clareadores corporais → hidratante), com aviso de **introduzir ácido devagar** e não empilhar ácidos.

---

## 9. Bloco 6 — Cabelo (cachos andróginos/femininos)

Cacho ~3A/3B, hoje médio; não gosta do comprimento grande. **Motor da feminização em todos os cortes:** franja cortina + camadas que emolduram o rosto + volume no topo.
- **Agora (recomendado):** **Curly Wolf Cut** — aproveita o cabelo atual, tira o "peso", emoldura e feminiza, mas passa como corte estiloso. Discrição regulável pela intensidade da franja.
- **Mais discreto:** French crop texturizado com franja.
- **Mais feminino sem alongar:** Curly shag com curtain bangs.
- **Se topar comprimento curto:** curly bob/lob no queixo.
- **Cuidado com cacho budget (~R$50–70):** creme Salon Line #TodeCacho, geleia de linhaça Lola, finalizar com difusor, toalha de microfibra/camiseta (evita frizz), dormir em "pineapple"/fronha de cetim.

---

## 10. Lacuna 1 — Fertilidade & TRH (novo, alto impacto)

Eixo médico da transição, hoje só citado de passagem. Espaço próprio, pequeno e honesto (com disclaimer de que não substitui médico):
- Status da **preservação de fertilidade** (congelamento de sêmen: feito? agendado? custo?).
- Marco **"quando revisitar a TRH"**.
- **Perguntas pra levar ao endócrino/ambulatório trans** (checklist).
- O que esperar da TRH quando começar (efeitos, tempo) — conecta com o objetivo de físico (a TRH potencializa a base já construída).

## 11. Lacuna 2 — Apoio / saúde mental / disforia (novo, alto impacto)

Complementa o diário de humor com um **kit de apoio** para dias difíceis (ambiente não receptivo):
- Técnicas de **aterramento** pra crise de disforia.
- Lembretes afirmativos.
- "O que fazer num dia ruim".
- **Rede de apoio real:** ANTRA, Defensoria Pública, Disque 100, **CVV 188**.

## 12. Lacuna 3 — Depilação estratégica + camuflagem (novo)

O app já **registra** sessões; falta a **estratégia barata**:
- Plano pra **barba/sombra sem TRH:** laser/eletrólise como definitivo (8–10 sessões); enquanto isso, barbear rente + dermaplaning + **camuflagem de sombra com corretivo alaranjado** (integra com maquiagem).
- Prioridade de áreas e custo-benefício por método.
- Barba/pelo, junto da voz, é o que mais feminiza — merece plano, não só planilha.

## 13. Vitalidade / energia (transversal)

Ataca o cansaço na raiz:
- **Sol** deixa de ser obrigação diária (trabalho sem luz natural): opcional/fim de semana + almoço se der.
- **Vitamina D:** suplemento é o caminho principal. **D3 10.000 UI 1x/semana é dose de manutenção segura pra uso contínuo** (≈1.400 UI/dia na média). Tomar **com refeição com gordura**, dia fixo (ex.: domingo). Se deficiente, considerar **fase de correção mais forte** no início (guiada por médico) e depois manter no semanal.
- **Exame de sangue** como marco: **25-OH vitamina D, ferro/ferritina, B12** (barato/SUS); reavaliar D em ~3 meses.
- **B12/ferro:** resolvidos pela alimentação (carne, ovo, peixe, feijão, folhas + vitamina C). Suplementar só se o exame acusar.
- **Sono:** protegido pelo bloco "seu tempo" à noite.

## 14. Polimento — Voz

Voz já é robusta (sem TRH, pitch/ressonância/passing, cronograma, gravações). Único ajuste: **aceitar link de vídeo** nos exercícios, como o resto do treino já faz.

---

## 15. Ordem de implementação

1. **Backbone** (tela Hoje ancorada no dia) — faz o app parecer "pronto e me guiando".
2. **Treino** (plano iniciante progressivo, 4 fases, com os aparelhos).
3. **Movimento** (mobilidade micro-dose + intimidade integrada + dança sábado).
4. **Nutrição + hidratação** (timing, lanche da saída, menos suplemento, marmita, água).
5. **Pele** (rosto + corpo + íntima; produtos e rotina).
6. **Cabelo** (corte + cuidados do cacho).
7. **Lacunas:** Fertilidade & TRH · Apoio/disforia · Depilação estratégica.
8. **Transversais:** Vitalidade (sol/D/exames) na tela Hoje + marcos · Polimento da voz (vídeo).

## 16. Fora de escopo / decisões tomadas

- **Não** recomeçar do zero — reformar preserva histórico e medidas.
- **Não** treinar pesado todo dia — progressão gradual (iniciante/sedentária).
- Mobilidade e intimidade **não** viram módulo separado — integradas nas micro-doses diárias.
- Dança concentrada no **sábado**, não um dia dedicado a mais.
- Sol **não** é tarefa diária obrigatória — supre por suplemento + fim de semana.
- Recomendações de produto/preço são **aproximadas** e budget; nada de conselho médico formal (disclaimers onde toca saúde).
