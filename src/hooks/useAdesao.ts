import { useLiveQuery } from "dexie-react-hooks";
import { lerAdesao, type AdesaoDetalhada } from "../lib/adesao";

/** A adesão dos últimos `dias` dias, viva. `undefined` enquanto o banco não
 *  respondeu — quem mostra card espera, pra não piscar um veredito com zeros. */
export function useAdesao(hoje: string, dias: number, alvoSono: string): AdesaoDetalhada | undefined {
  return useLiveQuery(() => lerAdesao(hoje, dias, alvoSono), [hoje, dias, alvoSono]);
}
