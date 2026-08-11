import { describe, it, expect, beforeEach } from "vitest";
import { db, type Milestone } from "../../src/lib/db";
import { seedPath } from "../../src/lib/path-seed";
import {
  MILESTONES,
  BODY_GOAL_MILESTONES,
  BUST_MILESTONES,
  VOICE_MILESTONES,
} from "../../src/data/milestones-seed";

// O banco dela na v6, transcrito do seed que estava em `main`. Este arquivo é o
// único lugar do repositório onde os títulos antigos ainda existem — é de
// propósito: a migração precisa ser testada contra o que está gravado no
// aparelho, não contra o que o seed passou a dizer.
const MARCOS_V6: Omit<Milestone, "id">[] = [
  { datePlanned: "2026-05-13", title: "Buscar dermatologista pra acompanhar tratamentos de pele", category: "medico" },
  { datePlanned: "2026-05-13", title: "Buscar nutricionista pra calibrar plano alimentar", category: "medico" },
  { datePlanned: "2026-06-13", title: "Primeira foto de progresso pós-início do plano", category: "fisico" },
  { datePlanned: "2026-08-13", title: "Re-avaliar relação cintura/quadril (WHR)", category: "fisico", notes: "Meta: cintura reduzir 1-2cm + quadril aumentar 1-2cm com treino de glúteo." },
  { datePlanned: "2026-11-13", title: "✂ Cabelo na fase de transição — manter forma e saúde crescendo", category: "fisico" },
  { datePlanned: "2027-02-13", title: "Conversa com endocrinologista sobre planejamento de TRH", category: "fertilidade" },
  { datePlanned: "2027-05-13", title: "Avaliar congelamento de gametas (criopreservação)", category: "fertilidade" },

  // O roadmap físico como a v6 o gravou — inclusive com o espaço depois do
  // símbolo, que foi o formato produzido pela migração de emojis da v6.
  { datePlanned: "2026-05-13", title: "◆ Fase 1 — Secar barriga + base de glúteo (início)", category: "fisico", notes: "Déficit 2.200 kcal + proteína alta + treino glúteo-prioritário." },
  { datePlanned: "2026-05-13", title: "▣ Foto de partida (frente / lado / costas)", category: "fisico" },
  { datePlanned: "2026-08-13", title: "▣ Check-in 3 meses + medir cintura/quadril", category: "fisico" },
  { datePlanned: "2026-09-13", title: "◆ Fase 2/3 — Entrar em hipertrofia de glúteo", category: "fisico" },
  { datePlanned: "2026-11-13", title: "▣ Check-in 6 meses — quadril/bunda crescendo", category: "fisico" },
  { datePlanned: "2027-02-13", title: "▱ WHR rumo a 0,75 (cintura fina + quadril cheio)", category: "fisico" },
  { datePlanned: "2027-05-13", title: "◆ Fase 5 — Manutenção + alinhar com início da TRH", category: "fisico", notes: "Com a base muscular pronta, o estrogênio faz a redistribuição de gordura." },

  { datePlanned: "2026-09-13", title: "♡ Busto sem TH — avaliar começar a usar bralette", category: "fisico", notes: "Salto de tamanho e formato de verdade vem com a TH." },

  ...VOICE_MILESTONES.map((m) => ({ ...m, datePlanned: "2026-06-13" })),
];

/** Reconstrói o estado de quem já usava o app: marcos gravados, seed marcado
 *  como feito e a versão parada na 6. */
async function bancoNaV6(marcos: Omit<Milestone, "id">[] = MARCOS_V6): Promise<void> {
  for (const m of marcos) await db.milestones.add(m as never);
  await db.settings.put({ key: "pathSeeded", value: true });
  await db.settings.put({ key: "milestoneSeedVersion", value: 6 });
  await db.settings.put({ key: "mealPlanVersion", value: 7 });
}

const titulos = async () => (await db.milestones.toArray()).map((m) => m.title);
const acheTitulo = async (trecho: string) =>
  (await db.milestones.toArray()).find((m) => m.title.includes(trecho));

const TOTAL_DO_SEED =
  MILESTONES.length + BODY_GOAL_MILESTONES.length + BUST_MILESTONES.length + VOICE_MILESTONES.length;

