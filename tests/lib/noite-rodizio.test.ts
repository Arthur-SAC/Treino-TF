import { describe, expect, it } from "vitest";
import { ajustarNoite, rodizioDaSemana, RODIZIO_NOITE, TETO_NOITE_MIN } from "../../src/lib/noite";
import { buildDayRoutine, type DayRoutine } from "../../src/lib/today-routine";

const MIN: Record<string, number> = {
  "skincare-noite": 3, "alongamento-noite": 21, postura: 5, voz: 2, "assoalho-pelvico": 3,
};
const minutosDe = (id: string) => MIN[id] ?? 0;
const DIAS_COM_BLOCO = [0, 1, 2, 3, 4];

describe("rodizioDaSemana", () => {
  it("teto de 30 min", () => expect(TETO_NOITE_MIN).toBe(30));

  it("cada noite cabe no que sobra e todo item aberto aparece na semana", () => {
    const sem = rodizioDaSemana([...RODIZIO_NOITE], minutosDe);
    for (const d of DIAS_COM_BLOCO) {
      const soma = sem[d].reduce((a, id) => a + minutosDe(id), 0);
      expect(soma).toBeLessThanOrEqual(6);
    }
    const todos = new Set(DIAS_COM_BLOCO.flatMap((d) => sem[d]));
    for (const id of RODIZIO_NOITE) expect(todos.has(id)).toBe(true);
  });

  it("fixos que chegam a 30 min esvaziam o rodízio", () => {
    const grande = (id: string) => (id === "alongamento-noite" ? 27 : minutosDe(id));
    const sem = rodizioDaSemana([...RODIZIO_NOITE], grande);
    for (let d = 0; d < 7; d++) expect(sem[d]).toEqual([]);
  });

  it("sexta e sábado são sempre vazios", () => {
    const sem = rodizioDaSemana([...RODIZIO_NOITE], () => 0);
    expect(sem[5]).toEqual([]);
    expect(sem[6]).toEqual([]);
  });

  it("respeita a ordem de prioridade quando só um cabe", () => {
    const m = (id: string) => (id === "skincare-noite" ? 3 : id === "alongamento-noite" ? 18 : 9);
    const sem = rodizioDaSemana([...RODIZIO_NOITE], m); // sobram 9: um por noite
    expect(sem[1]).toEqual(["postura"]);
    for (const d of DIAS_COM_BLOCO) expect(sem[d]).toHaveLength(1);
  });

  it("só considera o que está aberto", () => {
    const sem = rodizioDaSemana(["voz"], minutosDe);
    for (const d of DIAS_COM_BLOCO) expect(sem[d]).toEqual(["voz"]);
  });

  it("é pura", () => {
    expect(rodizioDaSemana([...RODIZIO_NOITE], minutosDe)).toEqual(rodizioDaSemana([...RODIZIO_NOITE], minutosDe));
  });
});

function noite(r: DayRoutine) {
  return r.blocks.find((b) => b.id === "noite")!.items;
}

describe("ajustarNoite", () => {
  const base = buildDayRoutine(1, 1, [], "esteira" as never);

  it("mantém fixos e dela, tira o que não coube e dá horário sequencial", () => {
    const antes = noite(base).map((i) => i.id);
    const r = ajustarNoite(base, minutosDe);
    const itens = noite(r);
    const ids = itens.map((i) => i.id);
    for (const f of ["jantar", "skincare-noite", "alongamento-noite", "com-ela", "leitura", "dormir"]) {
      expect(ids).toContain(f);
    }
    const rod = itens.filter((i) => (RODIZIO_NOITE as readonly string[]).includes(i.id));
    const soma = rod.reduce((a, i) => a + minutosDe(i.id), 0);
    expect(soma).toBeLessThanOrEqual(6);
    expect(rod.length).toBeLessThan(antes.filter((i) => (RODIZIO_NOITE as readonly string[]).includes(i)).length + 1);
    const alo = itens.find((i) => i.id === "alongamento-noite")!;
    if (rod.length) {
      const [h, m] = alo.defaultTime!.split(":").map(Number);
      const fim = h * 60 + m + 21;
      const [h2, m2] = rod[0].defaultTime!.split(":").map(Number);
      expect(h2 * 60 + m2).toBe(fim);
    }
  });

  it("não mexe em dia sem bloco do app e é pura", () => {
    const sex = buildDayRoutine(5, 5, [], "esteira" as never);
    expect(ajustarNoite(sex, minutosDe)).toEqual(sex);
    expect(ajustarNoite(base, minutosDe)).toEqual(ajustarNoite(base, minutosDe));
  });
});
