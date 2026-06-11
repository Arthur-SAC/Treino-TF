import { detectPitchHz, averagePitchHz } from "./pitch";

/** Estima o pitch médio de uma gravação. Browser-only; retorna null se decode falhar. */
export async function analyzeRecordingPitch(blob: Blob): Promise<number | null> {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const arrayBuffer = await blob.arrayBuffer();
    const audio = await ctx.decodeAudioData(arrayBuffer);
    const channel = audio.getChannelData(0);
    const sampleRate = audio.sampleRate;
    const win = 2048;
    const hop = 1024;
    const pitches: Array<number | null> = [];
    for (let i = 0; i + win <= channel.length; i += hop) {
      pitches.push(detectPitchHz(channel.slice(i, i + win), sampleRate));
    }
    await ctx.close();
    return averagePitchHz(pitches);
  } catch {
    return null;
  }
}
