import { describe, it, expect } from "vitest";
import { hojeISO } from "../../src/lib/today-date";

// Trava contra a regressão que motivou o módulo: a rotina da noite (voz 21h,
// alongamento 21h30, diário, dormir 22h30) era gravada sob a data de AMANHÃ,
// porque `toISOString()` devolve UTC e Aracaju é UTC−3. Todas as datas aqui
// são construídas com o construtor de componentes locais — então o dia
// esperado é, por definição, o dia local.
describe("hojeISO", () => {
  it("às 21h, 22h e 23h locais a data ainda é a do dia corrente", () => {
    for (const hora of [21, 22, 23]) {
      const instante = new Date(2026, 6, 27, hora, 30, 0);
      expect({ hora, dia: hojeISO(instante) }).toEqual({ hora, dia: "2026-07-27" });
    }
  });

  it("só à meia-noite local o dia vira", () => {
    expect(hojeISO(new Date(2026, 6, 27, 23, 59, 59))).toBe("2026-07-27");
    expect(hojeISO(new Date(2026, 6, 28, 0, 0, 0))).toBe("2026-07-28");
  });

  it("a virada de mês e de ano também são locais", () => {
    expect(hojeISO(new Date(2026, 6, 31, 22, 0))).toBe("2026-07-31");
    expect(hojeISO(new Date(2026, 11, 31, 22, 0))).toBe("2026-12-31");
    expect(hojeISO(new Date(2027, 0, 1, 0, 30))).toBe("2027-01-01");
  });

  it("mês e dia vêm com zero à esquerda — o formato tem que ser ordenável", () => {
    expect(hojeISO(new Date(2026, 0, 5, 12, 0))).toBe("2026-01-05");
    expect(hojeISO(new Date(2026, 8, 9, 12, 0))).toBe("2026-09-09");
  });

  it("sem argumento, devolve o dia local de agora", () => {
    const agora = new Date();
    const esperado = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
    expect(hojeISO()).toBe(esperado);
  });

  it("aceita um Date deslocado — é assim que se monta a janela dos últimos 7 dias", () => {
    const d = new Date(2026, 6, 1, 22, 0);
    d.setDate(d.getDate() - 1);
    expect(hojeISO(d)).toBe("2026-06-30");
  });
});
