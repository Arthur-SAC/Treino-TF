import type { Exercise, WorkoutSession, WorkoutTemplate } from "./db";
import {
  avaliarSeries,
  findLastPerformance,
  incrementoDoEquipamento,
  suggestNextLoad,
} from "./progression";

/**
 * A carga que ela usa na última sessão do ciclo já passou da que o app
 * sugeria? Verdadeiro só quando, em TODO exercício com carga registrada
 * naquela sessão, o maior peso usado ficou acima da sugestão que o app teria
 * mostrado (calculada com o histórico anterior à sessão, como o
 * SessionRecorder faz). Sem histórico anterior, a régua é a carga inicial do
 * exercício; sem ela, o exercício não conta como "passou". Exercícios sem
 * peso registrado (corpo, tempo) são ignorados; sem nenhum com peso, falso.
 */
export function cargaPassouDaSugestao(
  sessoes: readonly WorkoutSession[],
  exercicios: ReadonlyMap<string, Exercise>,
  templates: ReadonlyMap<string, WorkoutTemplate>,
  /** Quantas sessões o ciclo atual já tem; 0 = não há "última do ciclo". */
  sessoesNoCiclo: number,
): boolean {
  if (sessoesNoCiclo <= 0 || sessoes.length === 0) return false;
  const ordenadas = [...sessoes].sort(
    (a, b) => a.date.localeCompare(b.date) || (a.id ?? 0) - (b.id ?? 0),
  );
  const idx = ordenadas.length - 1;
  const ultima = ordenadas[idx];
  const anteriores = ordenadas.slice(0, idx).reverse(); // da mais recente pra mais antiga

  let comPeso = 0;
  for (const ex of ultima.exercises) {
    const usado = Math.max(0, ...ex.sets.map((s) => s.weight));
    if (usado <= 0) continue;
    comPeso++;
    const info = exercicios.get(ex.exerciseId);
    const anterior = findLastPerformance(anteriores, ex.exerciseId);
    let sugerida: number | null = null;
    if (!anterior) {
      sugerida = info?.startLoadKg ?? null;
    } else if (info && incrementoDoEquipamento(info.equipment) > 0) {
      const lastSet = anterior.sets[anterior.sets.length - 1];
      const tpl = anterior.templateId ? templates.get(anterior.templateId) : undefined;
      const alvo = tpl?.exercises.find((e) => e.exerciseId === ex.exerciseId)?.repsTarget ?? "";
      const { completou, topo } = avaliarSeries(anterior.sets, alvo);
      sugerida = suggestNextLoad({
        lastLoad: lastSet.weight,
        feedback: anterior.feedback,
        completedAllReps: completou,
        hitTopOfRange: topo,
        category: info.category,
        equipment: info.equipment,
        startLoadKg: info.startLoadKg,
      });
    }
    if (sugerida === null || usado <= sugerida) return false;
  }
  return comPeso > 0;
}
