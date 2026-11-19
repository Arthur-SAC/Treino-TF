# Rotina em linha do tempo — design

**Data:** 2026-11-19 · **Pedido dela:** conversa de 2026-11-18/19 · **Projeto seguinte (separado):** Estilo em degraus (guarda-roupa de transição).

## 1. Intenção, nas palavras dela

> "tentei navegar pelo app e pra mim ta muito confuso eu me perco facil pq tem mobilidade em uma parte em outra ai iniciante ta no inicio no meio no final pra mim ta tudo embaralhado"

> "o que mais sinto é a ideia que está tudo separado quando na verdade eu queria que fosse tudo junto meio organico sabe ? tipo pegar tudo de iniciante e ir criando minha rotina e ir avançando mas acho que deve levar em consideração minha amada que n quero ficar sem tempo com ela e os meus sonhos"

Hoje o app é uma loja de prateleiras: treino, mobilidade (em quatro lugares), dança, voz e beleza, cada um com sua tela e seus níveis misturados (a tela Movimento tem 8 grupos, cada um com iniciante, intermediário e avançado no meio). Ela não sabe o que é o próximo passo, não achou como pular a Entrada e se perde. O que ela quer é **uma rotina só, dela, que começa no básico e cresce**, e que **cabe na vida**: a noite com a noiva e os sonhos dela (desenho, escrita, RPG, leitura) têm lugar garantido.

Contexto que pesa (ver memória `vida_real_2026_11`): R$ 1.800/mês, pouca energia, vergonha e autocrítica. **O plano tem de caber na energia dela, não o contrário.** Um app que vira mais uma lista de cobrança é falha, mesmo funcionando.

## 2. Objetivos

1. **O Hoje é uma linha do tempo única do dia**, na ordem das horas, como uma agenda (escolha dela: opção A da tela de comparação). Sem agrupar por tipo, sem "núcleo" e "extras" em caixas separadas — o que hoje é núcleo continua sendo o que conta pro prazo, mas aparece no seu horário.
2. **Cada card abre o "como fazer" ali mesmo** (produto e como aplicar no skincare, execução e vídeo no treino e nos alongamentos, receita com gramas na refeição). Ela não precisa sair do Hoje para cumprir a rotina. A tela Movimento, a Biblioteca e o Guia deixam de ser caminho do dia.
3. **Começa no básico e avança por aviso que ela aceita.** Quando ela cumpre o critério de uma parte, aparece no topo do Hoje um card "Pronta pra próxima" com o que entra, pra quê e quantos minutos custa, e dois botões: **Aceitar** e **Agora não**. Nada avança sozinho. (Decisão dela: "prefiro que o app avise e eu aceito".)
4. **A noite com ela é protegida.** Blocos dela aparecem na linha do tempo em roxo, sem caixinha de marcar, e nunca contam como falha, sequência perdida ou queda.
5. **O bloco do app à noite tem teto de 30 minutos.** Se uma parte nova entrar e estourar o teto, alguma coisa troca de dia ou sai — nunca come o tempo dela.
6. **A Entrada (e qualquer ciclo) também avança pelo mesmo aviso.** O aviso de ciclo do `cycle-advisor` vira um card "Pronta pra próxima" no Hoje, e o card leva em conta a carga que ela já registra (ela subiu abdutora e extensora de 15 para 48 kg na primeira semana).

## 3. A noite e a semana dela (como ela decidiu)

Dia útil (ela confirmou a ordem; os horários são o ponto de partida e continuam ajustáveis em `/hoje/horarios`):

| Hora | O quê | Tipo |
|---|---|---|
| 6h | acorda, alongamento da manhã, skincare, café, marmita | rotina |
| 7h–16h | trabalho (almoço, água, micro-pausas) | rotina |
| 16h | caminhada até a Smartfit, lanche pré-treino no caminho | rotina |
| 17h–18h | treino | rotina |
| ~18h–20h | casa, cachorros, banho | rotina leve |
| **20h15–20h45** | **jantar com ela na chamada** | refeição (conta) + dela |
| **20h45–21h15** | **bloco do app**: alongamento da noite (com a base da dança), skincare e o que couber | rotina, teto 30 min |
| **21h15–22h15** | **com ela**: desenho, escrita, RPG, conversa | dela |
| **22h15–22h30** | **leitura na cama** | dela |
| 22h30 | dormir | conta (sono) |

