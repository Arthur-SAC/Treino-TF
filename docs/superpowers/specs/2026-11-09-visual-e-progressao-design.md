# Visual novo e progressão por fases — design

**Data:** 2026-11-09 · **Origem:** conversa com ela nesta data (mockups em
`.superpowers/brainstorm/1675-1794228924/content/` — `paletas.html` opção A e `vitoria.html`) ·
**Leia antes:** `docs/OBJETIVO.md` §9 e `docs/CONTINUAR-AQUI.md` §3–§5.
**Ordem:** construir **depois** de `2026-11-09-smartfit-jardins-design.md` (os dois mexem em
`SessionRecorder`, `SessionDetail` e `today-routine.ts`; o recomeço pela Entrada vem de lá).

## 1. Intenção e porquê

Ela acha o app **muito escuro** e quer que ele seja gostoso de usar, "quase como aqueles jogos
em que as plaquinhas ficam se mexendo". Referências dela: **Balatro** pelo "suco" (carta que
balança e responde ao toque, número que salta) e **YouTube** pela limpeza (fundo claro, vermelho
só no destaque, acha as coisas sem pensar). O visual do jogo **não** é copiado — só o princípio
de resposta ao toque.

Ela também quer **progressão como em jogo**: o app abre aos poucos, cada patamar de sequência
destrava uma mecânica nova com "Parabéns, X desbloqueado", explicação do que entra, e uma área de
conquistas. Isso responde a uma queixa antiga dela (as outras abas são confusas;
`feedback_navegacao_app`): com uma coisa nova de cada vez e explicada, o app deixa de ser um
monte de coisa ao mesmo tempo. Ela disse "estou começando agora" — a progressão acompanha o
recomeço.

O critério que ela me deu para as escolhas que delegou: **"o importante é que tenha essa
progressão e que meu objetivo chegue logo"**.

## 2. Objetivos

1. **Paleta A** (escolhida por ela) no app inteiro.
2. **Movimento com resposta**: card balança ao toque; concluir item tem pulo + "+1" + barra que
   enche.
3. **Tela de vitória** ao concluir o treino e **tela de queda** quando a sequência quebra.
4. **Progressão por desbloqueio**, com save point, tela "Parabéns, X desbloqueado" e
   **Conquistas** dentro do Progresso.
5. **Responsivo**: funciona bem de tela pequena a grande, sem rolagem horizontal, alvos de toque
   confortáveis.
6. "Seu tempo" e "Diário" **saem do Hoje** (decisão dela: não usa).

## 3. Não-objetivos e anti-objetivos

**Não-objetivos:** mudar treino, comida, metas, fases ou conteúdo; trocar a navegação de 4 abas;
modo escuro opcional (minha decisão — ela pediu menos escuro; volta só se ela pedir); som;
plugin ou permissão nativa nova; fonte externa paga.

**APK (decisão dela, 2026-11-09):** a splash, o fundo do ícone (`ic_launcher_background`,
hoje `#1A0A0E`) e a barra de status do Android passam pra paleta clara, com ícones da barra
legíveis sobre fundo claro. Só recursos/cores do Android — sem plugin nem permissão novos. O APK
é regerado e ela reinstala por cima, uma vez (ela aceitou). O builder confere se isso exige subir
`NATIVE_VERSION` (`src/lib/versao-nativa.ts`) pela regra do `docs/APK.md`.

**Anti-objetivos — falhou mesmo que funcione se:**
- o núcleo do plano (treino, comida, caminhada, creatina, sono) ficar trancado em algum momento —
  isso atrasaria o objetivo, que é o critério dela;
- um desbloqueio já conquistado voltar a trancar;
- a animação deixar o app lento no Poco dela ou atrapalhar tocar/rolar;
- algum rótulo visível (nome de mecânica, conquista, notificação) revelar conteúdo íntimo ou a
  transição — "Assoalho pélvico" e "Vitalidade" seguem as regras de discrição que já existem;
- emoji em qualquer lugar;
- conteúdo trancado que some sem rastro — trancado tem que aparecer como "trancado, faltam X".

## 4. Paleta A (decidida por ela)

Valores do mockup aprovado — viram os tokens do `tailwind.config.ts` (substituem `bg`, `wine`,
`nude`, `muted`; o mapeamento dos nomes é do builder):

