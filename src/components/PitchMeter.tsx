import { useEffect, useRef, useState } from "react";
import { detectPitchHz, classifyPitch } from "../lib/pitch";

interface Props {
  targetLowHz: number;
  targetHighHz: number;
}

export function PitchMeter({ targetLowHz, targetHighHz }: Props) {
  const [on, setOn] = useState(false);
  const [hz, setHz] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!on) return;
    let cancelled = false;
    const bufferLength = 2048;
    const data = new Float32Array(bufferLength);

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        ctxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = bufferLength;
        source.connect(analyser);
        const loop = () => {
          analyser.getFloatTimeDomainData(data);
          setHz(detectPitchHz(data, ctx.sampleRate));
          rafRef.current = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao acessar microfone");
        setOn(false);
      }
    }
    void start();

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      void ctxRef.current?.close();
      ctxRef.current = null;
      streamRef.current = null;
      setHz(null);
    };
  }, [on]);

  const label = hz !== null ? classifyPitch(hz, targetLowHz, targetHighHz) : null;

  return (
    <div>
      {error && <p className="text-red-300 text-sm mb-2">{error}</p>}
      <div className="flex items-center justify-between mb-2">
        <span className={`font-serif text-3xl tabular-nums ${label === "alvo" ? "text-nude" : "text-nude-warm"}`}>
          {hz !== null ? `${Math.round(hz)} Hz` : "— Hz"}
        </span>
        {label && (
          <span className={`text-xs uppercase tracking-wider ${label === "alvo" ? "text-nude" : "text-muted"}`}>
            {label}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`w-full rounded-md py-2 text-sm ${on ? "bg-red-900/40 border border-red-900 text-red-200" : "bg-bg-deep border border-bg-border text-muted"}`}
      >
        {on ? "■ Parar microfone" : "● Ligar microfone"}
      </button>
    </div>
  );
}
