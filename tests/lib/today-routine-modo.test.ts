// tests/lib/today-routine-modo.test.ts
import { describe, it, expect } from "vitest";
import { buildDayRoutine, metaCaminhadaMin, ITENS_CAMINHADA } from "../../src/lib/today-routine";

const bloco = (dow: number, id: string, modo?: Parameters<typeof buildDayRoutine>[3]) =>
  buildDayRoutine(dow, 2, [], modo).blocks.find((b) => b.id === id)!.items;
const horas = (xs: { defaultTime?: string }[]) => xs.map((i) => i.defaultTime).filter(Boolean) as string[];

const itens = (dow: number, modo?: Parameters<typeof buildDayRoutine>[3]) =>
  buildDayRoutine(dow, 2, [], modo).blocks.flatMap((b) => b.items);

const REDE = /caminhada de 5 km|caminhada das 16h|5 km da manhã|Sem cardio no fim/;

describe("rotina pelo modo das caminhadas", () => {
  it("os ids de caminhada existem na rotina (segunda e sábado)", () => {
    const ids = [...itens(1), ...itens(6)].map((i) => i.id);
    for (const id of ITENS_CAMINHADA) expect(ids).toContain(id);
  });

  it("esteira troca rótulo e instrução nos dois itens e mantém o controle de caminhada", () => {
    for (const dow of [1, 6]) {
      const item = itens(dow, "esteira").find((i) => (ITENS_CAMINHADA as readonly string[]).includes(i.id))!;
      expect(item.label).toMatch(/Esteira inclinada/);
      expect(item.subtitle).toMatch(dow === 1 ? /~6% a 5 km\/h/ : /6–10%/);
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
      for (const i of itens(dow, "pausada")) expect(i.subtitle ?? "").not.toMatch(REDE);
      for (const i of itens(dow, "esteira")) expect(i.subtitle ?? "").not.toMatch(REDE);
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

  it("esteira em dia útil: a esteira vem logo depois da força, na noite, e o resto se reorganiza", () => {
    for (const dow of [1, 2, 3, 4, 5]) {
      const noite = bloco(dow, "noite", "esteira");
      const tarde = bloco(dow, "tarde", "esteira");
      const est = noite.find((i) => i.id === "caminhada-trabalho")!;
      expect(est).toMatchObject({ defaultTime: "19:15", control: "walk", to: "/treino/exercicio/cardio-zona2", label: "Esteira inclinada · 1 h" });
      expect(est.subtitle).toBe("Logo depois da força: ~6% a 5 km/h, 1 h, ofegante mas falando em frases curtas");
      expect(tarde.map((i) => i.id)).not.toContain("caminhada-trabalho");
      const t = (id: string) => noite.find((i) => i.id === id)?.defaultTime;
      expect(t("jantar")).toBe("20:30");
      expect(t("skincare-noite")).toBe("21:00");
      expect(t("voz")).toBe("21:10");
      expect(noite.map((i) => i.id)).not.toContain("postura");
      expect(tarde.find((i) => i.id === "postura")).toMatchObject({ defaultTime: "16:45", linkKey: "postura" });
      expect(tarde.find((i) => i.id === "treino")!.subtitle).toBe("Força primeiro; a esteira vem logo depois");
      for (const b of ["tarde", "noite"]) {
        const h = horas(bloco(dow, b, "esteira"));
        expect(h).toEqual([...h].sort());
      }
    }
  });

  it("esteira no fim de semana não muda: continua de manhã e a postura fica na noite", () => {
    for (const dow of [0, 6]) {
      expect(bloco(dow, "manha", "esteira").map((i) => i.id)).toContain("caminhada-fds");
      expect(bloco(dow, "noite", "esteira").find((i) => i.id === "postura")!.defaultTime).toBe("20:15");
      expect(bloco(dow, "noite", "esteira").find((i) => i.id === "jantar")!.defaultTime).toBe("19:30");
    }
  });

  it("caminhada em dia útil continua como era", () => {
    const tarde = bloco(2, "tarde", "caminhada").map((i) => [i.id, i.defaultTime]);
    expect(tarde).toEqual([["lanche-saida", "15:30"], ["caminhada-trabalho", "16:00"], ["caes", "17:15"], ["treino", "18:15"]]);
    const noite = bloco(2, "noite", "caminhada").map((i) => [i.id, i.defaultTime]).slice(0, 4);
    expect(noite).toEqual([["jantar", "19:30"], ["skincare-noite", "20:00"], ["postura", "20:15"], ["voz", "21:00"]]);
  });

  it("o lanche da semana não cita a caminhada fora do modo caminhada", () => {
    const l = (m: Parameters<typeof buildDayRoutine>[3]) => bloco(2, "tarde", m).find((i) => i.id === "lanche-saida")!.subtitle;
    expect(l("esteira")).toMatch(/combustível até o treino/);
    expect(l("esteira")).not.toMatch(/meia hora antes do treino/);
    expect(l("pausada")).toMatch(/combustível até o treino/);
    expect(l("pausada")).not.toMatch(/meia hora antes do treino/);
    expect(l("caminhada")).toMatch(/caminhada de 5 km/);
  });
});