| Papel | Cor |
|---|---|
| Fundo | `#fff7f3` |
| Card | `#ffffff` |
| Borda / sombra do card | `#f0d9d4` |
| Texto | `#2a1416` |
| Texto secundário | `#7d5f5d` — escurecido do mockup `#8a6a68` pra passar AA |
| Vermelho (destaque, horários, aba ativa) | `#e23b3b` |
| Vermelho 2 (degradê) | `#c81d3a` |
| Vermelho 3 (sombra de botão) | `#9e1430` |
| **Verde-água — só "feito" e conquista** | `#17a398` |
| **Roxo — área Vitalidade** | `#7b4fd6` |
| Trilho de barra | `#f5e2de` |

Regras: verde-água aparece **só** quando algo foi feito/conquistado (significado único); roxo é
a cor da aba e dos destaques da Vitalidade (aceno à noiva; a cor não revela conteúdo); o card do
treino é o maior destaque do Hoje (degradê vermelho, texto branco). Contraste de texto
WCAG AA no mínimo. `theme-color` do manifest/HTML acompanha o fundo.

## 5. Movimento

- **Toque em card:** balanço curto (≈ 450 ms, rotação de até ±2,5°) — curva do mockup.
- **Concluir item:** caixinha com pulo (≈ 350 ms), "+1" verde-água subindo e sumindo, barra do
  dia enche com leve "passar do ponto".
- **Placas** (vitória, queda, desbloqueio): entram girando e assentam como carta na mesa.
- **Respeitar `prefers-reduced-motion`:** com ele ligado, nada balança nem gira; troca por fade
  curto.
- Só `transform`/`opacity` animados (não layout). Sem som. Vibração **desligada por padrão**
  (minha decisão; se entrar, é opção nas Configurações e sem plugin nativo novo).
- Biblioteca de animação: decisão do builder; CSS puro como no mockup é suficiente, e o app já
  tem `.tela-entra` e `.marca-pop` em `src/index.css`.

## 6. Sequência

- **Conta treinos de segunda a sexta** concluídos em dias seguidos. Sábado e domingo **não
  quebram e não contam**.
- **Sem exceção** (decisão dela): falhou um dia útil — feriado ou doença inclusive — zera.
- "Concluído" = sessão de treino salva no dia (o builder define o critério exato a partir de
  `workoutSessions`; não pode depender de abrir o app no dia).
- É **um contador só**, usado pela vitória, pela queda e pelos desbloqueios.
- **Começa a contar na chegada desta versão** (decisão minha): um marco gravado uma vez
  (migração no padrão de `ENTRADA_MIGRATION`); sessões anteriores ao marco não contam. Na
  primeira abertura ela não vê nem vitória nem queda, só a sequência em 0. Faltas anteriores ao
  marco nunca disparam a queda.

## 7. Vitória e queda (mockup `vitoria.html`, aprovado)

- **Vitória** (ao salvar o treino do dia): "Treino concluído" + nome do treino; placa
  **Sequência** com o número rolando/pulando (7 → 8) e faíscas verde-água e vermelhas; placa
  **Próxima parte**: "faltam N treinos pra {próximo ciclo}" com barra enchendo (N vem do
  threshold do ciclo ativo e `cycleStartSessionCount`, que já existem); botão "Voltar pro Hoje".
