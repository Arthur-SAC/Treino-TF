import { useLiveQuery } from "dexie-react-hooks";
import { useSetting } from "./useSetting";
import { getLatestWaist, resolveGoal } from "../lib/meal-plan";

/** Meta nutricional que o app DE FATO concede hoje — ciclo ativo cruzado com a
 *  última cintura registrada. A hipertrofia pede superávit, mas só o recebe com
 *  a cintura abaixo do limiar; sem medição, fica em manutenção.
 *
 *  Toda tela que afirma algo sobre a meta ("ciclo em superávit", guarda de
 *  cintura, conselho de troca de ciclo) tem que ler daqui, e não de
 *  `CYCLE_TO_GOAL` — senão a Silhueta promete um superávit que o plano
 *  alimentar negou. Enquanto a medição carrega, devolve o caminho conservador. */
export function useResolvedGoal(): "deficit" | "manutencao" | "superavit" {
  const activeCycle = useSetting("activeCycle");
  const cintura = useLiveQuery(() => getLatestWaist(), []);
  return resolveGoal(activeCycle, cintura ?? null);
}
