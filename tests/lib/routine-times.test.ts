import { describe, it, expect } from "vitest";
import { buildDayRoutine } from "../../src/lib/today-routine";
import { resolveRoutineTime, itensAjustaveis, formatHora } from "../../src/lib/routine-times";

// Segunda-feira: o dia completo de semana. Dia do ano ímpar (1) = sem barba,
// pra não interferir nos horários das refeições/dormir testados aqui.
const SEGUNDA = buildDayRoutine(1, 1);
const itens = SEGUNDA.blocks.flatMap((b) => b.items);
const acharItem = (id: string) => itens.find((i) => i.id === id)!;

describe("horários da rotina", () => {
  it("as refeições têm horário — era a queixa: 'não tem quando comer'", () => {
    expect(acharItem("cafe-marmita").defaultTime).toBeDefined();
    expect(acharItem("almoco").defaultTime).toBe("12:00");
    expect(acharItem("lanche-saida").defaultTime).toBe("16:00");
    expect(acharItem("jantar").defaultTime).toBe("19:00");
  });

  it("a sequência da saída bate com o dia real: lanche, cães, treino", () => {
    const tarde = SEGUNDA.blocks.find((b) => b.id === "tarde")!;
    expect(tarde.items.map((i) => i.id)).toEqual(["lanche-saida", "caes", "treino"]);
    expect(tarde.items.map((i) => i.defaultTime)).toEqual(["16:00", "16:40", "17:45"]);
  });

  it("o jantar vem antes do skincare da noite — ela chega do treino e come", () => {
    const noite = SEGUNDA.blocks.find((b) => b.id === "noite")!;
    const ids = noite.items.map((i) => i.id);
    expect(ids.indexOf("jantar")).toBeLessThan(ids.indexOf("skincare-noite"));
  });

  it("existe o item de dormir às 22h30", () => {
    expect(acharItem("dormir").defaultTime).toBe("22:30");
  });

  it("dentro de cada bloco, os itens com horário estão em ordem cronológica", () => {
    for (const bloco of SEGUNDA.blocks) {
      const horas = bloco.items.map((i) => i.defaultTime).filter(Boolean) as string[];
      expect({ bloco: bloco.id, horas }).toEqual({ bloco: bloco.id, horas: [...horas].sort() });
    }
  });

  it("nenhum horário padrão é inválido", () => {
    for (const i of itens) {
      if (i.defaultTime) expect(i.defaultTime).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    }
  });
});

describe("resolveRoutineTime", () => {
  it("usa o padrão quando não há ajuste", () => {
    expect(resolveRoutineTime(acharItem("jantar"), {})).toBe("19:00");
  });

  it("o ajuste da usuária vence o padrão", () => {
    expect(resolveRoutineTime(acharItem("jantar"), { jantar: "19:45" })).toBe("19:45");
  });

  it("item sem horário nenhum continua sem horário", () => {
    expect(resolveRoutineTime(acharItem("agua"), {})).toBeUndefined();
  });

  it("ajuste em item sem horário padrão também vale", () => {
    expect(resolveRoutineTime(acharItem("agua"), { agua: "10:00" })).toBe("10:00");
  });
});

describe("itensAjustaveis", () => {
  it("lista só os itens que têm horário padrão, sem repetir id", () => {
    const lista = itensAjustaveis(SEGUNDA.blocks);
    expect(lista.length).toBeGreaterThan(0);
    expect(lista.every((i) => Boolean(i.defaultTime))).toBe(true);
    expect(new Set(lista.map((i) => i.id)).size).toBe(lista.length);
  });

  it("inclui as quatro refeições e o dormir", () => {
    const ids = itensAjustaveis(SEGUNDA.blocks).map((i) => i.id);
    for (const id of ["cafe-marmita", "almoco", "lanche-saida", "jantar", "dormir"]) {
      expect(ids).toContain(id);
    }
  });
});

describe("formatHora", () => {
  it("mostra hora cheia sem os minutos zerados", () => {
    expect(formatHora("19:00")).toBe("19h");
  });

  it("mostra os minutos quando existem", () => {
    expect(formatHora("16:40")).toBe("16h40");
  });

  it("preserva o zero à esquerda dos minutos", () => {
    expect(formatHora("06:05")).toBe("6h05");
  });
});
