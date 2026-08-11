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

  it("começa às 16h, quando ela sai do trabalho", () => {
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

  it("os cães são às 17:15, depois da caminhada", () => {
    expect(acha(1, "caes")!.defaultTime).toBe("17:15");
  });

  it("o treino é às 18:15, depois dos cães", () => {
    expect(acha(1, "treino")!.defaultTime).toBe("18:15");
  });

  it("o jantar é às 19:30", () => {
    expect(acha(1, "jantar")!.defaultTime).toBe("19:30");
  });

  it("a tarde de semana está em ordem cronológica", () => {
    const tarde = buildDayRoutine(1, 2).blocks.find((b) => b.id === "tarde")!;
    const horas = tarde.items.map((i) => i.defaultTime).filter(Boolean) as string[];
    expect([...horas]).toEqual([...horas].sort());
  });
});
