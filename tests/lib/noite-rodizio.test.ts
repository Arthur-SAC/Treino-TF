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
  const min = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const rod = (r: DayRoutine) => noite(r).filter((i) => (RODIZIO_NOITE as readonly string[]).includes(i.id));

  for (const modo of ["caminhada", "esteira"] as const) {
    it(`bloco sequencial e termina antes do com ela (${modo})`, () => {
      const r = ajustarNoite(buildDayRoutine(2, 2, [], modo), minutosDe);
      const itens = noite(r);
      const get = (id: string) => itens.find((i) => i.id === id)!;
      const sk = get("skincare-noite"), al = get("alongamento-noite"), ce = get("com-ela");
      expect(min(al.defaultTime!)).toBe(min(sk.defaultTime!) + 3);
      const ficam = rod(r);
      expect(ficam.length).toBeGreaterThan(0);
      let t = min(al.defaultTime!) + 21;
      for (const i of ficam) {
        expect(min(i.defaultTime!)).toBe(t);
        t += minutosDe(i.id);
      }
      expect(t).toBeLessThanOrEqual(min(ce.defaultTime!));
      expect(itens.map((i) => i.id)).toEqual(expect.arrayContaining(["jantar", "com-ela", "leitura", "dormir"]));
    });
  }

  it("o que estoura o com ela cai e o resto fica antes dele", () => {
    // 3 min cada: o teto escolhe postura e voz, mas o com ela (21:12) so deixa a postura terminar antes
    const base = buildDayRoutine(1, 1, [], "caminhada");
    const cedo: DayRoutine = { ...base, blocks: base.blocks.map((b) => ({ ...b, items: b.items.map((i) => (i.id === "com-ela" ? { ...i, defaultTime: "21:12" } : i)) })) };
    const m3 = (id: string) => (RODIZIO_NOITE as readonly string[]).includes(id) ? 3 : minutosDe(id);
    const ficam = rod(ajustarNoite(cedo, m3));
    const ids = ficam.map((i) => i.id);
    expect(ids).toEqual(["postura"]);
    for (const i of ficam) expect(min(i.defaultTime!) + 3).toBeLessThanOrEqual(min("21:12"));
  });

  it("2+ itens recebem horarios sequenciais", () => {
    const m = (id: string) => (id === "postura" ? 2 : id === "voz" ? 2 : minutosDe(id));
    const ficam = rod(ajustarNoite(buildDayRoutine(1, 1, [], "caminhada"), m));
    expect(ficam.map((i) => i.id)).toEqual(["postura", "voz"]);
    expect(min(ficam[1].defaultTime!)).toBe(min(ficam[0].defaultTime!) + 2);
  });

  it("item travado (fora da rotina) nunca entra", () => {
    const base = buildDayRoutine(1, 1, [], "caminhada");
    const sem: DayRoutine = { ...base, blocks: base.blocks.map((b) => ({ ...b, items: b.items.filter((i) => i.id !== "voz") })) };
    const ids = noite(ajustarNoite(sem, minutosDe)).map((i) => i.id);
    expect(ids).not.toContain("voz");
  });

  it("nao mexe em dia sem bloco do app e e pura", () => {
    const sex = buildDayRoutine(5, 5, [], "esteira");
    expect(ajustarNoite(sex, minutosDe)).toEqual(sex);
    const seg = buildDayRoutine(1, 1, [], "caminhada");
    expect(ajustarNoite(seg, minutosDe)).toEqual(ajustarNoite(seg, minutosDe));
  });
});
