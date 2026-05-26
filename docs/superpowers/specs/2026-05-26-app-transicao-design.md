# Trein-Final — App pessoal de transição

**Data:** 2026-05-26
**Status:** Spec aprovado para implementação
**Usuária:** uma única pessoa, uso pessoal, sem comercialização

---

## 1. Resumo

App pessoal (PWA mobile-first) que centraliza todos os pilares da transição da usuária num único lugar: treino, alimentação, medidas/fotos, skincare, haircare, flexibilidade, dança e o macro-planejamento da transição. Tudo offline e local — nenhum dado sai do celular.

Construído em ondas: a primeira entrega a casca navegável de todas as 5 abas + profundidade no treino e no corpo; ondas seguintes aprofundam os demais pilares.

## 2. Contexto e motivação

A usuária inicia a transição de gênero (MTF) sem terapia hormonal por preservação de fertilidade — pretende ter filhos com a namorada antes de começar TRH. Aceita TRH depois, desde que não comprometa fertilidade.

Hoje carrega corpo masculino (ombros 120,5cm, cintura 99cm, quadril 114cm), cabelos cacheados curtos, e estética geral masculina. Quer aproximação progressiva de uma vibe amazona/burlesca/sensual: ampulheta forte, glúteo redondo grande, cintura fina, corpo firme mas macio, busto natural mais cheio, pixie cacheado feminino.

O app substitui o caos de seguir planos avulsos (treino aqui, skincare lá, dança no YouTube) por um único lugar de execução e acompanhamento diário, com pegada didática (ela se considera novata em treino, alimentação e skincare).

Restrição de tempo: até 1h/dia pra rotina total. Profissão: dev (passa muito tempo sentada). Hobby: jogos (mais tempo sentada). Treina em mix academia (máquinas, por timidez) + casa (exercícios mais expostos).

## 3. Decisões de produto

