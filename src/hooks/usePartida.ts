import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { useSetting } from "./useSetting";
import { partidaPlausivel, type Partida, type Projecao } from "../lib/partida";
import { MEDIDAS_PARTIDA } from "../lib/objetivo";

/** A partida dela lida do banco (primeira medição válida desde o recomeço) e a
 *  projeção da fase 1. A altura não muda: sem o setting, usa a da medição de
 *  maio. `carregando` existe pra o Hoje não piscar o pedido de medição antes
 *  do banco responder. */
export function usePartida(): { partida: Partida | null; projecao: Projecao | null; invalida: boolean; carregando: boolean } {
  const medidas = useLiveQuery(() => db.measurements.toArray(), []);
  const alturaSetting = useSetting("heightCm");
  if (medidas === undefined) return { partida: null, projecao: null, invalida: false, carregando: true };
  const altura = alturaSetting > 0 ? alturaSetting : Math.round(MEDIDAS_PARTIDA.alturaM * 100);
  const { resultado, invalida } = partidaPlausivel(medidas, altura);
  return { partida: resultado?.partida ?? null, projecao: resultado, invalida, carregando: false };
}