- **Queda** (primeira abertura depois de um dia útil sem treino): "Sequência perdida" +
  "Ontem não teve treino" (texto ajusta se foram vários dias); o número desce de um em um até
  zero e a placa treme; placa da próxima parte **igual, sem voltar atrás** ("isso não volta
  atrás"); botão "Bora hoje". Aparece **uma vez** por quebra.
- Tom: sem amenizar e sem humilhar. Sem emoji.

## 8. Progressão por desbloqueio (decidida por mim, delegada por ela)

**Núcleo — nunca tranca:** treino (com cardio pós), refeições e lanche, água, creatina, vitamina
D, caminhada, cães, dormir. **A aba Vitalidade inteira fica aberta** (é do casal, não depende de
academia). O resto do app (Guia, Progresso, biblioteca) continua acessível.

**Mecânicas crescem por níveis** (decidido com ela em 2026-11-09, substitui a ideia de trancar
a mecânica inteira): cada mecânica aparece cedo numa **versão mínima** e ganha etapas a cada
patamar — "ir se acostumando e juntando tudo na rotina". Começar pequeno é o que faz hábito
pegar; o mínimo de cada uma é a parte que mais rende (ex.: protetor solar no sol de Aracaju).

| Sequência | Entra ou cresce no Hoje |
|---|---|
| Dia 1 | núcleo completo + **skincare nv1: protetor solar antes de sair** + **alongamento manhã nv1: 2 min + vacuum** (o vacuum saiu da academia em 2026-11-09 e vive na manhã; o nível 1 não pode tirá-lo do dia) |
| 5 | alongamento manhã completo + **assoalho nv1: 3 min de identificação** (achar o músculo) |
| 10 | **skincare nv2: limpeza + hidratante à noite** + dica de sentar nas micro-pausas + dança de sábado |
| 15 | alongamento noite + assoalho segue a progressão normal (`pelvic-progression`) + **voz nv1: aquecimento 3 min** |
| 20 | skincare completo (clareamento, cuidado com manchas/cicatrizes) + postura completa (andar, 8, gingado) |
| 25 | voz completa |

O que exatamente compõe cada nível mínimo (quais passos do skincare, quais movimentos dos 2 min,
qual exercício de voz) é decisão do builder a partir do conteúdo que já existe nos seeds —
sem inventar prática nova. A tela "Parabéns" diz **o que entrou de novo**, com duração e
horário ("Skincare nível 2: limpeza e hidratante à noite, 4 min, às 20h").

**Só tranca o que está na tabela acima** (decisão minha). Todo o resto do Hoje fica aberto
como está: barba, sol da manhã, micro-pausas (só a *dica de sentar* entra no patamar 10),
descanso de domingo, lembrete da marmita de domingo. O lembrete de sábado da dança segue o
desbloqueio da dança. A estrutura de dados é uma lista de quem tranca, não de quem fica aberto.
`NUCLEO_IDS` (`src/lib/nucleo.ts`, divisão visual núcleo/extras do Hoje de 2026-11-03) é outro
conceito e não muda.

**Trancar vale só pro Hoje e pros lembretes** (decisão minha). Nas telas da Vitalidade, do
Movimento e do Guia nada tranca: se ela praticar assoalho pela Vitalidade antes do patamar 5,
a progressão anda normalmente.

**Save point:** o desbloqueado **nunca** volta a trancar. Ao zerar, o próximo desbloqueio exige
atingir o patamar dele de novo partindo de zero.

**Recomeço:** na chegada desta versão, tudo fora do núcleo começa trancado (ela está
recomeçando). Os dados dela (logs de skincare, práticas de assoalho, voz, postura) **não são
apagados** e as progressões internas dessas mecânicas (`pelvic-progression`, `flex-progression`
etc.) continuam de onde estavam quando destravarem. Lembretes de mecânica trancada não tocam.

**Trancado aparece:** no Hoje, uma linha discreta "Próximo desbloqueio: {nome} — faltam N
treinos" (não uma lista de itens cinza). Em Conquistas, a lista completa.

**Tela "Parabéns, {mecânica} desbloqueado":** abre ao atingir o patamar (junto da vitória, depois
dela), no estilo das placas, explicando **o que entra no dia, pra que serve, quanto tempo leva e
em que horário**. Rótulo discreto pelos mesmos filtros de sempre.

## 9. Conquistas (dentro do Progresso)

- **Desbloqueios:** feitos (com data) e próximos (com "faltam N" e a explicação).
- **Marcos que o app já tem** (`src/data/milestones-seed.ts` e afins): cintura 88, cintura 84,
  ciclo concluído, primeira subida de carga — o builder mapeia o que já existe; não inventar
  marco de número fora de `src/lib/objetivo.ts`.
- Conquista nova abre a mesma tela de placa.
- Sem quinta aba (minha decisão; `feedback_navegacao_app`).

## 10. Responsivo

Sem rolagem horizontal de 320 px a tablet; gutter lateral de 16 px; alvos de toque ≥ 44 px;
texto legível sem zoom; cards em uma coluna no celular. O polimento de 2026-11 já cuidou de parte
disso — o builder confere tela por tela com a paleta nova.

## 11. Restrições técnicas

`npm run test` verde e `npm run build` limpo por commit; módulos de `src/lib/` puros (a regra de
sequência e de desbloqueio vai pra lib pura, com teste); setting novo em `DEFAULTS` (backup
inteiro já cobre); lembretes filtrados por desbloqueio em `src/lib/lembretes/planejar.ts` com
teste; discrição (`EXPOE`) em todo rótulo novo; Vitest com fake-indexeddb, aguardando o texto
que muda com o estado; **`git push origin main` só com permissão dela**; atualizar
`docs/OBJETIVO.md` §9 e `docs/CONTINUAR-AQUI.md` no fim.

## 12. Deixado ao builder

Nomes de token e de arquivo, biblioteca de animação, estrutura de dados do desbloqueio, critério
exato de "treino concluído no dia", onde a queda é detectada, ordem das entregas (sugestão
minha: 1 · paleta + movimento + responsivo + sair "Seu tempo"/"Diário"; 2 · sequência, vitória e
queda; 3 · desbloqueios e Conquistas).
