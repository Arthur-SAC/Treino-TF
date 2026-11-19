import { describe, it, expect } from "vitest";
import { projetar } from "../../src/lib/partida";
import { linhaDosPrazos, linhaDoTempo, textoDoRodizio } from "../../src/lib/linha-do-tempo";
import { buildDayRoutine, type DayRoutine } from "../../src/lib/today-routine";

const pr = projetar({ data: "2026-09-25", pesoKg: 96, cinturaCm: 99, pescocoCm: 40 }, 173)!;

describe("linha do tempo", () => {
  it("sem partida, diz que os prazos aparecem depois da primeira medição — sem datas de maio", () => {
    const s = JSON.stringify(linhaDosPrazos(null));
    expect(s).toMatch(/depois da sua primeira medição/i);
    expect(s).not.toMatch(/2026-05|13\/05|maio/i);
    expect(s).not.toMatch(/NaN|undefined/);
  });

  it("com partida, dá mês de calendário pra cintura 88, fim da fase 1 e fim da fase 2", () => {
    const s = JSON.stringify(linhaDosPrazos(pr));
    expect(s).toMatch(/Cintura 88/);
    expect(s).toMatch(/\/2027/);
    expect(s).toMatch(/\/2028/);
    expect(s).toMatch(/balança SOBE/);
    expect(s).toMatch(/Fase 2 termina entre/);
  });

  it("a versão visível tem data, quadril e razão vindos do objetivo — e não promete o fim", () => {
    const s = JSON.stringify(linhaDosPrazos(pr));
    expect(s).toMatch(/Versão visível entre nov\/2027 e fev\/2028/);
    expect(s).toMatch(/quadril em 110–112/);
    expect(s).toMatch(/0,76–0,78/);
    expect(s).toMatch(/não é o fim/i);
  });

  it("partida já abaixo de 88 não inventa data pra trava", () => {
    const abaixo = projetar({ data: "2026-09-25", pesoKg: 90, cinturaCm: 87, pescocoCm: 40 }, 173)!;
    expect(JSON.stringify(linhaDosPrazos(abaixo))).toMatch(/já começou abaixo/);
  });

  it("não ancora prazo em idade", () => {
    expect(JSON.stringify(linhaDosPrazos(pr))).not.toMatch(/\b\d{2}\s*anos\b/i);
  });
});

// O Hoje vira uma linha do tempo só (spec 2026-11-19, seção 2): os itens na
// ordem das horas, o ajuste dela em /hoje/horarios decidindo a posição, e os
// itens sem horário (água, sol, "Esta semana") ainda visíveis.
const QUARTA = 3;

function rotina(): DayRoutine {
  return {
    dayOfWeek: QUARTA,
    blocks: [
      { id: "manha", label: "Manhã", items: [
        { id: "a", block: "manha", label: "A", defaultTime: "19:30" },
        { id: "b", block: "manha", label: "B", defaultTime: "06:00" },
        { id: "sol", block: "manha", label: "Sol" },
      ] },
      { id: "trabalho", label: "Trabalho", items: [
        { id: "agua", block: "trabalho", label: "Água", control: "water" },
        { id: "c", block: "trabalho", label: "C", defaultTime: "12:00" },
      ] },
      { id: "noite", label: "Noite", items: [
        { id: "d", block: "noite", label: "D", defaultTime: "21:05" },
        { id: "e", block: "noite", label: "E", defaultTime: "21:05" },
      ] },
      { id: "semana", label: "Esta semana", items: [
        { id: "s", block: "semana", label: "S" },
      ] },
    ],
  };
}

describe("linhaDoTempo", () => {
  it("ordena pela hora resolvida: o ajuste dela (19:00) vem antes de um padrão de 19:30 [RF 3]", () => {
    const r = rotina();
    r.blocks[2].items.push({ id: "x", block: "noite", label: "X", defaultTime: "21:00" });
    const l = linhaDoTempo(r, { x: "19:00" });
    const ids = l.horas.map((i) => i.id);
    expect(ids.indexOf("x")).toBeLessThan(ids.indexOf("a"));
    expect(ids).toEqual(["b", "c", "x", "a", "d", "e"]);
  });

  it("empate de hora mantém a ordem dos blocos", () => {
    const l = linhaDoTempo(rotina(), {});
    expect(l.horas.filter((i) => i.defaultTime === "21:05").map((i) => i.id)).toEqual(["d", "e"]);
  });

  it("água e sol ficam em diaInteiro; o bloco semana fica em semana [RF 2]", () => {
    const l = linhaDoTempo(rotina(), {});
    expect(l.diaInteiro.map((i) => i.id)).toEqual(["sol", "agua"]);
    expect(l.semana.map((i) => i.id)).toEqual(["s"]);
  });

  it("um horário dado por ela tira o item do dia inteiro e põe na hora", () => {
    const l = linhaDoTempo(rotina(), { agua: "10:00" });
    expect(l.diaInteiro.map((i) => i.id)).toEqual(["sol"]);
    expect(l.horas.map((i) => i.id)).toContain("agua");
  });

  it("nada se perde: a soma dos três é o dia inteiro, nos sete dias", () => {
    for (let dow = 0; dow < 7; dow++) {
      const r = buildDayRoutine(dow, 10, ["07:00", "08:30"]);
      const l = linhaDoTempo(r, {});
      const todos = r.blocks.flatMap((b) => b.items.map((i) => i.id)).sort();
      expect([...l.diaInteiro, ...l.horas, ...l.semana].map((i) => i.id).sort()).toEqual(todos);
      expect(l.diaInteiro.map((i) => i.id)).toContain("agua");
    }
  });
});

describe("textoDoRodizio", () => {
  it("diz em que noites a parte nova entra e pra onde vai a que cedeu", () => {
    const antes = { 0: ["assoalho-pelvico"], 1: ["assoalho-pelvico"], 2: ["assoalho-pelvico"], 3: ["assoalho-pelvico"], 4: ["assoalho-pelvico"], 5: [], 6: [] };
    const depois = { 0: ["voz"], 1: ["voz"], 2: ["assoalho-pelvico"], 3: ["voz"], 4: ["assoalho-pelvico"], 5: [], 6: [] };
    expect(textoDoRodizio(antes, depois, "voz")).toBe(
      "Entra seg, qua e dom. Pra caber nos 30 min da noite, o assoalho fica pra ter e qui.",
    );
  });

  it("sem conflito, só diz as noites", () => {
    const vazio = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    const depois = { 0: ["postura"], 1: ["postura"], 2: ["postura"], 3: ["postura"], 4: ["postura"], 5: [], 6: [] };
    expect(textoDoRodizio(vazio, depois, "postura")).toBe("Entra seg, ter, qua, qui e dom.");
  });

  it("parte que não cabe em noite nenhuma: diz isso", () => {
    const vazio = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    expect(textoDoRodizio(vazio, vazio, "voz")).toBe("Com o que já está aberto, não cabe nos 30 min da noite.");
  });

  it("parte que não é do rodízio (skincare) só diz quem cedeu", () => {
    const antes = { 0: ["voz"], 1: ["voz"], 2: ["voz"], 3: ["voz"], 4: ["voz"], 5: [], 6: [] };
    const depois = { 0: [], 1: ["voz"], 2: [], 3: ["voz"], 4: [], 5: [], 6: [] };
    expect(textoDoRodizio(antes, depois, "skincare-noite")).toBe("Pra caber nos 30 min da noite, a voz fica pra seg e qua.");
    expect(textoDoRodizio(antes, antes, "skincare-noite")).toBeUndefined();
  });
});
