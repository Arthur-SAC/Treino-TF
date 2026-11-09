// Sequência de dias úteis com treino. Pura: sem db, sem Date "de agora".
// Dia útil = segunda a sexta; feriado conta como dia útil (pedido dela).

export interface EstadoSequencia {
  /** Dias úteis seguidos com treino, terminando no último dia útil ≤ hoje. */
  atual: number;
  /** ISO do 1º dia útil perdido da última quebra (≥ desde, < hoje). */
  quebra: string | null;
  /** Sequência que existia logo antes dessa quebra. */
  anterior: number;
  /** Quantos dias úteis seguidos foram perdidos nessa quebra. */
  diasPerdidos: number;
}

const DIA_MS = 86_400_000;

function paraMs(iso: string): number {
  const [a, m, d] = iso.split("-").map(Number);
  return Date.UTC(a, m - 1, d);
}

function paraISO(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

export function estadoSequencia(
  datasComTreino: readonly string[],
  desde: string,
  hoje: string,
): EstadoSequencia {
  if (!desde || !hoje) return { atual: 0, quebra: null, anterior: 0, diasPerdidos: 0 };

  const treinos = new Set(datasComTreino);
  const fim = paraMs(hoje);
  let atual = 0;
  let quebra: string | null = null;
  let anterior = 0;
  let diasPerdidos = 0;
  let perdendo = false;

  for (let ms = paraMs(desde); ms <= fim; ms += DIA_MS) {
    const dow = new Date(ms).getUTCDay();
    if (dow === 0 || dow === 6) continue;
    const iso = paraISO(ms);
    if (treinos.has(iso)) {
      atual++;
      perdendo = false;
    } else if (ms === fim) {
      // hoje ainda sem treino: pendente, não quebra
    } else if (perdendo) {
      diasPerdidos++;
    } else {
      perdendo = true;
      quebra = iso;
      anterior = atual;
      diasPerdidos = 1;
      atual = 0;
    }
  }
  return { atual, quebra, anterior, diasPerdidos };
}

export function deveMostrarQueda(e: EstadoSequencia, quedaVistaEm: string): boolean {
  return e.quebra !== null && e.anterior >= 1 && e.quebra !== quedaVistaEm;
}
