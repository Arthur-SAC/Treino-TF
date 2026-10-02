# Entrega A — Treinador

**Data:** 2026-10-01 · **Origem:** conversa de 2026-10-01 ("como você melhoraria o app pra
ajudar no meu objetivo?"). Primeira de cinco entregas: A Treinador → B Apresentação no Hoje →
C Hora da Smartfit → D Nativo → E Navegação + dívidas.

## Por que existe

O app manda fazer e guarda o que ela registra, mas **não fecha a conta**: ela mede, treina e
marca, e ele não diz se está funcionando nem o que mudar. A projeção da fase 1 já sabe o ritmo
esperado (`projetar` em `src/lib/partida.ts`) e as medidas estão no banco — falta comparar.

E o app supõe uma rotina que mudou: em 2026-09-28 ela parou a caminhada de 5 km "por agora", e o
gasto de `CONSUMO` (`src/lib/objetivo.ts`) continua contando os 5 km todo dia. A projeção promete
um ritmo que ela já sabe que não vai bater.

## Decisões dela (2026-10-01)

| Pergunta | Decisão |
|---|---|
| O que o app sugere quando ela está **abaixo** do ritmo | **Nunca cortar comida.** Só adesão (treinos, cardio, sono) e, se persistir, dizer com franqueza quanto a fase 1 atrasa. Coerente com o déficit moderado de propósito (testosterona, músculo). |
| E **acima** do ritmo (rápido demais) | Mandar **comer mais**, em gramas — rápido demais é perder músculo. (Proposto; ela não se opôs.) |
| Como registrar que a caminhada mudou | **Um modo** que ela liga e desliga, não escolha diária. |

## 1. Modo das caminhadas

- Setting novo `modoCaminhada: "caminhada" | "esteira" | "pausada"`, padrão `"caminhada"`, em
  `DEFAULTS` (`src/lib/settings-helpers.ts`). Já entra no backup porque `settings` entra.
- Editado em **Configurações**, seção "Caminhadas agora", com uma frase por opção dizendo o que
  muda.
- Vale para os dois itens de caminhada da rotina: `caminhada-trabalho` (dias úteis) e
  `caminhada-fds` (fim de semana). Um interruptor só — ela não disse se o fim de semana também
  parou; separar fica para quando ela pedir.
- Efeito no Hoje (`src/lib/today-routine.ts`, que recebe o modo como parâmetro e continua puro):
  - `caminhada`: igual a hoje.
  - `esteira`: rótulo "Esteira inclinada · 45–60 min", subtítulo "6–10% a 4,5–5,5 km/h, ou bike
    nível 5–6 · ofegante, mas falando em frases curtas". Mesmo `control: "walk"` e mesmo `to`.
  - `pausada`: os dois itens saem da rotina do dia. O passeio com os cães continua.
- **Gasto pelo modo.** `objetivo.ts` ganha `KCAL_CAMINHADA_DIA = 370` (o número que já está no
  comentário de `CAMINHADA_TRABALHO`) e `gastoEstimado(modo): [min, max]`. `caminhada` e
  `esteira` devolvem o `CONSUMO` atual; `pausada` subtrai 370 das duas pontas.
- `projetar(p, alturaCm, modo)` usa `gastoEstimado(modo)` para o ritmo e os prazos; `usePartida`
  lê o setting e passa. `comer-fora.ts` passa a receber o gasto médio do modo em vez de calcular
  do `CONSUMO` fixo.
- **Fora do escopo:** textos fixos que citam a caminhada como fonte da zona 2 (`SessionDetail`,
  `exercises-seed`) continuam como estão. Ficam registrados como dívida.

## 2. Ritmo a cada medida

Módulo puro novo `src/lib/ritmo.ts`.

**Entrada:** a projeção (partida + ritmo esperado do modo atual), as medidas desde a partida, e a
adesão dos últimos 14 dias (treinos registrados, dias com caminhada/esteira, noites com sono no
horário). Sem `db`, sem `new Date()` — a data de hoje entra como argumento.

**Quando avalia:** existe uma medida com peso e cintura a **≥ 10 dias** da partida. Antes disso,
devolve `{ estado: "cedo", primeiraComparacao: "YYYY-MM-DD" }` (partida + 10 dias).

**Contas** (sempre partida → última medida válida):
- `kgSemana = (pesoPartida − pesoÚltima) ÷ semanas`
- `cmSemana = (cinturaPartida − cinturaÚltima) ÷ semanas`
- Cintura esperada por semana: a mesma heurística que `projetar` já declara — a cintura cai em
  proporção ao caminho do peso até a cintura da fase 1 (84). `cmEsperadoSemana =
  (cinturaPartida − 84) ÷ semanas até o fim da fase 1`, nas duas pontas do ritmo.

**Veredito, nesta ordem:**
1. `rapido` — `kgSemana` acima de `ritmoMax × 1,3` **ou** acima de 1% do peso atual por semana.
   Mensagem manda comer mais, em gramas concretas (ex.: "+40 g de arroz cru e +1 ovo no lanche
   das 15h30" ≈ +200 kcal), e diz por quê: nessa velocidade sai músculo junto.
2. `no-ritmo` — `cmSemana ≥ cmEsperadoMin × 0,75`. **A cintura decide:** se o peso está abaixo
   mas a cintura está no ritmo, o texto diz que a balança empacou porque músculo está entrando.
3. `abaixo` — o resto. A mensagem:
   - mostra as três alavancas com os números das últimas 2 semanas (treinos/semana contra 5,
     dias de cardio contra 14 — caminhada ou esteira todo dia nos modos `caminhada` e `esteira`, noites no horário de 14) e aponta a **mais fraca**
     (menor fração do esperado; empate → treino, depois cardio, depois sono);
   - no modo `pausada`, a alavanca de cardio vira "religar a caminhada ou a esteira";
   - diz quanto o fim da fase 1 atrasa no ritmo real (`semanas restantes ÷ kgSemana`, em mês de
     calendário), sem adoçar;
   - **nunca** sugere cortar comida. Uma rede de teste proíbe a afirmação (cortar/reduzir
     kcal/comer menos), exigindo que, se a palavra aparecer, apareça negando.

**Onde aparece:**
- Card "Seu ritmo" no Hoje, durante os 14 dias seguintes a cada medida (a mesma janela do
  lembrete de medir em `src/lib/lembretes/planejar.ts`). Em `cedo`, mostra a data da primeira
  comparação.
- A mesma leitura no topo da tela de Evolução (`src/pages/path/EvolucaoView.tsx`), sempre
  visível.

## 3. Revisão de domingo

Módulo puro novo `src/lib/revisao-semanal.ts` + card no Hoje **só aos domingos**.

Conteúdo, de segunda a domingo da semana corrente:
- treinos registrados (de 5) — reaproveita `treinosNaSemana` de `src/lib/semana.ts`;
- dias com caminhada/esteira marcada (linha some em `pausada`);
- noites com sono no horário (regra de `resolverAlvoSono`, já extraída);
- alongamentos da noite feitos (`practiceLogs` das sequências da trilha `noite` de
  `flex-progression.ts`);
- última cintura e a diferença para a medida anterior.

Fecha com **uma frase de ajuste** para a semana que vem: a alavanca mais fraca, pela mesma regra
de `ritmo.ts` (função compartilhada — regra de negócio em um lugar só).

## 4. Testes

- `ritmo.ts`: cedo; no ritmo; abaixo com cada alavanca como a mais fraca; balança parada com
  cintura descendo → no ritmo; rápido demais pelos dois gatilhos; modo pausada muda o esperado;
  rede "nunca cortar comida" que proíbe a afirmação e aceita a negação (lição 5.2).
- `objetivo.ts`/`partida.ts`: `gastoEstimado` por modo; projeção em `pausada` mais lenta que em
  `caminhada`.
- `today-routine.ts`: os três modos nos dois itens; `pausada` mantém os cães.
- `revisao-semanal.ts`: semana cheia, vazia, modo pausada sem a linha de cardio.
- Telas (Hoje, Evolução, Configurações): esperando um texto que muda com o estado antes de
  afirmar (lição 5.3).
- Nenhum seed muda → nenhuma versão sobe. `npm run test` e `npm run build` limpos.

## Fora do escopo

Corte de calorias em qualquer forma; modo por dia; separar caminhada de semana e de fim de
semana; reescrever os textos fixos de zona 2; gráfico novo.
