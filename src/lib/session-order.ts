import type { WorkoutTemplate } from "./db";

type TplEx = WorkoutTemplate["exercises"][number];

/** Ordena os exercícios da sessão respeitando as âncoras. Aquecimento sempre
 *  abre e o cardio final sempre fecha, na ordem autorada; só os blocos do
 *  miolo (máquina e solo) trocam de lugar, para quando a academia está
 *  ocupada. */
export function ordenarPorBloco(exercises: TplEx[], soloPrimeiro: boolean): TplEx[] {
  const aquecimento = exercises.filter((e) => e.block === "aquecimento");
  const maquina = exercises.filter((e) => e.block === "maquina");
  const solo = exercises.filter((e) => e.block === "solo");
  const final = exercises.filter((e) => e.block === "final");
  const semBloco = exercises.filter((e) => !e.block);
  if (semBloco.length === exercises.length) return exercises; // template antigo, sem blocos
  const miolo = soloPrimeiro ? [...solo, ...maquina] : [...maquina, ...solo];
  return [...aquecimento, ...semBloco, ...miolo, ...final];
}