Ela quis primeiro o jantar com ela, depois o bloco do app, depois ela de novo ("deixa pra depois de comer mesmo").

Fim de semana (do que ela contou em 2026-11-17): sábado feira pros pais, banho dos cães de 15 em 15 dias, lavar o carro, 11h caminhada/dança, 15h RPG ou 18h noiva; domingo ajuda os pais a cozinhar (marmita). **Sexta e sábado à noite são dela** — o app não põe nada nesses horários além do sono.

## 4. Como a progressão funciona

- **Ponto de partida = o básico de cada parte**, que é o que já existe como nível 1: treino do ciclo ativo, alongamento curto da manhã, skincare nível 1, refeições do cardápio, caminhada, sono — mais o **alongamento da noite com a base da dança desde já** (minha decisão: ela pediu explicitamente esse bloco em 2026-11-17 e ele foi publicado, mas hoje o `alongamento-noite` só destranca no patamar 15 de `desbloqueios.ts`, então provavelmente ela ainda nem o vê).
- **As partes que entram depois** são as que já estão em `DESBLOQUEIOS` (manhã completa, assoalho 1 e 2, skincare 2 e 3, dica de sentar, dança de sábado, voz 1 e 2, postura) e as subidas de fase das trilhas que já existem (flex fase 2/3, pélvica, rebolado). Não é preciso inventar conteúdo novo.
- **Critério do aviso:** o que já existe (patamar de sequência em `desbloqueios.ts`, contagem de práticas nas trilhas, `cycle-advisor` nos ciclos). Muda só que, ao atingir, **vira oferta** em vez de abrir sozinho.
- **"Agora não"** guarda a recusa e oferece de novo depois de alguns dias (o construtor escolhe quantos; sugiro 7). Aceitar grava a data como hoje grava `desbloqueios`; o save point continua (aceito nunca volta a trancar).
- **Um aviso por vez** no topo do Hoje, pra não virar pilha.
- **O aviso mostra o custo** em minutos e onde a parte nova vai entrar. Se ela estourar o teto de 30 min do bloco da noite, o aviso já diz o que troca de dia (ex.: "a voz entra seg/qua/sex; nesses dias o assoalho vai pra ter/qui").
- **Ela ainda pode pular adiante por conta própria**, pelo caminho de consulta (seção 6) — o aviso é o caminho normal, não uma trava.

## 5. O que cada card mostra

- Horário, nome discreto (regra `src/lib/discricao.ts` / EXPOE), minutos.
- Toque no card abre o "como fazer" **na frente da tela** (portal `NaFrente`, corrigido em d5ae681): sequência guiada com `ExecucaoBlocos`, vídeo quando houver, roteiro de skincare, receita. O que hoje é `to: "/treino/movimento"` passa a abrir a sequência do dia ali mesmo.
- Marcar feito continua como é hoje (check, água, caminhada, pausas, links com estado próprio).
- Blocos dela: roxo, texto neutro, sem caixinha.

## 6. O que sai do caminho do dia

- **Movimento, Biblioteca, Ciclos, Cardápio completo, Lista de compras, guias de beleza** continuam existindo, mas como **consulta**: um lugar pra ler, trocar ou adiantar, não pra descobrir o que fazer hoje. Na consulta, a tela Movimento passa a ordenar por **trilha e nível** (básico → intermediário → avançado), não por 8 grupos com níveis misturados.
- **Abas:** fica **Hoje · Progresso · Consulta · Vitalidade**. "Guia" é renomeada para "Consulta" e perde os itens que a linha do tempo já cobre (minha decisão, ela não se opôs; o Estilo ganha aba própria no projeto seguinte, não neste).
- Progresso fica como está (medidas, fotos, conquistas).

