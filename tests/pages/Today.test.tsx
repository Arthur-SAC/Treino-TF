import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { Today } from "../../src/pages/Today";
import { hojeISO } from "../../src/lib/today-date";
import {
  ATE_ROTACAO,
  ATE_FASE_3,
  SESSOES_DE_SOLTURA,
  ROTACAO,
  OFERTA_VITALIDADE,
  pelvicDoDia,
  rotuloPelvicoDoDia,
} from "../../src/lib/pelvic-progression";

beforeEach(async () => {
  await db.routineChecks.clear();
  await db.dailyLog.clear();
  await db.settings.clear();
  await db.mealPlans.clear();
  await db.meals.clear();
  await db.settings.put({ key: "activeCycle", value: "adaptacao" });
  await db.mealPlans.add({ ...INITIAL_PLAN });
});

describe("Today (backbone)", () => {
  it("renderiza os blocos da rotina do dia", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText("Manhã")).toBeInTheDocument();
    expect(screen.getByText("No trabalho")).toBeInTheDocument();
    expect(screen.getByText("Noite")).toBeInTheDocument();
  });

  it("mostra o item Seu tempo (desenho + leitura)", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText(/Seu tempo/i)).toBeInTheDocument();
  });

  // O alvo do sono era a constante "22:30" na tela, enquanto o horário do item
  // é ajustável em /hoje/horarios: mudar pra 23h fazia a linha dizer "23h" e o
  // subtítulo continuar prometendo "alvo 22:30".
  it("o alvo do sono acompanha o horário ajustado do item Dormir", async () => {
    await db.settings.put({ key: "routineTimes", value: { dormir: "23:00" } });
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText(/alvo 23:00/)).toBeInTheDocument();
    expect(screen.queryByText(/alvo 22:30/)).not.toBeInTheDocument();
  });

  it("o contador de micro-pausas mostra o alvo do dia, não só quantas já foram", async () => {
    const hoje = hojeISO();
    const ehFimDeSemana = [0, 6].includes(new Date().getDay());
    await db.dailyLog.put({ date: hoje, waterMl: 0, activeBreakCount: 3 });
    render(<MemoryRouter><Today /></MemoryRouter>);
    await screen.findByText("Manhã");
    // 9h→18h a cada 90 min = 6. O item só existe em dia de expediente.
    if (ehFimDeSemana) {
      expect(screen.queryByText("3 de 6")).not.toBeInTheDocument();
    } else {
      expect(await screen.findByText("3 de 6")).toBeInTheDocument();
    }
  });

  it("abre a receita da refeição direto no Hoje (sem ir pra outra aba)", async () => {
    render(<MemoryRouter><Today /></MemoryRouter>);
    const cafe = await screen.findByRole("button", { name: "Café + whey · montar marmita" });
    fireEvent.click(cafe);
    // a receita do café localizado (cuscuz sem manteiga) abre no próprio card
    expect((await screen.findAllByText(/Cuscuz de milho/i)).length).toBeGreaterThan(0);
  });
});

