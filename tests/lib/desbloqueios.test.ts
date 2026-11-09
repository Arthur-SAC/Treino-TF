import { describe, it, expect } from "vitest";
import {
  DESBLOQUEIOS,
  novosDesbloqueios,
  proximoDesbloqueio,
  filtrarRotina,
  idsTrancados,
  SEQ_MANHA_CURTA,
  type Desbloqueados,
} from "../../src/lib/desbloqueios";
import { buildDayRoutine, type DayRoutine, type RoutineItem } from "../../src/lib/today-routine";
import { SEQUENCES } from "../../src/data/sequences-seed";
import { SEQUENCIAS_FLEX } from "../../src/lib/flex-progression";

const TODOS: Desbloqueados = Object.fromEntries(DESBLOQUEIOS.map((d) => [d.id, "2026-11-09"]));
const ATE_10: Desbloqueados = Object.fromEntries(
  DESBLOQUEIOS.filter((d) => d.patamar <= 10).map((d) => [d.id, "2026-11-09"]),
);

const itens = (r: DayRoutine): RoutineItem[] => r.blocks.flatMap((b) => b.items);
const ids = (r: DayRoutine) => itens(r).map((i) => i.id);
const item = (r: DayRoutine, id: string) => itens(r).find((i) => i.id === id);

describe("tabela de desbloqueios", () => {
  it("tem os 11 ids na ordem do patamar, com os títulos exatos", () => {
    expect(DESBLOQUEIOS.map((d) => [d.id, d.patamar, d.titulo])).toEqual([
      ["manha-completa", 5, "Alongamento da manhã completo"],
      ["assoalho-1", 5, "Assoalho pélvico nível 1"],
      ["skincare-2", 10, "Skincare nível 2"],
      ["sentar", 10, "Dica de sentar"],
      ["danca", 10, "Dança de sábado"],
      ["alongamento-noite", 15, "Alongamento da noite"],
      ["assoalho-2", 15, "Assoalho pélvico nível 2"],
      ["voz-1", 15, "Voz nível 1"],
      ["skincare-3", 20, "Skincare completo"],
      ["postura", 20, "Postura"],
      ["voz-2", 25, "Voz completa"],
    ]);
  });

  it("horários e minutos vêm do seed", () => {
    const h = Object.fromEntries(DESBLOQUEIOS.map((d) => [d.id, d.horario]));
    expect(h).toMatchObject({
      "skincare-2": "20:30", "assoalho-1": "21:20", "alongamento-noite": "21:30",
      "voz-1": "21:00", postura: "20:45", danca: "17:30", sentar: null,
    });
    const m = Object.fromEntries(DESBLOQUEIOS.map((d) => [d.id, d.minutos]));
    expect(m["assoalho-1"]).toBe(SEQUENCES.find((s) => s.id === "pelvic-identificacao")!.durationMin);
    expect(m["voz-1"]).toBe(2);
    for (const d of DESBLOQUEIOS) {
      expect(d.minutos).toBeGreaterThan(0);
      expect(d.entra.length).toBeGreaterThan(10);
      expect(d.praQue.length).toBeGreaterThan(10);
    }
  });
});

describe("novosDesbloqueios", () => {
  it("nada no zero", () => {
    expect(novosDesbloqueios(0, {})).toEqual([]);
  });
  it("no 5 abre manhã completa e assoalho 1", () => {
    expect(novosDesbloqueios(5, {}).map((d) => d.id)).toEqual(["manha-completa", "assoalho-1"]);
  });
  it("no 12, com os do 5 já abertos, abre os do 10", () => {
    expect(novosDesbloqueios(12, { "manha-completa": "x", "assoalho-1": "x" }).map((d) => d.id)).toEqual([
      "skincare-2", "sentar", "danca",
    ]);
  });
  it("save point: o já desbloqueado não aparece nem some", () => {
    expect(novosDesbloqueios(3, { "skincare-2": "x" })).toEqual([]);
  });
});

describe("proximoDesbloqueio", () => {
  it("no 3, o próximo é a manhã completa, faltando 2", () => {
    const p = proximoDesbloqueio(3, {});
    expect(p?.d.id).toBe("manha-completa");
    expect(p?.faltam).toBe(2);
  });
  it("com tudo aberto, null", () => {
    expect(proximoDesbloqueio(30, TODOS)).toBeNull();
  });
  it("depois de zerar, conta a partir de zero", () => {
    const p = proximoDesbloqueio(0, ATE_10);
    expect(p?.d.id).toBe("alongamento-noite");
    expect(p?.faltam).toBe(15);
  });
});