## 7. Não-objetivos

- Não reescrever treino, cardápio, alongamentos ou textos de execução.
- Não fazer o Estilo / guarda-roupa (projeto seguinte).
- Não mudar números-alvo (`src/lib/objetivo.ts`).
- Não fazer o "modo simples" de comida (oferecido, sem resposta dela).

## 8. Anti-objetivos (falha mesmo funcionando)

- Virar lista de cobrança: mais itens marcáveis do que hoje, ou noite inteira ocupada.
- Qualquer bloco dela que conte como falha, queda ou sequência perdida.
- Avançar alguma coisa sem ela aceitar.
- Rótulo que exponha (ver `discricao.ts`); emoji; "enquanto a TRH não vem"; sugerir cortar comida; strap-on.
- Ela precisar de mais de um toque pra saber o que fazer agora.

## 9. Restrições do projeto

- Seed mudou → sobe a versão correspondente (e o teste que a prende).
- `git push origin main` publica no celular dela → sempre perguntar antes.
- Números-alvo só em `src/lib/objetivo.ts`.
- Módulos de rotina continuam puros (`today-routine.ts`, `desbloqueios.ts`, `nucleo.ts`); a tela só apresenta.
- Lembretes nativos (`src/lib/lembretes/`) seguem os horários novos; mudança de horário padrão pede a migração de lembretes que o projeto já usa (`LEMBRETES_MIGRACAO`).
- Dívida vista no caminho: o rótulo "Café + whey" ficou velho (whey saiu no cardápio econômico, c8a1c35).

## 10. Decisões tomadas na revisão (minhas, pra ela conferir)

1. **O aviso só vale pro que ainda está trancado.** O que já está aberto no celular dela continua aberto. O **alongamento da noite entra aberto pra todo mundo** (uma migração marca `alongamento-noite` como desbloqueado), sem aviso: foi pedido dela.
2. **Teto de 30 min por regra fixa, não por escolha na hora.** Todo dia: skincare da noite + alongamento da noite. O que sobrar do teto é dividido em rodízio pelos dias da semana entre postura, voz e assoalho, nessa ordem de prioridade, com os minutos das durações do seed. O aviso mostra o rodízio resultante; ela só aceita ou não. O teto e o rodízio têm teste (módulo puro).
3. **Fila de avisos:** ordem canônica = aviso de ciclo primeiro (é o treino), depois `DESBLOQUEIOS` por patamar, depois subidas de fase das trilhas. "Agora não" manda aquele aviso pro fim da fila e espera 7 dias; o próximo pode aparecer no dia seguinte. Dentro de uma mesma parte a ordem nunca pula (voz 2 não vem antes de voz 1).
4. **Ciclo:** o critério é o do `cycle-advisor` como está. A tela Ciclos continua com o card dela; o Hoje ganha o mesmo aviso. Na Entrada, o aviso também aparece quando a carga registrada já passou da sugerida em todos os aparelhos de uma sessão (o construtor define a conta com `progression.ts`).
5. **Blocos dela:** de segunda a quinta e no domingo, 20h15–22h30 como na tabela. Sexta e sábado, das 18h em diante é tudo dela, sem bloco do app. Horários que ela já ajustou em `/hoje/horarios` vencem os padrões novos; os padrões novos valem pro resto, com migração de lembretes.
6. **Consulta:** sai só "Refeições de hoje" (já está no Hoje). O resto do Guia fica. A rota `/guia` e todos os links antigos continuam funcionando.
7. **"Como fazer" dentro do card:** alongamentos, assoalho, postura, voz, skincare e receita abrem na frente da tela. O **treino continua abrindo a tela da sessão**, porque ali ela registra carga série a série.

## 11. Deixado pro construtor

- Visual exato da linha do tempo e do card de aviso, dentro da paleta clara atual.
- Quantos dias o "Agora não" espera; como o rodízio do bloco da noite é calculado.
- Como migrar quem já tem desbloqueios abertos (o aberto continua aberto).
- O nome dos blocos dela na tela, desde que neutro.
