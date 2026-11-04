import type { WorkoutTemplate } from "./db";
import type { ModoCaminhada } from "./objetivo";

type TplEx = WorkoutTemplate["exercises"][number];

/** Ordena os exercícios da sessão respeitando as âncoras. O aquecimento sempre
 *  abre e o bloco `final` sempre fecha, na ordem autorada; só os blocos do
 *  miolo (máquina e solo) trocam de lugar, para quando a academia está
 *  ocupada. O `final` hoje é o cardio leve pós-treino da fase 1 (2026-11-04).
 *
 *  A ordem PADRÃO do miolo (soloPrimeiro = false) não é fixa — ela segue a
 *  ordem em que os blocos aparecem no array autorado (o bloco cujo primeiro
 *  exercício vem antes, sai primeiro). `soloPrimeiro = true` inverte essa
 *  ordem natural. Assim quem autora o template escolhe a ordem padrão só
 *  escrevendo os exercícios na ordem certa, sem precisar máquina-antes-de-solo
 *  como convenção fixa. */
export function ordenarPorBloco(exercises: TplEx[], soloPrimeiro: boolean): TplEx[] {
  const aquecimento = exercises.filter((e) => e.block === "aquecimento");
  const maquina = exercises.filter((e) => e.block === "maquina");
  const solo = exercises.filter((e) => e.block === "solo");
  const final = exercises.filter((e) => e.block === "final");
  const semBloco = exercises.filter((e) => !e.block);
  if (semBloco.length === exercises.length) return exercises; // template antigo, sem blocos

  const primeiroIndiceMaquina = exercises.findIndex((e) => e.block === "maquina");
  const primeiroIndiceSolo = exercises.findIndex((e) => e.block === "solo");
  const maquinaPrimeiroNaAutoria =
    primeiroIndiceSolo < 0 || (primeiroIndiceMaquina >= 0 && primeiroIndiceMaquina < primeiroIndiceSolo);
  const maquinaPrimeiro = soloPrimeiro ? !maquinaPrimeiroNaAutoria : maquinaPrimeiroNaAutoria;

  const miolo = maquinaPrimeiro ? [...maquina, ...solo] : [...solo, ...maquina];
  return [...aquecimento, ...semBloco, ...miolo, ...final];
}

export const CARDIO_POS_TREINO = "cardio-pos-treino";

/** No modo esteira a esteira de 1 h logo depois da força já é o cardio do dia;
 *  somar mais 15-20 min seria passar de 1h20 de esteira. */
export function semCardioPosTreinoNaEsteira(exercises: TplEx[], modo: ModoCaminhada): TplEx[] {
  return modo === "esteira" ? exercises.filter((e) => e.exerciseId !== CARDIO_POS_TREINO) : exercises;
}
