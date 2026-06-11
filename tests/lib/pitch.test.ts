import { describe, it, expect } from "vitest";
import { detectPitchHz, classifyPitch, averagePitchHz } from "../../src/lib/pitch";

function sine(freq: number, sampleRate: number, length: number, amp = 0.8): Float32Array {
  const b = new Float32Array(length);
  for (let i = 0; i < length; i++) b[i] = amp * Math.sin((2 * Math.PI * freq * i) / sampleRate);
  return b;
}

describe("detectPitchHz", () => {
  it("detecta 200 Hz numa onda senoidal", () => {
    const hz = detectPitchHz(sine(200, 44100, 2048), 44100);
    expect(hz).not.toBeNull();
    expect(Math.abs((hz as number) - 200)).toBeLessThan(5);
  });
  it("detecta 150 Hz", () => {
    const hz = detectPitchHz(sine(150, 44100, 2048), 44100);
    expect(Math.abs((hz as number) - 150)).toBeLessThan(5);
  });
  it("retorna null em silêncio", () => {
    expect(detectPitchHz(new Float32Array(2048), 44100)).toBeNull();
  });
});

describe("classifyPitch", () => {
  it.each<[number, string]>([
    [140, "grave"],
    [165, "alvo"],
    [190, "alvo"],
    [220, "alvo"],
    [240, "agudo"],
  ])("classifica %i como %s", (hz, label) => {
    expect(classifyPitch(hz, 165, 220)).toBe(label);
  });
});

describe("averagePitchHz", () => {
  it("ignora nulls e arredonda", () => {
    expect(averagePitchHz([180, null, 200, null, 190])).toBe(190);
  });
  it("null quando não há válidos", () => {
    expect(averagePitchHz([null, null])).toBeNull();
  });
});
