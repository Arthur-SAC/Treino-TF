import { useLiveQuery } from "dexie-react-hooks";
import { noitesNoAlvoRecentes } from "../lib/daily-log-helpers";

// Quantas das últimas 7 noites ela deitou até o alvo. Existe porque Hoje e
// Vitalidade mostram esse mesmo número: o alvo já era resolvido por
// `resolverAlvoSono` nas duas telas, mas a janela de 7 dias e a consulta ao
// `dailyLog` continuavam copiadas linha a linha. Duas cópias da mesma medida
// só ficam iguais até alguém mexer numa delas.
export function useStreakSono(alvo: string, hoje: string): number {
  return useLiveQuery(() => noitesNoAlvoRecentes(alvo, hoje), [alvo, hoje]) ?? 0;
}
