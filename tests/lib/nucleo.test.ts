import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";
import { separarNucleo, NUCLEO_IDS } from "../../src/lib/nucleo";

const ids = (xs: { id: string }[]) => xs.map((i) => i.id);
const todosIds = (dow: number, modo: "caminhada" | "esteira" | "pausada" = "caminhada") =>
  buildDayRoutine(dow, 100, ["09:00", "11:00"], modo).blocks.flatMap((b) => ids(b.items));

describe("núcleo do Hoje", () => {
  it("dia útil: comida, caminhada, treino e sono — na ordem do dia", () => {
    const { nucleo } = separarNucleo(buildDayRoutine(2, 100, [], "caminhada"));
    expect(ids(nucleo)).toEqual(["cafe-marmita", "almoco", "lanche-saida", "caminhada-trabalho", "treino", "jantar", "dormir"]);
  });

  it("esteira: o cardio continua no núcleo, mesmo morando na noite", () => {
    const { nucleo } = separarNucleo(buildDayRoutine(2, 100, [], "esteira"));
    expect(ids(nucleo)).toContain("caminhada-trabalho");
    expect(ids(nucleo)).toContain("treino");
  });

  it("domingo: a marmita da semana é núcleo", () => {
    expect(ids(separarNucleo(buildDayRoutine(0, 100, [], "caminhada")).nucleo)).toContain("marmita-domingo");
  });

  it("nenhum item some nem aparece duas vezes, em dia nenhum e modo nenhum", () => {
    for (const modo of ["caminhada", "esteira", "pausada"] as const) {
      for (let dow = 0; dow < 7; dow++) {
        const r = buildDayRoutine(dow, 100, ["09:00", "11:00"], modo);
        const { nucleo, extras } = separarNucleo(r);
        const juntos = [...ids(nucleo), ...extras.flatMap((b) => ids(b.items))].sort();
        expect(juntos).toEqual(todosIds(dow, modo).sort());
        expect(extras.every((b) => b.items.length > 0)).toBe(true);
      }
    }
  });

  // Rede contra o núcleo que perde a porta: se um id daqui deixar de existir
  // na rotina (renomeado), o núcleo esvazia em silêncio.
  it("todo id do núcleo existe na rotina de algum dia", () => {
    const existentes = new Set([0, 1, 2, 3, 4, 5, 6].flatMap((d) => todosIds(d)));
    for (const id of NUCLEO_IDS) expect(existentes.has(id), id).toBe(true);
  });
});