// O item pélvico do Hoje prometia "· 5 min" e "Invisível, dá pra fazer
// sentada" com os dois textos cravados em today-routine.ts — falsos na maior
// parte dos dias, já que a rotina tem sequências de 3 a 7 min e nem todas dão
// pra fazer sentada. Agora os dois derivam da sequência que a progressão
// devolve. Estes testes olham a TELA, não a função: é ali que a promessa é
// feita à usuária.
describe("Today: o item de assoalho pélvico não promete o que a sequência não cumpre", () => {
  /** `n` práticas pélvicas concluídas — é o que move a fase da progressão. */
  async function comPraticas(n: number): Promise<void> {
    await db.practiceLogs.clear();
    for (let i = 0; i < n; i++) {
      await db.practiceLogs.add({
        date: hojeISO(),
        sequenceId: "pelvic-identificacao",
        completed: true,
      });
    }
  }

  it("na fase 1 mostra a duração da identificação (5 min), e diz que é deitada", async () => {
    await comPraticas(0);
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText("Assoalho pélvico · 5 min")).toBeInTheDocument();
    expect(screen.getByText(/deitada, precisa de chão/i)).toBeInTheDocument();
  });

  it("na fase 4 mostra a duração da sequência daquele dia — 3 min, não 5", async () => {
    // 17 práticas = primeiro dia da rotação, que começa no Kegel rápido (3 min).
    await comPraticas(17);
    render(<MemoryRouter><Today /></MemoryRouter>);
    expect(await screen.findByText("Assoalho pélvico · 3 min")).toBeInTheDocument();
    expect(screen.queryByText("Assoalho pélvico · 5 min")).not.toBeInTheDocument();
  });

  // Antes esta varredura ia de n=0 a n=25 (26 renders completos da tela, cada
  // um com `await`) — cara por construção, e é a causa raiz do timeout
  // intermitente deste caso quando a suíte inteira roda em paralelo (passa
  // isolado, falha sob contenção). A varredura EXAUSTIVA de pelvicDoDia já
  // existe e é barata na camada de biblioteca
  // (`tests/lib/pelvic-progression.test.ts`, "a rotação do Hoje nunca serve
  // nenhuma sequência de OFERTA_VITALIDADE", n=0..200 sem nenhum render). O
  // papel do teste de TELA não é repetir essa varredura — é provar que a
  // ligação entre `pelvicDoDia` e o link renderizado está certa: que o `href`
  // reflete a sequência resolvida em cada fase, e depois que o
  // `useLiveQuery` liquida.
  //
  // Amostra as fronteiras de cada fase (onde um erro de "off-by-one" na
  // ligação apareceria) mais UMA VOLTA INTEIRA da rotação — não só o primeiro
  // item dela. Testado por mutação: inserir "pelvic-start-stop" no MEIO de
  // `ROTACAO` (não na ponta) passava verde com uma amostra que só olhava o
  // primeiro item + um valor alto — só falhou depois de cobrir a volta
  // inteira. Uma volta é o mínimo que garante pegar uma reinserção em
  // qualquer posição do array, e ainda assim é ~6 renders em vez dos ~20 que
  // a varredura antiga gastava só na fase 4. Tudo derivado das constantes
  // exportadas, nunca escrito à mão — se o tamanho das fases ou da rotação
  // mudar, a amostra acompanha.
  // O corte onde a soltura começa: é o PRIMEIRO valor da fase 2, não o último
  // da fase 1 (a fase 1 vai até `ateSoltura - 1`). O array abaixo sempre usou
  // as duas coisas certas — quem estava errado era o comentário daqui.
  const ateSoltura = ATE_FASE_3 - SESSOES_DE_SOLTURA;
  const AMOSTRAS_DE_FRONTEIRA = [
    0, ateSoltura - 1, // primeiro e último da fase 1
    ateSoltura, ATE_FASE_3 - 1, // primeiro e último da fase 2 (soltura)
    ATE_FASE_3, ATE_ROTACAO - 1, // primeiro e último da fase 3 (Kegel/alternância)
    // Uma volta inteira da fase 4: cobre toda posição da rotação, não só a
    // primeira.
    ...Array.from({ length: ROTACAO.length }, (_, i) => ATE_ROTACAO + i),
    // Bem depois de várias voltas — prova que o módulo da rotação não quebra
    // ao repetir.
    ATE_ROTACAO + ROTACAO.length * 7 + 3,
  ];

  it("nunca abre uma sequência de OFERTA_VITALIDADE, em nenhuma fase", async () => {
    // Se qualquer prática levasse o item a apontar pro start-stop, pro
    // preparo pra receber ou pra sequência pré-prazer, o link do Hoje diria
    // isso — às 10h, no trabalho.
    //
    // O `await` do subtítulo NÃO é decoração. A contagem de práticas vem de um
    // `useLiveQuery`, que resolve depois do primeiro render: sem esperar, o
    // `findByRole("link")` casava no primeiro paint, quando `pelvicFeitas` é
    // `undefined` e a tela ainda mostra a FASE 1 — e passaria verde mesmo com
    // uma sequência da Vitalidade reinserida na rotação. O subtítulo esperado
    // é o sinal de que o estado liquidou — ele difere do subtítulo da fase 1
    // em toda iteração, inclusive dentro da fase 1, porque carrega o contador.
    for (const n of AMOSTRAS_DE_FRONTEIRA) {
      await comPraticas(n);
      const { unmount } = render(<MemoryRouter><Today /></MemoryRouter>);

      const esperado = rotuloPelvicoDoDia(pelvicDoDia(n));
      await screen.findByText(esperado.subtitle);

      const link = await screen.findByRole("link", { name: /assoalho pélvico/i });
      const destino = link.getAttribute("href") ?? "";
      for (const id of OFERTA_VITALIDADE) {
        expect({ n, destino }).not.toEqual({ n, destino: `/treino/movimento/${id}` });
      }
      unmount();
    }
  });
});
