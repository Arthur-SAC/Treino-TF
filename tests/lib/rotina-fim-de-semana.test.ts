import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

describe("fim de semana", () => {
  it("sábado e domingo não têm bloco de expediente", () => {
    for (const dow of [0, 6]) {
      const rotulos = buildDayRoutine(dow, 1).blocks.map((b) => b.label.toLowerCase());
      expect({ dow, temTrabalho: rotulos.some((r) => r.includes("trabalho")) })
        .toEqual({ dow, temTrabalho: false });
    }
  });

  it("dia de semana continua com o bloco de expediente", () => {
    for (const dow of [1, 2, 3, 4, 5]) {
      const rotulos = buildDayRoutine(dow, 1).blocks.map((b) => b.label.toLowerCase());
      expect({ dow, temTrabalho: rotulos.some((r) => r.includes("trabalho")) })
        .toEqual({ dow, temTrabalho: true });
    }
  });

  it("micro-pausas de expediente só existem em dia de semana", () => {
    const fds = buildDayRoutine(6, 1).blocks.flatMap((b) => b.items).some((i) => i.id === "micro-pausas");
    const semana = buildDayRoutine(3, 1).blocks.flatMap((b) => b.items).some((i) => i.id === "micro-pausas");
    expect({ fds, semana }).toEqual({ fds: false, semana: true });
  });

  it("as quatro refeições existem nos sete dias — a fome não sabe que dia é", () => {
    for (let dow = 0; dow < 7; dow++) {
      const ids = buildDayRoutine(dow, 1).blocks.flatMap((b) => b.items).map((i) => i.id);
      expect({ dow, refeicoes: ["cafe-marmita", "almoco", "lanche-saida", "jantar"].filter((r) => ids.includes(r)).length })
        .toEqual({ dow, refeicoes: 4 });
    }
  });

  // O passeio some da rotina e a meta de 75 min some junto: `subtitleFor` só
  // mostra "X / 75 min" em item com control "walk". Domingo ficava sem nenhum.
  //
  // Sábado e domingo usam o id `caes-fds` (dia de semana usa `caes`) — ver
  // today-routine.ts sobre por que os ids são diferentes.
  it("os cães existem nos sete dias — eles não sabem que é fim de semana", () => {
    for (let dow = 0; dow < 7; dow++) {
      const idEsperado = dow === 0 || dow === 6 ? "caes-fds" : "caes";
      const ids = buildDayRoutine(dow, 1).blocks.flatMap((b) => b.items).map((i) => i.id);
      expect({ dow, temCaes: ids.includes(idEsperado) }).toEqual({ dow, temCaes: true });
    }
  });

  it("todo dia tem item que soma movimento, e o passeio credita a hora cheia", () => {
    for (let dow = 0; dow < 7; dow++) {
      const idEsperado = dow === 0 || dow === 6 ? "caes-fds" : "caes";
      const items = buildDayRoutine(dow, 1).blocks.flatMap((b) => b.items);
      const movimento = items.filter((i) => i.control === "walk");
      expect({ dow, temMovimento: movimento.length > 0 }).toEqual({ dow, temMovimento: true });
      expect({ dow, caes: items.find((i) => i.id === idEsperado)!.control }).toEqual({ dow, caes: "walk" });
    }
  });

  // Dois itens de caminhada no mesmo dia somariam na mesma meta de 75 min e
  // dariam a impressão de que o dia pede duas caminhadas — não pede. (Cada
  // DIA continua com só um item de movimento; são ids diferentes em dias
  // diferentes, não dois itens no mesmo dia.)
  it("nenhum dia tem dois itens somando na mesma meta de movimento", () => {
    for (let dow = 0; dow < 7; dow++) {
      const idEsperado = dow === 0 || dow === 6 ? "caes-fds" : "caes";
      const walks = buildDayRoutine(dow, 1).blocks.flatMap((b) => b.items).filter((i) => i.control === "walk");
      expect({ dow, walks: walks.map((i) => i.id) }).toEqual({ dow, walks: [idEsperado] });
    }
  });

  it("no sábado o passeio é o único item de caminhada, e não invade a dança", () => {
    const tarde = buildDayRoutine(6, 1).blocks.find((b) => b.id === "tarde")!;
    expect(tarde.items.filter((i) => i.control === "walk").map((i) => i.id)).toEqual(["caes-fds"]);
    const ids = tarde.items.map((i) => i.id);
    expect(ids.indexOf("danca-sabado")).toBeLessThan(ids.indexOf("caes-fds"));
    expect(tarde.items.find((i) => i.id === "caes-fds")!.defaultTime).toBe("18:15");
  });

  it("no domingo, o passeio compartilha id e horário com o sábado (caes-fds, 18:15)", () => {
    const domingo = buildDayRoutine(0, 1).blocks.flatMap((b) => b.items).find((i) => i.id === "caes-fds")!;
    expect(domingo.defaultTime).toBe("18:15");
  });

  it("a copy do lanche não fala de trabalho nem de treino no fim de semana", () => {
    for (const dow of [0, 6]) {
      const lanche = buildDayRoutine(dow, 1).blocks.flatMap((b) => b.items).find((i) => i.id === "lanche-saida")!;
      const texto = `${lanche.label} ${lanche.subtitle ?? ""}`.toLowerCase();
      expect({ dow, mente: texto.includes("trabalho") || texto.includes("treino") })
        .toEqual({ dow, mente: false });
    }
  });

  it("em dia de semana o lanche continua explicando a janela pré-treino", () => {
    const lanche = buildDayRoutine(3, 1).blocks.flatMap((b) => b.items).find((i) => i.id === "lanche-saida")!;
    expect(`${lanche.label} ${lanche.subtitle}`.toLowerCase()).toContain("treino");
    expect(lanche.subtitle!.toLowerCase()).toContain("trabalho");
  });
});