describe("filtrarRotina", () => {
  const NUCLEO = ["treino", "cafe-marmita", "almoco", "lanche-saida", "jantar", "agua", "creatina", "caminhada-trabalho", "caes", "dormir"];

  it("dia útil sem nada aberto: tira o que tranca, deixa o núcleo", () => {
    const r = filtrarRotina(buildDayRoutine(1, 1), {});
    for (const id of ["assoalho-pelvico", "skincare-noite", "alongamento-noite", "voz", "postura", "lembrete-sabado-danca"]) {
      expect(ids(r)).not.toContain(id);
    }
    for (const id of NUCLEO) expect(ids(r)).toContain(id);
  });

  it("alongamento da manhã nível 1: curto, com o vacuum", () => {
    const r = filtrarRotina(buildDayRoutine(1, 1), {});
    const a = item(r, "alongamento-manha")!;
    expect(a.to?.endsWith("manha-curta-vacuum")).toBe(true);
    expect(a.subtitle).toMatch(/vacuum/);
    expect(a.linkKey).toBeUndefined();
    const dur = SEQUENCES.find((s) => s.id === SEQ_MANHA_CURTA)!.durationMin;
    expect(a.label).toBe(`Alongamento manhã · ${dur} min`);
  });

  it("skincare da manhã nível 1: protetor solar, checkbox simples", () => {
    const s = item(filtrarRotina(buildDayRoutine(1, 1), {}), "skincare-manha")!;
    expect(s.label.startsWith("Protetor solar")).toBe(true);
    expect(s.control).toBeUndefined();
    expect(s.linkKey).toBeUndefined();
    expect(s.subtitle).toBe("Rosto, orelhas e pescoço antes de sair");
  });

  it("sábado sem dança: some a dança, fica a caminhada", () => {
    const r = filtrarRotina(buildDayRoutine(6, 1), {});
    expect(ids(r)).not.toContain("danca-sabado");
    expect(ids(r)).toContain("caminhada-fds");
  });

  it("assoalho 1 sem 2: identificação com a duração real", () => {
    const a = item(filtrarRotina(buildDayRoutine(1, 1), { "assoalho-1": "x" }), "assoalho-pelvico")!;
    expect(a.to).toBe("/treino/movimento/pelvic-identificacao");
    expect(a.label).toBe("Assoalho pélvico · 5 min");
    expect(a.linkKey).toBeUndefined();
  });

  it("skincare 2 sem 3: noite vira checkbox simples", () => {
    const s = item(filtrarRotina(buildDayRoutine(1, 1), { "skincare-2": "x" }), "skincare-noite")!;
    expect(s.label).toBe("Skincare noite · 3 min");
    expect(s.subtitle).toBe("Gel de limpeza no rosto, depois hidratante");
    expect(s.control).toBeUndefined();
    expect(s.linkKey).toBeUndefined();
  });

  it("voz 1 sem 2: só o aquecimento", () => {
    const v = item(filtrarRotina(buildDayRoutine(1, 1), { "voz-1": "x" }), "voz")!;
    expect(v.label).toBe("Voz · aquecimento 2 min");
    expect(v.to).toBe("/beleza/voz/voz-aquecimento-labial-lingua");
  });

  it("com tudo aberto, a rotina fica igual", () => {
    for (const dow of [0, 1, 6]) {
      const r = buildDayRoutine(dow, 1);
      expect(filtrarRotina(r, TODOS)).toEqual(r);
    }
  });

  it("não muta a rotina de entrada", () => {
    const r = buildDayRoutine(1, 1);
    const copia = JSON.parse(JSON.stringify(r));
    filtrarRotina(r, {});
    expect(r).toEqual(copia);
  });
});

describe("idsTrancados", () => {
  it("sem nada aberto, inclui alongamento da noite e skincare da noite", () => {
    const t = idsTrancados({});
    expect(t.has("alongamento-noite")).toBe(true);
    expect(t.has("skincare-noite")).toBe(true);
  });
  it("com tudo aberto, vazio", () => {
    expect(idsTrancados(TODOS).size).toBe(0);
  });
});

describe("sequência curta da manhã", () => {
  it("existe no seed com o vacuum e execução em todo move", () => {
    const s = SEQUENCES.find((x) => x.id === SEQ_MANHA_CURTA);
    expect(s).toBeDefined();
    expect(s!.moves.some((m) => /vacuum/i.test(m.name))).toBe(true);
    expect(s!.moves.every((m) => m.execucao)).toBe(true);
  });
  it("não entra na trilha de flexibilidade", () => {
    expect([...SEQUENCIAS_FLEX.manha, ...SEQUENCIAS_FLEX.noite]).not.toContain(SEQ_MANHA_CURTA);
  });
});
