const MIN_HZ = 50;
const MAX_HZ = 500;
const MIN_RMS = 0.01;

/** Detecção de pitch por autocorrelação (cwilso PitchDetect). null em silêncio/fora de faixa. */
export function detectPitchHz(buffer: Float32Array, sampleRate: number): number | null {
  const SIZE = buffer.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < MIN_RMS) return null;

  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
  }
  const trimmed = buffer.slice(r1, r2);
  const n = trimmed.length;
  if (n < 2) return null;

  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i; j++) c[i] += trimmed[j] * trimmed[j + i];
  }

  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;

  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < n; i++) {
    if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  }
  let T0 = maxpos;
  if (T0 <= 0) return null;

  if (T0 > 0 && T0 < n - 1) {
    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a !== 0) T0 = T0 - b / (2 * a);
  }

  const freq = sampleRate / T0;
  if (freq < MIN_HZ || freq > MAX_HZ) return null;
  return freq;
}

export function classifyPitch(hz: number, lowHz: number, highHz: number): "grave" | "alvo" | "agudo" {
  if (hz < lowHz) return "grave";
  if (hz > highHz) return "agudo";
  return "alvo";
}

export function averagePitchHz(values: Array<number | null>): number | null {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}
