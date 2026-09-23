// Resumo da semana pro Hoje (auditoria 2026-09-23: ela não tinha onde ver se
// estava progredindo — o peso nem aparecia em tela). Módulo puro.

/** Segunda-feira da semana de `hoje` ("YYYY-MM-DD"), em UTC puro. */
function segundaDaSemana(hoje: string): string {
  const d = new Date(`${hoje}T00:00:00Z`);
  const desdeSegunda = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - desdeSegunda);
  return d.toISOString().slice(0, 10);
}

/** Dias distintos com treino registrado de segunda até hoje. */
export function treinosNaSemana(datas: readonly string[], hoje: string): number {
  const inicio = segundaDaSemana(hoje);
  return new Set(datas.filter((d) => d >= inicio && d <= hoje)).size;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function variacaoDesdePartida(
  partida: { pesoKg: number; cinturaCm: number },
  ultima: { weightKg?: number; waistCm?: number },
): { pesoKg: number | null; cinturaCm: number | null } {
  return {
    pesoKg: typeof ultima.weightKg === "number" ? r1(ultima.weightKg - partida.pesoKg) : null,
    cinturaCm: typeof ultima.waistCm === "number" ? r1(ultima.waistCm - partida.cinturaCm) : null,
  };
}
