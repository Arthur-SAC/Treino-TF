import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";
import { NUCLEO_IDS } from "../../src/lib/nucleo";

const ids = (xs: { id: string }[]) => xs.map((i) => i.id);
const todosIds = (dow: number, modo: "caminhada" | "esteira" | "pausada" = "caminhada") =>
  buildDayRoutine(dow, 100, ["09:00", "11:00"], modo).blocks.flatMap((b) => ids(b.items));
// O Hoje filtra o núcleo da rotina do dia por id (Today.tsx), na ordem dos blocos.
const nucleoDe = (dow: number, modo: "caminhada" | "esteira" | "pausada") =>
  buildDayRoutine(dow, 100, [], modo).blocks.flatMap((b) => b.items).filter((i) => NUCLEO_IDS.has(i.id));

describe("núcleo do Hoje", () => {
  it("dia útil: comida, caminhada, treino e sono — na ordem do dia", () => {
    expect(ids(nucleoDe(2, "caminhada"))).toEqual(["cafe-marmita", "almoco", "lanche-saida", "caminhada-trabalho", "treino", "jantar", "dormir"]);
  });

  it("esteira: o cardio continua no núcleo, mesmo morando na noite", () => {
    const nucleo = ids(nucleoDe(2, "esteira"));
    expect(nucleo).toContain("caminhada-trabalho");
    expect(nucleo).toContain("treino");
  });

  it("domingo: a marmita da semana é núcleo", () => {
    expect(ids(nucleoDe(0, "caminhada"))).toContain("marmita-domingo");
  });

  // Rede contra o núcleo que perde a porta: se um id daqui deixar de existir
  // na rotina (renomeado), o núcleo esvazia em silêncio.
  it("todo id do núcleo existe na rotina de algum dia", () => {
    const existentes = new Set([0, 1, 2, 3, 4, 5, 6].flatMap((d) => todosIds(d)));
    for (const id of NUCLEO_IDS) expect(existentes.has(id), id).toBe(true);
  });
});
