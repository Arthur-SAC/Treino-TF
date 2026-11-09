import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES } from "../../src/data/all-templates";
import { EXERCISES } from "../../src/data/exercises-seed";
import { SEQUENCES } from "../../src/data/sequences-seed";
import { SEQUENCIAS_FLEX } from "../../src/lib/flex-progression";
import { buildDayRoutine } from "../../src/lib/today-routine";
import { GRUPO_DO_EXERCICIO } from "../../src/lib/volume-muscular";
import { UNILATERAIS } from "../../src/lib/troca-aparelho";

// Decisão dela, 2026-11-09: "Eu me sentiria mais confortável usando máquina;
// se não tivesse eu faria com halteres — a não ser que eles sejam melhores e
// mais focados no meu objetivo." Onde a máquina ou a polia rende igual, ela é
// o exercício e o peso livre vira o plano B (`substitutoId`). Onde o livre é
// melhor pro objetivo, ele fica.

/** Peso livre que virou plano B → a máquina/polia que entrou na frente dele. */
const PLANO_B: Record<string, string[]> = {
  "supino-inclinado-halteres": ["supino-inclinado-maquina"],
  "remada-unilateral-halter": ["remada-baixa-maquina", "remada-polia-unilateral"],
  "rosca-martelo": ["rosca-polia"],
  "rosca-barra-w": ["rosca-polia"],
  "triceps-testa-barra-w": ["triceps-polia-corda"],
  kickback: ["coice-gluteo-polia"],
  "ponte-gluteo-band": ["hip-thrust-maquina", "abdutor-maquina", "pull-through-polia"],
  "abdutor-deitada": ["abdutor-maquina", "hip-thrust-maquina", "abducao-quadril-polia"],
  "prancha-antirrotacao": ["pallof-polia"],
  "kettlebell-swing": ["pull-through-polia"],
};

/** Livres de propósito: rendem mais pro objetivo que a versão de máquina. */
const FICAM_LIVRES = ["agachamento-bulgaro", "agachamento-goblet", "carregamento-frontal", "farmer-walk"];

const itens = ALL_TEMPLATES.flatMap((t) => t.exercises.map((e) => ({ t: t.id, ...e })));

describe("máquina primeiro, peso livre como plano B", () => {
  it("nenhum peso livre que tem máquina equivalente é mais o exercício principal", () => {
    const principais = itens.filter((e) => e.exerciseId in PLANO_B).map((e) => `${e.t}: ${e.exerciseId}`);
    expect(principais).toEqual([]);
  });

  it("onde o livre aparece, é o plano B da máquina/polia que entrou na frente dele", () => {
    const errados = itens
      .filter((e) => e.substitutoId && e.substitutoId in PLANO_B)
      .filter((e) => !PLANO_B[e.substitutoId!].includes(e.exerciseId))
      .map((e) => `${e.t}: ${e.exerciseId} → ${e.substitutoId}`);
    expect(errados).toEqual([]);
  });

  it("nenhum dos livres saiu do programa: todo um continua como plano B em algum treino", () => {
    const sumiram = Object.keys(PLANO_B).filter(
      (id) => !itens.some((e) => e.exerciseId === id || e.substitutoId === id),
    );
    expect(sumiram).toEqual([]);
  });

  it("búlgaro, goblet, carregamento frontal e farmer walk continuam livres e principais", () => {
    const faltam = FICAM_LIVRES.filter((id) => !itens.some((e) => e.exerciseId === id));
    expect(faltam).toEqual([]);
  });

  it("os dois aparelhos novos existem, com grupo muscular, e a remada na polia é de um lado por vez", () => {
    const porId = new Map(EXERCISES.map((e) => [e.id, e]));
    const supino = porId.get("supino-inclinado-maquina");
    const remada = porId.get("remada-polia-unilateral");
    expect(supino?.name).toMatch(/\(se tiver\)$/);
    expect(supino?.equipment).toEqual(["maquina-supino-inclinado"]);
    expect(remada?.equipment).toContain("polia");
    expect(GRUPO_DO_EXERCICIO["supino-inclinado-maquina"]).toBe("peito");
    expect(GRUPO_DO_EXERCICIO["remada-polia-unilateral"]).toBe("costas");
    expect(UNILATERAIS.has("remada-polia-unilateral")).toBe(true);
  });
});

describe("vacuum em casa, todo dia", () => {
  it("saiu de todo treino de academia", () => {
    const com = ALL_TEMPLATES.filter((t) => t.exercises.some((e) => e.exerciseId === "vacuum-abdominal")).map((t) => t.id);
    expect(com).toEqual([]);
  });

  it("o alongamento da manhã está no Hoje nos sete dias", () => {
    const faltando = [0, 1, 2, 3, 4, 5, 6].filter(
      (d) => !buildDayRoutine(d, 100).blocks.some((b) => b.items.some((i) => i.id === "alongamento-manha")),
    );
    expect(faltando).toEqual([]);
  });

  it("e toda fase do alongamento da manhã tem vacuum — a que o Hoje serve primeiro inclusive", () => {
    const sem = SEQUENCIAS_FLEX.manha.filter(
      (id) => !SEQUENCES.find((s) => s.id === id)?.moves.some((m) => /vacuum/i.test(m.name)),
    );
    expect(sem).toEqual([]);
    expect(SEQUENCIAS_FLEX.manha[0]).toBe("mobilidade-pelvica-matinal");
  });
});
