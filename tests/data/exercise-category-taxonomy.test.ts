import { describe, it, expect } from "vitest";
import { EXERCISES } from "../../src/data/exercises-seed";
import { CATEGORIES } from "../../src/pages/workout/ExerciseLibrary";

// A Biblioteca (ExerciseLibrary) só filtra e rotula categorias que ela conhece.
// Um exercício com `category` fora desse conjunto não é código quebrado — ele
// simplesmente não aparece em nenhum filtro (só em "Todos") e mostra o texto
// cru na tela em vez de um rótulo em pt-BR. É a mesma classe de bug que este
// projeto já teve várias vezes: conteúdo que existe no catálogo e não chega
// até ela. Este teste trava a taxonomia contra o catálogo real.
describe("toda category do catálogo é navegável na Biblioteca", () => {
  it("nenhum exercício usa uma category fora do conjunto que a tela renderiza", () => {
    const foraDaTaxonomia = EXERCISES.filter((e) => !CATEGORIES.includes(e.category)).map(
      (e) => `${e.id}: ${e.category}`,
    );
    expect(foraDaTaxonomia).toEqual([]);
  });
});
