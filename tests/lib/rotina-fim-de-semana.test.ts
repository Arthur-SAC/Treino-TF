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
});
