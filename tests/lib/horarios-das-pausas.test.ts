import { describe, it, expect } from "vitest";
import { horariosDasPausas, metaDePausas } from "../../src/lib/micro-pausas";
import { DEFAULTS } from "../../src/lib/settings-helpers";

// Ela pediu (2026-08-18) horário em cada pausa, "pra não esquecer". O app
// mostrava só "2 de 6" — um contador sem quando, que exige que ela lembre
// sozinha de parar seis vezes ao longo do expediente. Lembrar é justamente o
// que não acontece num dia de trabalho.
describe("horários das micro-pausas", () => {
  it("devolve um horário por pausa da meta", () => {
    const horas = horariosDasPausas(7, 16, 90);
    expect(horas).toHaveLength(metaDePausas(7, 16, 90));
  });

  it("distribui do início ao fim do expediente, no intervalo pedido", () => {
    expect(horariosDasPausas(7, 16, 90)).toEqual([
      "07:00",
      "08:30",
      "10:00",
      "11:30",
      "13:00",
      "14:30",
    ]);
  });

  it("acompanha o intervalo que ela escolher", () => {
    expect(horariosDasPausas(7, 16, 180)).toEqual(["07:00", "10:00", "13:00"]);
  });

  // O padrão vinha 9h-18h enquanto o expediente real dela é 7h-16h (está
  // escrito em toda a rotina do app: acorda 6h, trabalha 7h-16h, caminha às
  // 16h). Com o padrão velho, a última pausa caía às 16h30 — depois de ela já
  // ter saído — e a primeira só às 9h, com duas horas de expediente sem nada.
  it("o padrão bate com o expediente real dela, não com um genérico", () => {
    expect(DEFAULTS.activeBreakStartHour).toBe(7);
    expect(DEFAULTS.activeBreakEndHour).toBe(16);
  });

  it("nenhuma pausa cai depois do fim do expediente", () => {
    for (const [ini, fim, passo] of [
      [7, 16, 90],
      [9, 18, 60],
      [8, 17, 120],
    ] as const) {
      for (const h of horariosDasPausas(ini, fim, passo)) {
        expect(Number(h.slice(0, 2))).toBeLessThan(fim);
      }
    }
  });

  it("configuração torta não quebra a tela", () => {
    expect(horariosDasPausas(7, 16, 0)).toHaveLength(1);
    expect(horariosDasPausas(16, 7, 90)).toHaveLength(1);
  });
});