| Decisão | Escolha | Motivação |
|---|---|---|
| Plataforma | PWA mobile-first (Chrome Android) | Sem loja, sem build nativo, instalável como atalho. Ela só quer usar, não manter código. |
| Privacidade | 100% local (IndexedDB) | Fotos íntimas, registros pessoais — nada sai do celular. |
| Identidade visual | Paleta amazona/burlesca: vinho profundo (#5c1a2b, #8b3a4a) + nude/dourado (#d4a373, #f4e4d6) sobre fundo escuro (#1a0a0e) | Alinhada com a estética-alvo, sensual sem caricatura. |
| Iconografia | SVG inline lineares finos (estilo Phosphor thin) em dourado | Refinamento, atemporal. Sem emojis (preferência da usuária). |
| Pronome / linguagem | ela/dela, "você" no app (sem nome social ainda) | Confirmado pela usuária. |
| Arquitetura de roadmap | Casca + aprofundamento gradual | Todas as áreas navegáveis desde o dia 1, conteúdo aprofunda em ondas. Mantém centralização e sensação de coesão. |

## 4. Estética-alvo e estratégia corporal

### Onde mirar

- **Silhueta:** ampulheta forte (cintura ~80-85cm, quadril ~120-125cm, relação ≈ 0,68)
- **Glúteo:** grande, redondo (lateral cheia), projetado pra trás — NÃO quadrado
- **Cintura:** fina e bem definida, sem oblíquos hipertrofiados
- **Busto:** presente e redondo via postura + peitoral inclinado leve + ganho gradual de %gordura (sem TRH, sem postiço, sem fitoestrógenos não-prescritos); salto real na fase com TRH
- **Coxas:** torneadas, cheias na lateral, gap mínimo
- **Pele:** firme mas macia (não shape duro) — exige gordura subcutânea suficiente
- **Cabelo:** pixie cacheado feminino com cronograma capilar pra cachos saudáveis
- **Vibe:** amazona/burlesca/sensual, expressiva, quadril solto (dança/rebolado)

### Onde NÃO desenvolver

- Ombros (já são largos — vamos jogar com volume relativo, aumentando quadril)
- Costas em V (oposto da ampulheta)
- Trapézio (encolhe pescoço, vira look masculino)
- Bíceps muito densos (torneados sim, bombados não)
- Oblíquos (engrossam cintura)
- Peitoral inferior pesado (arrasta busto pra baixo)
- Magreza extrema (comprometeria a textura "firme + macia")

### Adaptações pelo lifestyle

Glúteo dormente, quadril encurtado, postura caída e lombar tensa são consequência típica do tempo sentada de dev + gamer. O plano DEVE incluir:

- Ativação glútea ANTES dos compostos (mini-band walks, ponte unipodal, abdutor) em todas as sessões de glúteo
- Mobilidade de quadril DIÁRIA (10min)
- Pausas ativas a cada 1-1,5h durante o trabalho (2-3min, contam pro plano)
- Fortalecimento postural: cadeia posterior, retração escapular
- Abdominais funcionais (dead bug, prancha) ao invés de crunch

### "Desafio gradual" da semana

Por causa da timidez na academia, o plano inclui 1 exercício novo por semana migrando de casa pra academia, ranqueado por "nível de exposição" (1=máquina fechada → 5=hip thrust com barra no rack). A progressão é opcional — a usuária pode pular.

### Realismo de prazo

Estética como das referências leva 18-36 meses sem TRH, sendo realista. Primeiros 3-6 meses já mudam visivelmente quem te enxerga.

## 5. Arquitetura técnica

```
┌─────────────────────────────────────────────────────┐
│  CELULAR (Android, Chrome PWA)                      │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  React + TypeScript + Vite                   │   │
│  │  Tailwind CSS (tema amazona)                 │   │
│  │  Dexie.js (IndexedDB)                        │   │
│  │  Workbox (Service Worker, offline, push)     │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  Nada sai do celular. Sem servidor, sem nuvem.      │
└─────────────────────────────────────────────────────┘
```

**Stack:**

- **React + TypeScript + Vite** — robustez tipada, ecossistema, build rápido
- **Dexie.js** — wrapper de IndexedDB
- **Tailwind CSS** — paleta amazona configurada via tema
- **Workbox** — Service Worker, offline-first, instalação PWA, notificações
- **Vitest** — testes (lógica + smoke)
- **Sem backend** — zero servidor, zero login

**Hospedagem:** GitHub Pages (grátis, HTTPS automático, deploy via push). URL é público mas os dados são locais — ninguém acessa nada.

**Não-escolhidos:** Next.js (overkill sem SSR), SvelteKit (menos material disponível), Capacitor/nativo (não compensa a complexidade pra esse caso).

## 6. Modelo de dados (IndexedDB via Dexie)

Database: `trein-final`

| Store | Conteúdo | Notas |
|---|---|---|
| `measurements` | Medidas corporais ao longo do tempo | Atualização ~mensal pela usuária |
| `photos` | Fotos de progresso (BLOBs comprimidos) | Compressão automática para ~500KB-1MB |
| `exercises` | Catálogo de exercícios | Pré-carregado com ~35 exercícios; cada um tem técnica, erros, variações, nível de exposição 1-5 |
| `workout_templates` | Planos semanais | Pré-carregado com plano base, customizável |
| `workout_sessions` | Registros de cada treino | Cargas, reps, RPE, "fácil/médio/difícil" |
| `meals` | Refeições do dia | Com check de "comi/não comi" |
| `meal_plans` | Planos alimentares | Macros-alvo, refeições padrão |
| `skincare_routines` | Rotinas (manhã/noite, rosto/costas/axila/íntimo) | Passos com produto, técnica, tempo de espera |
| `skincare_logs` | Histórico de execução skincare | Checks diários |
| `haircare_schedule` | Cronograma capilar | Hidratação/nutrição/reconstrução |
| `products` | Cosméticos em uso | Estoque, validade, notas |
| `style_palette` | Paleta pessoal | Subtom, contraste, cores favoráveis/desfavoráveis. Editável após wizard de re-análise. |
| `garments` | Catálogo de peças estratégicas | Curado por mim, com explicação do PORQUÊ funciona pro corpo-alvo. Categorizado (dia/noite/casual/formal/íntimo). |
| `looks` | Looks salvos pela usuária | Foto, tags de ocasião, avaliação ("amei/ok/não rolou"), nota |
| `wishlist` | Peças desejadas | Foto/link/anotação, categoria |
| `milestones` | Marcos da transição | Consultas, futura TRH, datas pessoais |
| `daily_log` | Registro do dia | Humor, pausas ativas feitas |
| `settings` | Preferências | Horários de notificação, quiet hours, etc. |

**Pontos técnicos:**

- Fotos como BLOBs locais, comprimidas para ~500KB-1MB sem perda visual relevante
- Catálogo de exercícios e produtos sugeridos pré-carregado pela primeira inicialização
- Backup manual: exportar/importar arquivo `.trein-backup` criptografado em AES-256 (senha definida pela usuária)
- Reset: botão "apagar tudo" nas configurações limpa IndexedDB + cache do Service Worker

## 7. Estrutura de navegação

Bottom navigation com 5 abas (padrão Android), ícones lineares finos em dourado, label embaixo:

| Aba | Foco | Conteúdo |
|---|---|---|
| **Hoje** | Dashboard do dia | Treino do dia + refeições com check + rotina skincare + sessão de movimento + lembrete de pausa ativa + micro-aula do dia. 95% do uso. |
| **Treino** | Tudo que é movimento corporal | Plano semanal, biblioteca de exercícios, registro de sessão, histórico de cargas, mobilidade/alongamento, dança/rebolado, desafio gradual da semana |
| **Corpo** | Dados sobre o corpo | Medidas, fotos de progresso, comparação lado a lado, gráfico de evolução, relação cintura/quadril |
| **Beleza** | Apresentação pessoal | Sub-tabs internas: **Pele & cabelo** (skincare, hair, produtos) + **Estilo** (paleta pessoal, peças estratégicas, looks salvos, wishlist, íntimo/sensual) |
| **Trilha** | Macro-planejamento | Linha do tempo da transição (fertilidade → TRH → marcos), consultas planejadas, plano alimentar (macros, refeições padrão, lista de compras), diário de sentimento opcional |

**Decisões:**

- Alimentação aparece no Hoje (execução, checks de refeições) mas o plano em si mora na Trilha (decisão de longo prazo).
- Flex/dança fica em Treino (são movimento corporal estruturado).
- Estilo é sub-tab interna de Beleza (não vira 6ª aba) — Beleza vira "apresentação pessoal" cobrindo pele + cabelo + roupa.
- Seção íntima/sensual fica exposta dentro de Estilo (sem PIN nem modo discreto — confirmado pela usuária).
- Cada tela usa cards com cantos arredondados (16-24px), microinterações sutis, sem ruído visual.

### Detalhe da aba Beleza → sub-tab Estilo

| Seção | Conteúdo |
|---|---|
| **Paleta pessoal** | Análise de subtom (quente/frio/neutro) e contraste; cards "cores que favorecem você" / "cores que apagam você". Inferência inicial: subtom quente/neutro, contraste médio → cores quentes saturadas (vinho, ferrugem, mostarda escura, oliva, dourado) + neutros quentes (camel, areia, off-white, marrom escuro). Cores a evitar inicialmente: pastéis frios (rosa-bebê, azul-clarinho, lavanda gelada). **Wizard de re-análise:** instrução pra a usuária se fotografar em luz natural pra confirmar/ajustar. |
| **Peças estratégicas** | Catálogo curado de peças que favorecem o corpo-alvo, cada uma com a explicação do PORQUÊ: decote V profundo (alonga pescoço sem revelar trapézio), cinto largo (ponto focal na cintura), saia rodada + top justo (ampulheta instantânea), calça cintura alta + crop com bojo, vestido peplum, tecidos com caimento (jersey, malha) abraçando quadril, esquema de cor escuro-em-cima/claro-embaixo (reduz ombros visualmente, aumenta quadril). Lista do "evitar": ombreiras, raglan, gola alta sem V, top cropped sem definição de cintura, cortes que alargam ombros. |
| **Looks salvos** | Câmera direta + galeria. Tira foto do look, taggea por ocasião (trabalho / casual / sair / com a namorada / noite / treino), marca "amei / ok / não rolou" com nota. Organização por data e ocasião. |
| **Wishlist** | Peças desejadas com foto/link/anotação, agrupadas por categoria. |
| **Íntimo / sensual** | Catálogo separado (exposto, sem PIN): conjuntos sutiã com bojo + tanga (busto aparente sem postiço), body de renda (cintura + quadril), camisolas transparentes, babydoll, robe curto de cetim, cinta-liga + meia 7/8. Cores recomendadas alinhadas à paleta amazona (vinho profundo, preto, nude quente). Cada peça com explicação do efeito visual e variações. |

## 8. Notificações

PWA Android tem 3 mecanismos: notificações locais agendadas (`Notification Triggers API` + Service Worker — funciona com app fechado), Periodic Background Sync (sistema decide quando acordar), e notificações imediatas (app aberto).

**Notificações padrão (todas editáveis/desligáveis):**

| Quando | Mensagem | Ação |
|---|---|---|
| Manhã 08:00 (padrão) | "Skincare matinal · 5 min antes do café" | Abre rotina |
| A cada 1h30, 09-18h, dias úteis | "Levanta da cadeira! 2 min de mobilidade de quadril" | Abre sequência rápida com gif |
| A cada 1h, 09-19h | "Bebe água · meta 2L · você tá em 800ml" | Tap pra registrar +200ml |
| Horário do treino | "Treino de hoje: [nome] · [min]" | Abre detalhe do treino |
| Horário da refeição | Lembrete da refeição padrão | Abre detalhe |
| Noite 22:00 (padrão) | "Skincare noturno + rotina capilar (se for dia)" | Abre rotina |
| Domingo 20:00 | "Hora de atualizar fotos de progresso" (se passou 2 sem) ou "Hora de medir" (se passou 30d) | Abre câmera/form |

**Comportamentos:**

- **Modo foco**: 1 toque pausa tudo (30min, 2h, custom); volta sozinho
- **Quiet hours**: 22h-08h padrão, sem notificação
- **Adaptativo**: 3 ignores seguidos no mesmo lembrete → app pergunta "esse horário tá ruim?"
- **Som/vibração** customizável (ou só badge)
- **Onboarding** instrui a adicionar o app à lista de "não otimizar bateria" do celular pra evitar atraso de notificações agendadas

## 9. Onda 1 — entrega da primeira fase (~1-2 semanas de desenvolvimento)

**Casca completa:**
- 5 abas funcionais, navegáveis, tema amazona aplicado, ícones lineares finos
- Áreas sem profundidade mostram cartão calmo "em breve" (não tela quebrada)

**Aba Hoje funcional desde dia 1:**
- Treino do dia (do plano semanal)
- Status de medidas/fotos ("medir cintura em 12 dias")
- Lembretes ativos (pausas, hidratação)
- Cards placeholder pra skincare/movimento marcando "em breve"

**Aba Treino — profundidade total:**
- Plano semanal pré-montado:
  - Seg: glúteo (ativação + compostos) + mobilidade quadril
  - Ter: costas baixa + cintura + abdominais funcionais
  - Qua: mobilidade total + dança/movimento curto (versão básica na Onda 1 — sequência simples com instrução escrita; sequências guiadas com vídeo entram na Onda 3)
  - Qui: glúteo (variação) + lateral coxa + posterior
  - Sex: empurrar/peitoral leve + postura + retração escapular
  - Sáb: mobilidade longa + alongamento profundo (opcional)
  - Dom: descanso
- Catálogo inicial de ~35 exercícios pré-cadastrados (gifs de fontes livres, sem licença restritiva), com técnica, erros comuns, variação fácil/difícil, nível de exposição 1-5
- Registro de sessão: tap rápido pra anotar peso × reps × "fácil/médio/difícil"
- Sugestão automática de carga (auto-progressão linear: difícil → mantém; fácil → +1-2kg; falhou → -1kg)
- Gráfico simples de progressão por exercício
- Desafio gradual da semana

**Aba Corpo — profundidade necessária:**
- Tela de inserir medidas (template completo: pescoço, ombros, busto, cintura, quadril, coxas L/R, braço, antebraço, panturrilha)
- Tela de fotos: câmera direta + importar da galeria, compressão automática, organizadas por data
- Comparação lado a lado: atual / objetivo / antiga
- **Onboarding inicial:** na primeira abertura, o app guia a usuária a inserir as medidas atuais (já temos: ombros 120,5 / cintura 99 / quadril 114 / coxa 82,5 / busto 106,5 / pescoço 40 / braço 34 / antebraço 27,5 / panturrilha 42) e importa as fotos das pastas `eu/` e `objetivo/` automaticamente
- Gráfico de relação cintura/quadril com alvo 0,68

**Notificações ativas:** pausas ativas, hidratação, treino do dia

**Configurações:** horários de notificação, quiet hours, modo foco, exportar/importar backup, ajuste de paleta, apagar tudo, onboarding de "não otimizar bateria"

## 10. Ondas seguintes (resumo, detalhar quando chegar)

| Onda | Foco | Estimativa |
|---|---|---|
| **Onda 2** | Aprofunda **Beleza** em duas frentes: (a) sub-tab Pele & cabelo (skincare + hair completos, rotinas específicas pra axila/íntima/costas, cronograma capilar pixie) e (b) sub-tab Estilo completa (paleta pessoal com wizard, catálogo de peças estratégicas, looks salvos, wishlist, íntimo/sensual). Aprofunda **Trilha → Alimentação** (plano de macros, refeições padrão, lista de compras). Notificações de skincare ativam. | ~+1-2 sem |
| **Onda 3** | Aprofunda **Treino → dança/movimento** e **flex** (sequências guiadas, vídeo de referência, prática progressiva) | ~+1 sem |
| **Onda 4** | Aprofunda **Trilha** (marcos, futura TRH, diário de sentimento), polimento geral, micro-aulas integradas em cada pilar | Contínuo |

## 11. Erros, bordas e privacidade

### Erros e bordas

| Cenário | Comportamento |
|---|---|
| IndexedDB cheio | Avisa "espaço acabando, exporta backup e apaga fotos antigas?" — sugere quais |
| Foto >5MB | Comprime para ~500KB-1MB automaticamente |
| Migração de schema | Dexie versioning; dados existentes preservados |
| Notificação bloqueada | Tela explicativa com print pra ativar |
| Câmera bloqueada | Upload manual da galeria como fallback |
| Service Worker falha | App online ainda funciona, aviso discreto |
| Backup corrompido | Valida schema antes de importar, não sobrescreve dados atuais |
| Medida absurda | Validação de range, pede confirmação |
| Múltiplas abas | Detecta e avisa "aberto em outra aba" pra evitar inconsistência |

### Privacidade

- Zero analytics, zero rastreamento, zero requisição externa pra terceiros (fontes empacotadas no bundle)
- Fotos nunca saem do celular
- Backup AES-256 com senha definida pela usuária
- "Apagar tudo" limpa IndexedDB + cache do Service Worker
- Sem login, sem conta, sem nada que identifique

## 12. Testes

| Tipo | Cobertura |
|---|---|
| **Lógica pura (Vitest)** | Cálculo de progressão de carga, cálculo de macros, relação cintura/quadril e classificação, validação/serialização de backup, timing de notificações respeitando quiet hours + modo foco |
| **Smoke (Vitest + Testing Library)** | Inserir medida → aparece no histórico; registrar sessão → carga sugerida atualiza; tirar foto → aparece na comparação; export → import → dados iguais |
| **E2E (Playwright/Cypress)** | Adiado pra fase mais madura |
| **Acessibilidade base** | Navegável por teclado, contraste WCAG AA (forçado pela paleta), `prefers-reduced-motion` respeitado |

## 13. Disclaimer profissional

Este é um app de uso pessoal montado por uma desenvolvedora pra sua própria transição, sem prescrição médica/profissional. O catálogo de exercícios, planos semanais, sugestões de alimentação, rotinas de skincare e cronograma capilar refletem boas práticas gerais — não substituem acompanhamento de profissionais qualificados (nutricionista, dermatologista, endocrinologista, ginecologista, educador físico, terapeuta capilar). O app inclui lembretes e cards educativos sinalizando quando faz sentido buscar esses profissionais, mas não trava nenhum recurso. A responsabilidade pelas decisões é da própria usuária.

## 14. Pontos abertos / decisões pra depois

- **Conteúdo de skincare/hair** — produtos sugeridos com explicação do PORQUÊ serão preenchidos na Onda 2; precisamos confirmar se ela vai usar marcas brasileiras (Vichy, Bioderma, Adcos, etc.) ou tem preferência específica
- **Confirmar paleta pessoal** — análise inicial é baseada em fotos dela em cabine de prova (luz artificial enviesada). Wizard de re-análise em luz natural acontece na Onda 2.
- **Catálogo de roupas íntimas** — depende de fotos/refs livres (Wikimedia, sem licença restritiva) ou ilustrações simples por mim na paleta amazona; decisão na Onda 2
- **Vídeos de dança** — origem (referências da Luiza Sonza no YouTube, embed; ou tutoriais específicos) será definido na Onda 3
- **Diário de sentimento** — formato (free text, prompts diários, escala emocional) decidido na Onda 4
- **Eventual sincronização** entre dispositivos — descartada agora (privacidade), mas se a usuária trocar de celular muito (ou usar tablet), avaliar servidor próprio auto-hospedado na Onda 5+
- **Onboarding pré-TRH** — quando ela começar TRH, o app vai precisar de novos campos (dose, efeitos, ciclo); planejado pra quando se aplicar
- **Versão claro/escuro** — por enquanto só escuro (paleta amazona); avaliar se ela quer um modo claro depois
