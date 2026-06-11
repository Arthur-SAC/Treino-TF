import type { Measurement } from "./db";

export type TrendDir = "down" | "stable" | "up";

export interface Trend {
  dir: TrendDir;
  deltaCm: number; // newest - oldest na janela
  points: number;
}

const STABLE_THRESHOLD_CM = 0.5;

function fieldTrend(measurements: Measurement[], field: "waistCm" | "hipCm", n: number): Trend {
  const withField = measurements.filter((mm) => typeof mm[field] === "number");
  const window = withField.slice(-n);
  if (window.length < 2) return { dir: "stable", deltaCm: 0, points: window.length };
  const oldest = window[0][field] as number;
  const newest = window[window.length - 1][field] as number;
  const deltaCm = Math.round((newest - oldest) * 10) / 10;
  let dir: TrendDir = "stable";
  if (deltaCm <= -STABLE_THRESHOLD_CM) dir = "down";
  else if (deltaCm >= STABLE_THRESHOLD_CM) dir = "up";
  return { dir, deltaCm, points: window.length };
}

export function waistTrend(measurements: Measurement[], n = 3): Trend {
  return fieldTrend(measurements, "waistCm", n);
}

export function hipTrend(measurements: Measurement[], n = 3): Trend {
  return fieldTrend(measurements, "hipCm", n);
}
