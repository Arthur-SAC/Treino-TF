import { useLiveQuery } from "dexie-react-hooks";
import { diasComGasto, inicioDoAcompanhamento } from "../lib/daily-log-helpers";
import { calcularStreak, type StreakVitalidade } from "../lib/vitalidade";

// O streak de dias sem gasto automático, montado num lugar só. Hoje e
// Vitalidade mostram o MESMO número — e cada uma tinha a própria cópia das
// duas consultas mais a chamada de `calcularStreak`, com comentários gêmeos.
// Um número que a usuária lê em duas telas não pode ter duas montagens: uma
// correção aplicada num lado e esquecida no outro faz o app se contradizer
// sobre o dado mais sensível desta frente.
export function useStreakVitalidade(hoje: string): StreakVitalidade {
  const inicio = useLiveQuery(() => inicioDoAcompanhamento(), []);
  const marcados = useLiveQuery(() => diasComGasto(), []);

  // `inicio` fica `undefined` enquanto a consulta carrega e `null` enquanto
  // ela ainda não aderiu ao protocolo. Nos dois casos o início é HOJE: o
  // streak nasce em "hoje é o primeiro dia limpo" em vez de contar para trás
  // um período que ninguém acompanhou.
  return calcularStreak(marcados ?? [], hoje, inicio ?? hoje);
}
