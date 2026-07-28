import type { WorkoutTemplate } from "./db";

type TplEx = WorkoutTemplate["exercises"][number];

/** Ordena os exercícios da sessão respeitando as âncoras. Aquecimento sempre
 *  abre e o cardio final sempre fecha, na ordem autorada; só os blocos do
 *  miolo (máquina e solo) trocam de lugar, para quando a academia está
 *  ocupada.
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
