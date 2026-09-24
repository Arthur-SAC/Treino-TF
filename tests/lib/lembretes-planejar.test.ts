import { describe, it, expect } from "vitest";
import { planejar, JANELA_DIAS, type ConfigLembretes, type EstadoLembretes } from "../../src/lib/lembretes/planejar";
import { DEFAULTS } from "../../src/lib/settings-helpers";
import { buildDayRoutine } from "../../src/lib/today-routine";
import { hojeISO } from "../../src/lib/today-date";

const EXPOE = /\bTRH\b|horm|fertilidade|disforia|transi[çc][ãa]o|intimidade|[íi]ntim|firmeza|sexo|sexual|safad/i;

const cfg: ConfigLembretes = {
  notificationsEnabled: true,
  quietHours: { from: "22:30", to: "06:00" },
  focusModeUntil: null,
  alongamentoManhaTime: "06:00",
  alongamentoNoiteTime: "21:30",
  workoutReminderTime: "18:15",
  dormirReminderTime: "22:00",
  vitaminaDTime: "12:00",
  activeBreakStartHour: 7,
  activeBreakEndHour: 16,
  activeBreakIntervalMin: 90,
  hydrationIntervalMin: 60,
  hydrationGoalMl: 3000,
};
const vazio: EstadoLembretes = {
  feitosHoje: new Set(), aguaHojeMl: 0, treinouHoje: false,
  treinoPorDia: new Map([[1, "Inferior A"], [3, "Superior A"]]),
  ultimaMedida: "2026-09-24", vitaminaDFeitaEm: [],
};
// Quinta, 24/09/2026, 05:00 (hora local).
const QUINTA_5H = new Date(2026, 8, 24, 5, 0);
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const doDia = (l: ReturnType<typeof planejar>, dia: string) => l.filter((x) => hojeISO(x.quando) === dia);
const titulosDoDia = (l: ReturnType<typeof planejar>, dia: string) => doDia(l, dia).map((x) => `${hhmm(x.quando)} ${x.titulo}`);

describe("planejar — o dia útil", () => {
  it("quinta: alongamentos, água de hora em hora, pausas a cada 90 min, dormir; sem treino (quinta não tem)", () => {
    expect(titulosDoDia(planejar(QUINTA_5H, cfg, vazio), "2026-09-24")).toEqual([
      "06:00 Alongamento",
      "08:00 Água", "08:30 Levanta um pouco", "09:00 Água", "10:00 Água", "10:00 Levanta um pouco",
      "11:00 Água", "11:30 Levanta um pouco", "12:00 Água", "13:00 Água", "13:00 Levanta um pouco",
      "14:00 Água", "14:30 Levanta um pouco", "15:00 Água",
      "21:30 Alongamento", "22:00 Hora de desligar",
    ]);
  });

  it("segunda tem treino às 18h15 com o nome do treino", () => {
    const seg = planejar(QUINTA_5H, cfg, vazio).filter((x) => hojeISO(x.quando) === "2026-09-28" && x.titulo === "Treino");
    expect(seg.map((x) => [hhmm(x.quando), x.corpo])).toEqual([["18:15", "Inferior A"]]);
  });

  it("fim de semana não tem água nem pausa", () => {
    const sab = titulosDoDia(planejar(QUINTA_5H, cfg, vazio), "2026-09-26");
    expect(sab.filter((t) => /Água|Levanta/.test(t))).toEqual([]);
  });
});

describe("planejar — pula o que já foi feito hoje", () => {
  it("alongamento da manhã feito não toca hoje, mas toca amanhã", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, feitosHoje: new Set(["alongamento-manha"]) });
    expect(titulosDoDia(l, "2026-09-24")).not.toContain("06:00 Alongamento");
    expect(titulosDoDia(l, "2026-09-25")).toContain("06:00 Alongamento");
  });
  it("meta de água batida: some a água de hoje, a dos outros dias fica", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, aguaHojeMl: 3000 });
    expect(titulosDoDia(l, "2026-09-24").filter((t) => t.includes("Água"))).toEqual([]);
    expect(titulosDoDia(l, "2026-09-25").filter((t) => t.includes("Água"))).toHaveLength(8);
  });
  it("água de hoje diz quanto já foi; a dos outros dias não inventa número", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, aguaHojeMl: 1200 });
    expect(doDia(l, "2026-09-24").find((x) => x.titulo === "Água")!.corpo).toBe("1200 de 3000 ml");
    expect(doDia(l, "2026-09-25").find((x) => x.titulo === "Água")!.corpo).toBe("Um copo agora");
  });
  it("treinou hoje: o treino de hoje não toca", () => {
    const seg8h = new Date(2026, 8, 28, 8, 0);
    const l = planejar(seg8h, cfg, { ...vazio, treinouHoje: true });
    expect(titulosDoDia(l, "2026-09-28")).not.toContain("18:15 Treino");
  });
});

describe("planejar — medir a cada 2 semanas", () => {
  it("14 dias depois da última medida, às 06:05, e todo dia depois até medir", () => {
    // Medida em 20/09 vence em 04/10; a janela acaba em 08/10 às 05:00.
    const l = planejar(QUINTA_5H, cfg, { ...vazio, ultimaMedida: "2026-09-20" });
    const medir = l.filter((x) => x.titulo === "Medidas").map((x) => hojeISO(x.quando));
    expect(medir).toEqual(["2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07"]);
    const hoje = planejar(QUINTA_5H, cfg, { ...vazio, ultimaMedida: "2026-09-24" });
    expect(hoje.filter((x) => x.titulo === "Medidas")).toEqual([]);
  });
  it("atrasada: todo dia às 06:05 na janela, e abre a tela de medidas", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, ultimaMedida: "2026-09-01" });
    const medir = l.filter((x) => x.titulo === "Medidas");
    expect(medir).toHaveLength(JANELA_DIAS);
    expect(medir.every((x) => hhmm(x.quando) === "06:05" && x.rota === "/corpo/medidas")).toBe(true);
  });
  it("sem nenhuma medida: começa amanhã se 06:05 de hoje já passou", () => {
    const meioDia = new Date(2026, 8, 24, 12, 0);
    const l = planejar(meioDia, cfg, { ...vazio, ultimaMedida: null });
    expect(hojeISO(l.filter((x) => x.titulo === "Medidas")[0].quando)).toBe("2026-09-25");
  });
});

