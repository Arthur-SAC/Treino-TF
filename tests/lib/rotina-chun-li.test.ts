import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";

const itens = (dow: number) => buildDayRoutine(dow, 100, []).blocks.flatMap((b) => b.items);

describe("rotina da Chun-Li macia", () => {
  it("creatina todo dia, na manhã, com horário", () => {
    for (const dow of [0, 1, 2, 3, 4, 5, 6]) {
      const c = itens(dow).find((i) => i.id === "creatina");
      expect({ dow, bloco: c?.block, hora: !!c?.defaultTime }).toEqual({ dow, bloco: "manha", hora: true });
    }
  });

  it("sábado e domingo têm a caminhada de 5 km, que credita como caminhada", () => {
    for (const dow of [0, 6]) {
      const c = itens(dow).find((i) => i.id === "caminhada-fds");
      expect({ dow, walk: c?.control }).toEqual({ dow, walk: "walk" });
    }
  });

  it("dia útil não ganha a caminhada de fim de semana — já tem a do trabalho", () => {
    expect(itens(3).some((i) => i.id === "caminhada-fds")).toBe(false);
    expect(itens(3).some((i) => i.id === "caminhada-trabalho")).toBe(true);
  });

  it("o item de dormir diz a meta de horas", () => {
    expect(itens(1).find((i) => i.id === "dormir")?.subtitle).toMatch(/7/);
  });
});