describe("migração v7 dos marcos", () => {
  beforeEach(async () => {
    await db.milestones.clear();
    await db.settings.clear();
  });

  it("os textos reescritos nesta branch chegam a quem já estava na v6", async () => {
    await bancoNaV6();
    await seedPath();

    const t = await titulos();
    expect(t).toContain("◆Fase 1 — Tirar a barriga (início)");
    expect(t).toContain("▱Cintura 88 — destrava o superávit");
    expect(t).toContain("▱Cintura 84 — a silhueta vira");
    expect(t).toContain("◆Fase 2 — Construir glúteo (a balança SOBE)");
    expect(t).toContain("▣Check-in 18 meses — comparar com a foto de partida");
    expect(t).toContain("♡ Busto sem hormônio — avaliar começar a usar bralette");

    const tudo = JSON.stringify(await db.milestones.toArray());
    expect(tudo).toContain("2.300");
    expect(tudo).not.toContain("2.200");
    expect(tudo).not.toMatch(/\bTR?H\b/);
  });

  it("os marcos que a branch tirou da linha do tempo somem", async () => {
    await bancoNaV6();
    await seedPath();

    const t = await titulos();
    expect(t.some((x) => x.includes("endocrinologista"))).toBe(false);
    expect(t.some((x) => x.includes("criopreservação"))).toBe(false);
    expect(t.some((x) => x.includes("Fase 5"))).toBe(false);
  });

  it("não duplica: cada marco do seed aparece uma vez só", async () => {
    await bancoNaV6();
    await seedPath();

    const t = await titulos();
    expect(t).toHaveLength(TOTAL_DO_SEED);
    expect(new Set(t).size).toBe(TOTAL_DO_SEED);
  });

  it("rodar a migração duas vezes não duplica nem desfaz nada", async () => {
    await bancoNaV6();
    await seedPath();
    const depoisDaPrimeira = (await titulos()).sort();

    // Força a v6 de novo: prova que a idempotência é da própria migração, não
    // só da trava de versão que a envolve.
    await db.settings.put({ key: "milestoneSeedVersion", value: 6 });
    await seedPath();

    expect((await titulos()).sort()).toEqual(depoisDaPrimeira);
  });

  it("conclusão registrada antes da migração sobrevive à reescrita do marco", async () => {
    await bancoNaV6();
    const antigo = await acheTitulo("Fase 1 — Secar barriga");
    await db.milestones.update(antigo!.id!, { dateCompleted: "2026-06-01" });

    await seedPath();

    const novo = await acheTitulo("Fase 1 — Tirar a barriga");
    expect(novo).toBeDefined();
    expect(novo!.dateCompleted).toBe("2026-06-01");
    expect(novo!.id).toBe(antigo!.id);
    // Marco concluído não é reprogramado: a data dele já é história.
    expect(novo!.datePlanned).toBe("2026-05-13");
    // E não sobrou a linha antiga ao lado.
    expect((await titulos()).some((x) => x.includes("Secar barriga"))).toBe(false);
  });

  it("marco pendente do roadmap é reprogramado, porque o horizonte dele mudou", async () => {
    await bancoNaV6();
    await seedPath();

    const check = await acheTitulo("Check-in 18 meses");
    // Vinha do "Check-in 6 meses", datado de 2026-11-13. Manter aquela data
    // deixaria um cartão de 18 meses em cima do sexto mês.
    expect(check!.datePlanned).not.toBe("2026-11-13");
    expect(check!.datePlanned > "2027-06-01").toBe(true);
  });

  it("marco fora do roadmap mantém a data dela — reprogramar apagaria o atraso", async () => {
    await bancoNaV6();
    await seedPath();

    const whr = await acheTitulo("Re-avaliar relação cintura/quadril");
    expect(whr!.datePlanned).toBe("2026-08-13");
    // O texto, esse sim, é reescrito.
    expect(whr!.notes).toContain("0,87");
    expect(whr!.notes).not.toContain("quadril aumentar 1-2cm");
  });

  it("marco criado por ela com prefixo parecido mas categoria diferente sobrevive à migração", async () => {
    await bancoNaV6();
    // Ela poderia genuinamente criar um marco assim pela tela de Novo Marco —
    // mesmo começo de frase do marco de fertilidade que a v7 remove, mas sobre
    // outro assunto (categoria "medico"). Casar só por prefixo apagaria isso
    // em silêncio; a categoria precisa bater também.
    await db.milestones.add({
      datePlanned: "2026-06-01",
      title: "Conversa com endocrinologista sobre planejamento de exame de rotina",
      category: "medico",
    } as never);

    await seedPath();

    const dela = await acheTitulo("planejamento de exame de rotina");
    expect(dela).toBeDefined();
    expect(dela!.category).toBe("medico");
  });

  it("marco que ela apagou não volta do túmulo", async () => {
    const semNutri = MARCOS_V6.filter((m) => !m.title.includes("nutricionista"));
    await bancoNaV6(semNutri);
    await seedPath();

    expect((await titulos()).some((x) => x.includes("nutricionista"))).toBe(false);
  });

  it("marco de fertilidade que ela concluiu não é apagado — registro de coisa feita é dela", async () => {
    await bancoNaV6();
    const endo = await acheTitulo("endocrinologista");
    await db.milestones.update(endo!.id!, { dateCompleted: "2026-07-20" });

    await seedPath();

    const aindaLa = await acheTitulo("endocrinologista");
    expect(aindaLa?.dateCompleted).toBe("2026-07-20");
  });

  it("instalação nova já nasce na versão da migração, sem rodá-la", async () => {
    await seedPath();
    const v = await db.settings.get("milestoneSeedVersion");
    expect(v?.value).toBe(7);
    expect(await db.milestones.count()).toBe(TOTAL_DO_SEED);
  });
});

describe("migração do plano alimentar", () => {
  beforeEach(async () => {
    await db.mealPlans.clear();
    await db.settings.clear();
  });

  it("o déficit de 2.300 kcal alcança quem parou na versão anterior do plano", async () => {
    await db.mealPlans.add({ goal: "deficit", kcalDaily: 2200, proteinG: 160, slots: [] } as never);
    await db.settings.put({ key: "pathSeeded", value: true });
    await db.settings.put({ key: "mealPlanVersion", value: 7 });
    await db.settings.put({ key: "milestoneSeedVersion", value: 7 });

    await seedPath();

    const deficit = (await db.mealPlans.toArray()).find((p) => p.goal === "deficit");
    expect(deficit?.kcalDaily).toBe(2300);
  });
});
