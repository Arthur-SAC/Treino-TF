import { describe, it, expect } from "vitest";
import { marcosDeCinturaAtingidos, idDoMarcoCintura } from "../../src/lib/conquistas";
import { DESBLOQUEIOS, tempoDoDesbloqueio, type DesbloqueioId } from "../../src/lib/desbloqueios";
import { buildDayRoutine } from "../../src/lib/today-routine";
import { ATE_FLEX_FASE_2 } from "../../src/lib/flex-progression";

const d = (id: DesbloqueioId) => DESBLOQUEIOS.find((x) => x.id === id)!;
const TERCA = 2;
const SABADO = 6;

describe("marcosDeCinturaAtingidos", () => {
  it("89 e depois 87,5: um marco, o de 88, com a data da primeira medida abaixo", () => {
    expect(
      marcosDeCinturaAtingidos([{ date: "2026-12-01", waistCm: 89 }, { date: "2026-12-20", waistCm: 87.5 }]),
    ).toEqual([{ cinturaCm: 88, titulo: "Cintura 88 — destrava o superávit", data: "2026-12-20" }]);
  });

  it("uma medida ≤ 84 dá os dois marcos", () => {
    const m = marcosDeCinturaAtingidos([{ date: "2027-03-01", waistCm: 84 }]);
    expect(m.map((x) => [x.cinturaCm, x.data])).toEqual([[88, "2027-03-01"], [84, "2027-03-01"]]);
  });

  it("fora de ordem e sem cintura: usa a primeira por data e ignora medida só de peso", () => {
    const m = marcosDeCinturaAtingidos([
      { date: "2027-01-10", waistCm: 86 },
      { date: "2026-12-15" },
      { date: "2026-12-30", waistCm: 88 },
    ]);
    expect(m).toEqual([{ cinturaCm: 88, titulo: "Cintura 88 — destrava o superávit", data: "2026-12-30" }]);
  });

  it("nada abaixo de 88: nenhum marco", () => {
    expect(marcosDeCinturaAtingidos([{ date: "2026-12-01", waistCm: 95 }])).toEqual([]);
  });

  it("id do marco", () => {
    expect(idDoMarcoCintura(88)).toBe("cintura-88");
  });
});

describe("tempoDoDesbloqueio — o horário e os minutos do dia dela", () => {
  it("modo esteira num dia útil: o skincare da noite é às 21:00, não 20:30", () => {
    const r = buildDayRoutine(TERCA, 1, [], "esteira");
    expect(tempoDoDesbloqueio(d("skincare-2"), r, {}, 0)).toEqual({ minutos: 3, horario: "21:00" });
  });

  it("o ajuste dela em /hoje/horarios vence o padrão do modo", () => {
    const r = buildDayRoutine(TERCA, 1, [], "esteira");
    expect(tempoDoDesbloqueio(d("skincare-2"), r, { "skincare-noite": "21:40" }, 0).horario).toBe("21:40");
  });

  it("dança numa terça (fora do dia): cai no horário da tabela", () => {
    const r = buildDayRoutine(TERCA, 1, [], "caminhada");
    expect(tempoDoDesbloqueio(d("danca"), r, {}, 0)).toEqual({ minutos: d("danca").minutos, horario: "17:30" });
  });

  it("dança no sábado com ajuste: usa o ajuste", () => {
    const r = buildDayRoutine(SABADO, 1, [], "caminhada");
    expect(tempoDoDesbloqueio(d("danca"), r, { "danca-sabado": "16:30" }, 0).horario).toBe("16:30");
  });

  it("dica de sentar não tem horário", () => {
    const r = buildDayRoutine(TERCA, 1, [], "caminhada");
    expect(tempoDoDesbloqueio(d("sentar"), r, {}, 0)).toEqual({ minutos: 1, horario: null });
  });

  it("manhã completa: minutos da fase atual da trilha da manhã", () => {
    const r = buildDayRoutine(TERCA, 1, [], "caminhada");
    expect(tempoDoDesbloqueio(d("manha-completa"), r, {}, 0)).toEqual({ minutos: 10, horario: "06:00" });
    expect(tempoDoDesbloqueio(d("manha-completa"), r, {}, ATE_FLEX_FASE_2).minutos).toBe(15);
  });
});
