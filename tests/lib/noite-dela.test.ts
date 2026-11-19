import { describe, it, expect } from "vitest";
import { buildDayRoutine, ehDela, type RoutineItem } from "../../src/lib/today-routine";
import { planejar, type ConfigLembretes, type EstadoLembretes } from "../../src/lib/lembretes/planejar";
import { contarAdesao } from "../../src/lib/adesao";
import { revisarSemana } from "../../src/lib/revisao-semanal";
import { EXPOE } from "../../src/lib/discricao";
import { hojeISO } from "../../src/lib/today-date";

// Spec 2026-11-19 (rotina em linha do tempo), seção 3: a noite tem blocos dela.
const noite = (dow: number, modo: "caminhada" | "esteira" | "pausada" = "caminhada"): RoutineItem[] =>
  buildDayRoutine(dow, 100, [], modo).blocks.find((b) => b.id === "noite")!.items;
const porHora = (itens: RoutineItem[]) =>
  [...itens].filter((i) => i.defaultTime).sort((a, b) => a.defaultTime!.localeCompare(b.defaultTime!));

describe("noite de segunda a quinta e domingo", () => {
  for (const dow of [3, 0]) {
    it(`dia ${dow}: jantar, bloco do app, com ela, leitura e dormir na ordem`, () => {
      const base = porHora(noite(dow)).filter((i) => ["jantar", "skincare-noite", "alongamento-noite", "com-ela", "leitura", "dormir"].includes(i.id));
      expect(base.map((i) => [i.id, i.defaultTime])).toEqual([
        ["jantar", "20:15"], ["skincare-noite", "20:45"], ["alongamento-noite", "20:50"],
        ["com-ela", "21:15"], ["leitura", "22:15"], ["dormir", "22:30"],
      ]);
      const n = noite(dow);
      expect(n.find((i) => i.id === "com-ela")).toMatchObject({ control: "dela", label: "Noite livre", subtitle: "Desenho, escrita, RPG ou conversa" });
      expect(n.find((i) => i.id === "leitura")).toMatchObject({ control: "dela", label: "Leitura" });
    });
  }

  it("postura, voz e assoalho seguem na lista, com horário provisório 21:05", () => {
    const n = noite(3);
    for (const id of ["postura", "voz", "assoalho-pelvico"]) expect(n.find((i) => i.id === id)!.defaultTime).toBe("21:05");
  });

  it("modo esteira: o jantar não cai antes da esteira acabar e os blocos dela vêm depois do bloco do app", () => {
    const n = noite(2, "esteira");
    const t = (id: string) => n.find((i) => i.id === id)!.defaultTime!;
    expect(t("jantar") >= "20:15").toBe(true);
    expect(t("skincare-noite") >= "20:45").toBe(true);
    expect(t("alongamento-noite") > t("skincare-noite")).toBe(true);
    for (const id of ["postura", "voz", "assoalho-pelvico"]) expect(t(id) < t("com-ela")).toBe(true);
    expect(t("alongamento-noite") < t("com-ela")).toBe(true);
    expect(t("com-ela") < t("leitura") && t("leitura") < t("dormir")).toBe(true);
  });
});

describe("sexta e sábado: das 18h em diante é dela", () => {
  for (const dow of [5, 6]) {
    it(`dia ${dow}: sem bloco do app, só noite livre e dormir`, () => {
      const ids = noite(dow).map((i) => i.id);
      for (const fora of ["skincare-noite", "alongamento-noite", "postura", "voz", "assoalho-pelvico", "com-ela", "leitura"]) {
        expect(ids).not.toContain(fora);
      }
      expect(noite(dow).find((i) => i.id === "noite-livre")).toMatchObject({ defaultTime: "18:00", control: "dela", label: "Noite livre" });
      expect(ids).toContain("dormir");
    });
  }
});

