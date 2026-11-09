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
    expect(itens(1, "pausada").find((i) => i.id === "caes")!.subtitle).toMatch(/único passeio da rotina/);
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
      expect(est).toMatchObject({ defaultTime: "18:00", control: "walk", to: "/treino/exercicio/cardio-zona2", label: "Esteira inclinada · 1 h" });
      expect(est.subtitle).toBe("Logo depois da força: ~6% a 5 km/h, 1 h, ofegante mas falando em frases curtas");
      expect(tarde.map((i) => i.id)).not.toContain("caminhada-trabalho");
      const t = (id: string) => noite.find((i) => i.id === id)?.defaultTime;
      expect(t("jantar")).toBe("20:30");
      expect(t("skincare-noite")).toBe("21:00");
      expect(t("voz")).toBe("21:30");
      // A postura volta pra noite (21:15, depois do jantar e do skincare): às 16:45 cairia entre a caminhada e o treino.
      expect(tarde.map((i) => i.id)).not.toContain("postura");
      expect(t("postura")).toBe("21:15");
      expect(tarde.find((i) => i.id === "treino")!.defaultTime).toBe("17:00");
      // Os cães (19:15) vêm depois da esteira (18:00): moram na noite, logo depois dela.
      expect(tarde.map((i) => i.id)).not.toContain("caes");
      expect(noite.find((i) => i.id === "caes")!.defaultTime).toBe("19:15");
      expect(noite.map((i) => i.id).indexOf("caes")).toBe(noite.map((i) => i.id).indexOf("caminhada-trabalho") + 1);
      expect(tarde.find((i) => i.id === "treino")!.subtitle).toBe("Força primeiro; a esteira vem logo depois");
      for (const b of ["tarde", "noite"]) {
        const h = horas(bloco(dow, b, "esteira"));
        expect(h).toEqual([...h].sort());
      }
    }
  });

  it("esteira: nada se sobrepõe entre 16:00 e 19:15 (treino 17:00, esteira 18:00 de 1 h)", () => {
    for (const dow of [1, 2, 3, 4, 5]) {
      const dentro = itens(dow, "esteira")
        .filter((i) => i.defaultTime && i.defaultTime >= "16:00" && i.defaultTime < "19:15")
        .map((i) => [i.id, i.defaultTime]);
      expect(dentro).toEqual([["treino", "17:00"], ["caminhada-trabalho", "18:00"]]);
    }
  });

  it("caminhada e pausada: nenhum item de dia útil começa entre 20:00 e 20:30 além do jantar", () => {
    for (const modo of ["caminhada", "pausada"] as const) {
      for (const dow of [1, 2, 3, 4, 5]) {
        const dentro = itens(dow, modo)
          .filter((i) => i.defaultTime && i.defaultTime >= "20:00" && i.defaultTime < "20:30")
          .map((i) => i.id);
        expect(dentro).toEqual(["jantar"]);
      }
    }
  });

  it("em todos os modos e dias: nada começa nos 30 min do jantar e a noite é estritamente crescente", () => {
    const min = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
    for (const modo of ["caminhada", "esteira", "pausada"] as const) {
      for (const dow of [0, 1, 2, 3, 4, 5, 6]) {
        const todos = itens(dow, modo);
        const jantar = min(todos.find((i) => i.id === "jantar")!.defaultTime!);
        const dentro = todos
          .filter((i) => i.id !== "jantar" && i.defaultTime && min(i.defaultTime) >= jantar && min(i.defaultTime) < jantar + 30)
          .map((i) => i.id);
        expect(dentro, `${modo} dow ${dow}`).toEqual([]);
        const hs = bloco(dow, "noite", modo).map((i) => i.defaultTime).filter(Boolean).map((h) => min(h!));
        expect(hs, `${modo} dow ${dow}`).toEqual([...new Set(hs)].sort((x, y) => x - y));
      }
    }
  });

  it("pausada: treino às 17:00 e jantar às 20:00 nos dias úteis", () => {
    const t = bloco(2, "tarde", "pausada").find((i) => i.id === "treino")!;
    expect(t.defaultTime).toBe("17:00");
    expect(bloco(2, "noite", "pausada").find((i) => i.id === "jantar")!.defaultTime).toBe("20:00");
  });

  it("esteira no fim de semana não muda: continua de manhã e a postura fica na noite", () => {
    for (const dow of [0, 6]) {
      expect(bloco(dow, "manha", "esteira").map((i) => i.id)).toContain("caminhada-fds");
      expect(bloco(dow, "noite", "esteira").find((i) => i.id === "postura")!.defaultTime).toBe("20:45");
      expect(bloco(dow, "noite", "esteira").find((i) => i.id === "jantar")!.defaultTime).toBe("19:30");
    }
  });

  it("caminhada em dia útil continua como era", () => {
    const tarde = bloco(2, "tarde", "caminhada").map((i) => [i.id, i.defaultTime]);
    expect(tarde).toEqual([["lanche-saida", "15:30"], ["caminhada-trabalho", "16:00"], ["treino", "17:00"], ["caes", "18:45"]]);
    const noite = bloco(2, "noite", "caminhada").map((i) => [i.id, i.defaultTime]).slice(0, 4);
    expect(noite).toEqual([["jantar", "20:00"], ["skincare-noite", "20:30"], ["postura", "20:45"], ["voz", "21:00"]]);
  });

  it("o lanche da semana não cita a caminhada fora do modo caminhada", () => {
    const l = (m: Parameters<typeof buildDayRoutine>[3]) => bloco(2, "tarde", m).find((i) => i.id === "lanche-saida")!.subtitle;
    expect(l("esteira")).toMatch(/combustível até o treino/);
    expect(l("esteira")).not.toMatch(/meia hora antes do treino/);
    expect(l("esteira")).toMatch(/treino das 17h/);
    expect(l("pausada")).toMatch(/combustível até o treino/);
    expect(l("pausada")).not.toMatch(/meia hora antes do treino/);
    expect(l("caminhada")).toMatch(/coma antes de sair às 16h/);
  });
});

describe("ordem de exibição segue o horário", () => {
  const paraMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
  for (const modo of ["caminhada", "esteira", "pausada"] as const) {
    for (let dia = 0; dia < 7; dia++) {
      it(`${modo}, dia ${dia}: horários não decrescem na ordem da tela`, () => {
        const horas = buildDayRoutine(dia, 1, [], modo).blocks
          .flatMap((b) => b.items)
          .filter((i) => i.defaultTime)
          .map((i) => ({ id: i.id, min: paraMin(i.defaultTime!) }));
        for (let k = 1; k < horas.length; k++) {
          expect(horas[k].min, `${horas[k - 1].id} → ${horas[k].id}`).toBeGreaterThanOrEqual(horas[k - 1].min);
        }
      });
    }
  }
});
