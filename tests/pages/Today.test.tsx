import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { db } from "../../src/lib/db";
import { INITIAL_PLAN } from "../../src/data/meal-plan-seed";
import { Today } from "../../src/pages/Today";
import { hojeISO } from "../../src/lib/today-date";
import {
  ATE_ROTACAO,
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

  it("nunca abre uma sequência de OFERTA_VITALIDADE, em nenhuma fase", async () => {
    // Varre a rotação inteira mais uma volta: se qualquer prática levasse o
    // item a apontar pro start-stop, pro preparo pra receber ou pra sequência
    // pré-prazer, o link do Hoje diria isso — às 10h, no trabalho.
    //
    // O `await` do subtítulo NÃO é decoração. A contagem de práticas vem de um
    // `useLiveQuery`, que resolve depois do primeiro render: sem esperar, o
    // `findByRole("link")` casava no primeiro paint, quando `pelvicFeitas` é
    // `undefined` e a tela ainda mostra a FASE 1. A varredura de 0 a 25
    // observava vinte e seis vezes o mesmo dia 1, e passava verde mesmo com
    // uma sequência da Vitalidade reinserida na rotação. O subtítulo esperado
    // é o sinal de que o estado liquidou — ele difere do subtítulo da fase 1
    // em toda iteração, inclusive dentro da fase 1, porque carrega o contador.
    for (let n = 0; n < ATE_ROTACAO + ROTACAO.length + 3; n++) {
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
