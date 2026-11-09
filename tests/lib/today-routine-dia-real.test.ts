import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

const itensDe = (dow: number) => buildDayRoutine(dow, 2).blocks.flatMap((b) => b.items);
const acha = (dow: number, id: string) => itensDe(dow).find((i) => i.id === id);

describe("a caminhada de 5 km do trabalho para casa", () => {
  it("existe de segunda a sexta", () => {
    for (const dow of [1, 2, 3, 4, 5]) {
      expect(acha(dow, "caminhada-trabalho")).toBeDefined();
    }
  });

  it("não existe no fim de semana — não há trabalho de onde voltar", () => {
    for (const dow of [0, 6]) {
      expect(acha(dow, "caminhada-trabalho")).toBeUndefined();
    }
  });

  it("conta como movimento do dia", () => {
    expect(acha(1, "caminhada-trabalho")!.control).toBe("walk");
  });

  it("começa às 16h, quando ela sai do trabalho e vai a pé pra academia", () => {
    expect(acha(1, "caminhada-trabalho")!.defaultTime).toBe("16:00");
  });

  it("leva à prescrição de zona 2, que saiu do treino e mora aqui agora", () => {
    expect(acha(1, "caminhada-trabalho")!.to).toContain("cardio-zona2");
  });
});

describe("horários da tarde batem com o dia real", () => {
  it("o lanche é às 15:30, comido na mesa antes de sair", () => {
    expect(acha(1, "lanche-saida")!.defaultTime).toBe("15:30");
  });

  it("no fim de semana o lanche continua às 16h — não há saída do trabalho", () => {
    expect(acha(6, "lanche-saida")!.defaultTime).toBe("16:00");
  });

  it("a caminhada até a academia é às 16h, com ~4 km de ida e ~1 km na volta", () => {
    const c = acha(1, "caminhada-trabalho")!;
    expect(c.defaultTime).toBe("16:00");
    expect(c.label).toBe("Caminhada até a academia");
    expect(c.subtitle).toBe("~4 km até lá e ~1 km na volta — os mesmos 5 km de sempre");
  });

  it("o treino é às 17:00, na academia, com cardio leve no fim", () => {
    const t = acha(1, "treino")!;
    expect(t.defaultTime).toBe("17:00");
    expect(t.subtitle).toBe("Força até 60 min + cardio leve no fim");
  });

  it("os cães são às 18:45, quando ela chega em casa", () => {
    const c = acha(1, "caes")!;
    expect(c.defaultTime).toBe("18:45");
    expect(c.subtitle).toBe("Quando chegar em casa");
  });

  it("o jantar é às 20:00 e não chama as 20h de hora ruim", () => {
    const j = acha(1, "jantar")!;
    expect(j.defaultTime).toBe("20:00");
    expect(j.subtitle).not.toMatch(/às 20h/);
  });

  it("o lanche explica por que comer antes de sair", () => {
    expect(acha(1, "lanche-saida")!.subtitle).toBe(
      "Toque pra ver a receita · coma antes de sair às 16h — você treina depois de 9 h de trabalho e 50 min a pé",
    );
  });

  it("nenhum item de dia útil no modo caminhada fica entre 16:00 e 18:45 além de caminhada e treino", () => {
    for (const dow of [1, 2, 3, 4, 5]) {
      const dentro = itensDe(dow)
        .filter((i) => i.defaultTime && i.defaultTime >= "16:00" && i.defaultTime < "18:45")
        .map((i) => i.id)
        .sort();
      expect(dentro).toEqual(["caminhada-trabalho", "treino"]);
    }
  });

  it("a tarde de semana está em ordem cronológica", () => {
    const tarde = buildDayRoutine(1, 2).blocks.find((b) => b.id === "tarde")!;
    const horas = tarde.items.map((i) => i.defaultTime).filter(Boolean) as string[];
    expect([...horas]).toEqual([...horas].sort());
  });
});
