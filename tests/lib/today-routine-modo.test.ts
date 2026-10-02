// tests/lib/today-routine-modo.test.ts
import { describe, it, expect } from "vitest";
import { buildDayRoutine, metaCaminhadaMin, ITENS_CAMINHADA } from "../../src/lib/today-routine";

const itens = (dow: number, modo?: Parameters<typeof buildDayRoutine>[3]) =>
  buildDayRoutine(dow, 2, [], modo).blocks.flatMap((b) => b.items);

describe("rotina pelo modo das caminhadas", () => {
  it("os ids de caminhada existem na rotina (segunda e sábado)", () => {
    const ids = [...itens(1), ...itens(6)].map((i) => i.id);
    for (const id of ITENS_CAMINHADA) expect(ids).toContain(id);
  });

  it("esteira troca rótulo e instrução nos dois itens e mantém o controle de caminhada", () => {
    for (const dow of [1, 6]) {
      const item = itens(dow, "esteira").find((i) => (ITENS_CAMINHADA as readonly string[]).includes(i.id))!;
      expect(item.label).toMatch(/Esteira inclinada/);
      expect(item.subtitle).toMatch(/6–10%/);
      expect(item.control).toBe("walk");
    }
  });

  it("pausada tira os dois itens e mantém o passeio com os cães", () => {
    for (const dow of [1, 6, 0]) {
      const ids = itens(dow, "pausada").map((i) => i.id);
      for (const id of ITENS_CAMINHADA) expect(ids).not.toContain(id);
      expect(ids.some((id) => id.startsWith("caes"))).toBe(true);
    }
  });

  it("pausada não cita a caminhada das 16h em nenhum item, e a esteira a troca", () => {
    for (const dow of [0, 1, 2, 6]) {
      for (const i of itens(dow, "pausada")) expect(i.subtitle ?? "").not.toMatch(/caminhada das 16h|5 km da manhã/);
      for (const i of itens(dow, "esteira")) expect(i.subtitle ?? "").not.toMatch(/caminhada das 16h|5 km da manhã/);
    }
    expect(itens(1, "pausada").find((i) => i.id === "treino")!.subtitle).toMatch(/caminhada está pausada/);
    expect(itens(1, "pausada").find((i) => i.id === "caes")!.subtitle).toMatch(/único passeio do dia/);
    expect(itens(1, "esteira").find((i) => i.id === "caes")!.subtitle).toMatch(/em cima da esteira/);
  });

  it("sem modo, a rotina é a de antes", () => {
    expect(itens(1)).toEqual(itens(1, "caminhada"));
  });

  it("na pausada a meta de minutos perde a caminhada (só os cães)", () => {
    expect(metaCaminhadaMin(120, "caminhada")).toBe(120);
    expect(metaCaminhadaMin(120, "esteira")).toBe(120);
    expect(metaCaminhadaMin(120, "pausada")).toBe(60);
  });
});