describe("planejar — vitamina D de domingo", () => {
  it("domingo 12:00", () => {
    const l = planejar(QUINTA_5H, cfg, vazio);
    expect(l.filter((x) => x.titulo === "Vitamina D").map((x) => `${hojeISO(x.quando)} ${hhmm(x.quando)}`))
      .toEqual(["2026-09-27 12:00", "2026-10-04 12:00"]);
  });
  it("tomada na semana (segunda a domingo): o domingo dessa semana não toca", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, vitaminaDFeitaEm: ["2026-09-22"] });
    expect(l.filter((x) => x.titulo === "Vitamina D").map((x) => hojeISO(x.quando))).toEqual(["2026-10-04"]);
  });
});

describe("planejar — respeita as regras do app", () => {
  it("notificações desligadas: nada", () => {
    expect(planejar(QUINTA_5H, { ...cfg, notificationsEnabled: false }, vazio)).toEqual([]);
  });
  it("nada no passado, mesmo planejando às 23h", () => {
    const tarde = new Date(2026, 8, 24, 23, 0);
    expect(planejar(tarde, cfg, vazio).every((x) => x.quando.getTime() > tarde.getTime())).toBe(true);
  });
  it("horário mudado pra dentro do silêncio não toca", () => {
    const l = planejar(QUINTA_5H, { ...cfg, alongamentoManhaTime: "05:30" }, vazio);
    expect(l.filter((x) => x.titulo === "Alongamento" && hhmm(x.quando) === "05:30")).toEqual([]);
  });
  it("modo foco: nada antes do fim do foco", () => {
    const fim = new Date(2026, 8, 24, 12, 0).getTime();
    const l = planejar(QUINTA_5H, { ...cfg, focusModeUntil: fim }, vazio);
    expect(l.every((x) => x.quando.getTime() >= fim)).toBe(true);
  });
  it("janela de 14 dias", () => {
    const l = planejar(QUINTA_5H, cfg, vazio);
    const limite = QUINTA_5H.getTime() + JANELA_DIAS * 86400000;
    expect(l.every((x) => x.quando.getTime() <= limite)).toBe(true);
    expect(l.length).toBeLessThan(400);
  });
  it("ids únicos e estáveis entre dois planejamentos", () => {
    const a = planejar(QUINTA_5H, cfg, vazio);
    const b = planejar(new Date(2026, 8, 24, 5, 30), cfg, vazio);
    expect(new Set(a.map((x) => x.id)).size).toBe(a.length);
    const idDe = (l: typeof a, t: string, d: string) => l.find((x) => x.titulo === t && hojeISO(x.quando) === d)!.id;
    expect(idDe(a, "Água", "2026-09-25")).toBe(idDe(b, "Água", "2026-09-25"));
    expect(a.every((x) => Number.isInteger(x.id) && x.id > 0 && x.id < 2 ** 31)).toBe(true);
  });
  it("nenhum texto expõe nada na tela de bloqueio", () => {
    const l = planejar(QUINTA_5H, cfg, { ...vazio, ultimaMedida: null });
    expect(l.filter((x) => EXPOE.test(`${x.titulo} ${x.corpo}`))).toEqual([]);
  });
});

describe("os padrões batem com os horários do Hoje", () => {
  const itens = buildDayRoutine(1, 1).blocks.flatMap((b) => b.items);
  const hora = (id: string) => itens.find((i) => i.id === id)!.defaultTime!;
  it("alongamentos", () => {
    expect(DEFAULTS.alongamentoManhaTime).toBe(hora("alongamento-manha"));
    expect(DEFAULTS.alongamentoNoiteTime).toBe(hora("alongamento-noite"));
  });
  it("hora de desligar fica fora do silêncio e antes de dormir", () => {
    expect(DEFAULTS.dormirReminderTime < DEFAULTS.quietHours.from).toBe(true);
  });
});

// Revisão final: campo de intervalo apagado em Configurações grava 0, e
// `m += 0` travava o app a cada abertura. Intervalo minúsculo estourava o id.
describe("planejar — intervalos inválidos", () => {
  it("intervalo 0 não trava: vale o padrão", () => {
    const l = planejar(QUINTA_5H, { ...cfg, hydrationIntervalMin: 0, activeBreakIntervalMin: 0 }, vazio);
    expect(doDia(l, "2026-09-25").filter((x) => x.titulo === "Água")).toHaveLength(8);
    expect(doDia(l, "2026-09-25").filter((x) => x.titulo === "Levanta um pouco")).toHaveLength(5);
  });
  it("intervalo de 5 min vira o mínimo de 30, com ids válidos e únicos", () => {
    const l = planejar(QUINTA_5H, { ...cfg, hydrationIntervalMin: 5 }, vazio);
    expect(doDia(l, "2026-09-25").filter((x) => x.titulo === "Água")).toHaveLength(17);
    expect(new Set(l.map((x) => x.id)).size).toBe(l.length);
    expect(l.every((x) => x.id < 2 ** 31)).toBe(true);
  });
});