describe("itens dela nunca contam nem tocam", () => {
  it("ehDela só reconhece control dela", () => {
    expect(ehDela({ id: "x", block: "noite", label: "x", control: "dela" })).toBe(true);
    expect(ehDela({ id: "x", block: "noite", label: "x", control: "check" })).toBe(false);
  });

  const cfg: ConfigLembretes = {
    notificationsEnabled: true, quietHours: { from: "22:30", to: "06:00" }, focusModeUntil: null,
    alongamentoManhaTime: "06:00", alongamentoNoiteTime: "20:50", workoutReminderTime: "15:50",
    dormirReminderTime: "22:00", vitaminaDTime: "12:00", activeBreakStartHour: 7, activeBreakEndHour: 16,
    activeBreakIntervalMin: 90, hydrationIntervalMin: 60, hydrationGoalMl: 3000, trancados: new Set(), alongamentoManhaMin: 10,
  };
  const vazio: EstadoLembretes = {
    feitosHoje: new Set(), aguaHojeMl: 0, treinouHoje: false, treinoPorDia: new Map(),
    ultimaMedida: "2026-09-24", vitaminaDFeitaEm: [], ultimoBackupEm: "2026-09-24",
  };

  const IDS_DO_APP = ["skincare-noite", "alongamento-noite", "postura", "voz", "assoalho-pelvico"];

  it("planejar: sexta não agenda lembrete do app à noite; quarta agenda o alongamento", () => {
    const l = planejar(new Date(2026, 8, 24, 5, 0), cfg, vazio);
    const sexta = l.filter((x) => hojeISO(x.quando) === "2026-09-25");
    const quarta = l.filter((x) => hojeISO(x.quando) === "2026-09-30");
    const noites = (xs: typeof l) => xs.filter((x) => x.quando.getHours() >= 18);
    expect(noites(sexta).filter((x) => x.titulo === "Alongamento" || (x.itemId && IDS_DO_APP.includes(x.itemId)))).toEqual([]);
    expect(noites(quarta).some((x) => x.itemId === "alongamento-noite")).toBe(true);
  });

  // RF 4: base com itens reais marcados; marcar os itens dela não muda nada.
  const janela = ["2026-09-24", "2026-09-25"];
  const real = [
    { date: "2026-09-24", itemId: "caminhada-trabalho", done: true },
    { date: "2026-09-25", itemId: "caminhada-trabalho", done: true },
    { date: "2026-09-24", itemId: "jantar", done: true },
    { date: "2026-09-24", itemId: "dormir", done: true },
  ];
  const dela = ["com-ela", "leitura", "noite-livre"].flatMap((itemId) => janela.map((date) => ({ date, itemId, done: true })));
  const dados = (checks: unknown[]) => ({
    sessoes: [{ date: "2026-09-24" }],
    checks: checks as never,
    logs: [],
    praticas: [{ date: "2026-09-24", sequenceId: "flexibilidade-intima", completed: true }] as never,
  });

  it("adesão: totais reais não zerados e iguais com os itens dela marcados", () => {
    const sem = contarAdesao(janela, dados(real), "22:30");
    const com = contarAdesao(janela, dados([...real, ...dela]), "22:30");
    expect(sem).toMatchObject({ treinos: 1, diasCardio: 2, alongamentosNoite: 1 });
    expect(com).toEqual(sem);
  });

  it("revisão semanal: as linhas e o ajuste não mudam com os itens dela marcados", () => {
    const sem = revisarSemana(contarAdesao(janela, dados(real), "22:30"), "caminhada");
    const com = revisarSemana(contarAdesao(janela, dados([...real, ...dela]), "22:30"), "caminhada");
    expect(com).toEqual(sem);
  });
  // sequencia.ts só recebe as datas de treino (não lê routineChecks), então itens dela não entram nela.
});

describe("textos", () => {
  it("o café não fala whey", () => {
    const cafe = buildDayRoutine(1, 1).blocks.flatMap((b) => b.items).find((i) => i.id === "cafe-marmita")!;
    expect(cafe.label.toLowerCase()).not.toContain("whey");
  });
  it("os rótulos novos passam na regra de discrição", () => {
    for (const dow of [0, 3, 5, 6]) {
      for (const i of noite(dow).filter(ehDela)) expect(EXPOE.test(`${i.label} ${i.subtitle ?? ""}`)).toBe(false);
    }
  });
});
