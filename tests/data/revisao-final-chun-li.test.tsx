import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ALL_MEAL_PLANS } from "../../src/data/meal-plan-seed";
import { WORKOUT_PLAN } from "../../src/data/workout-plan-seed";
import { CYCLE_TEMPLATES, CYCLES } from "../../src/data/cycles-seed";
import { EXERCISES } from "../../src/data/exercises-seed";
import { CATEGORIES } from "../../src/pages/workout/ExerciseLibrary";
import { ExerciseCard } from "../../src/components/ExerciseCard";
import { buildDayRoutine } from "../../src/lib/today-routine";
import type { WorkoutTemplate } from "../../src/lib/db";

// Achados da revisão final da entrega 1 (2026-09-23). Cada bloco reproduz um
// efeito que ela veria na tela.

describe("os macros declarados de cada plano são os da comida de verdade", () => {
  // MealPlanView mostra proteinG/carbG/fatG no topo e diet-export manda os
  // mesmos números pra quem for ler a dieta. Na troca pra 2.750/2.950 o
  // kcalDaily mudou e os macros ficaram os de 3.000/3.300.
  it("proteína, carbo e gordura batem com a soma da variante 0 (±2 g), em todo plano", () => {
    const divergentes = ALL_MEAL_PLANS.flatMap((p) => {
      const foods = p.slots.flatMap((s) => s.variants[0].foods);
      const soma = (k: "proteinG" | "carbG" | "fatG") => foods.reduce((a, f) => a + (f[k] ?? 0), 0);
      return (["proteinG", "carbG", "fatG"] as const)
        .filter((k) => Math.abs((p[k] ?? 0) - soma(k)) > 2)
        .map((k) => `${p.name}: ${k} declara ${p[k]}, comida soma ${soma(k)}`);
    });
    expect(divergentes).toEqual([]);
  });
});

describe("posterior pela flexora, não pela dobradiça", () => {
  // Spec 2.3: "maioria flexora; stiff/good-morning limitados (não encher a
  // dobra infraglútea)" — é o que mantém o glúteo destacado da coxa.
  // O swing fica de fora: é dobradiça explosiva, sem o alongamento carregado
  // do posterior que o stiff tem — é esse alongamento que enche a dobra.
  const DOBRADICAS = ["stiff", "stiff-unilateral", "good-morning"];
  const series = (ts: WorkoutTemplate[], ids: string[]) =>
    ts.flatMap((t) => t.exercises).filter((e) => ids.includes(e.exerciseId)).reduce((a, e) => a + e.sets, 0);

  it.each([
    ["adaptação", WORKOUT_PLAN],
    ["variação", CYCLE_TEMPLATES.filter((t) => t.cycle === "variacao")],
  ])("na %s a flexora tem mais séries que as dobradiças juntas", (_, ts) => {
    expect(series(ts as WorkoutTemplate[], ["flexora-em-pe"])).toBeGreaterThan(series(ts as WorkoutTemplate[], DOBRADICAS));
  });
});

describe("toda categoria tem rótulo no cartão da Biblioteca", () => {
  it("o cartão mostra o nome em pt-BR, nunca a chave crua", () => {
    for (const c of CATEGORIES) {
      const ex = EXERCISES.find((e) => e.category === c);
      if (!ex) continue;
      const { unmount } = render(<MemoryRouter><ExerciseCard ex={ex} /></MemoryRouter>);
      expect({ c, cru: screen.queryByText(c) !== null }).toEqual({ c, cru: false });
      unmount();
    }
  });
});

describe("a copy não mente sobre o dia dela", () => {
  it("o domingo não diz que o passeio é quase todo o movimento — agora há os 5 km", () => {
    const caes = buildDayRoutine(0, 1).blocks.flatMap((b) => b.items).find((i) => i.id === "caes-fds")!;
    expect(caes.subtitle ?? "").not.toMatch(/quase todo/i);
  });

  it("a melancia do lanche não amarra a hora à caminhada (no fim de semana ela é de manhã)", () => {
    const lanche = ALL_MEAL_PLANS[0].slots.find((s) => s.mealType === "lanche")!;
    const melancia = lanche.variants.flatMap((v) => v.foods).find((f) => /melancia/i.test(f.name))!;
    expect(melancia.preparation).not.toMatch(/antes da caminhada/i);
  });

  it("a descrição dos ciclos da fase 1 fala do programa novo (coxa e braço), não só de glúteo", () => {
    for (const id of ["adaptacao", "variacao"]) {
      const d = CYCLES.find((c) => c.id === id)!.description;
      expect({ id, coxa: /coxa/i.test(d), braco: /bra[çc]o/i.test(d) }).toEqual({ id, coxa: true, braco: true });
    }
  });
});
