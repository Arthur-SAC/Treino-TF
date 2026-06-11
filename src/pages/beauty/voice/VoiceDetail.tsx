import { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db, type VoicePracticeLog, type VoiceRecording } from "../../../lib/db";
import { useSetting } from "../../../hooks/useSetting";
import { analyzeRecordingPitch } from "../../../lib/pitch-audio";
import { PitchMeter } from "../../../components/PitchMeter";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatSec(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

export function VoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const targetLow = useSetting("voicePitchTargetLowHz");
  const targetHigh = useSetting("voicePitchTargetHighHz");
  const exercise = useLiveQuery(
    async () => (id ? await db.voiceExercises.get(id) : undefined),
    [id],
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const [stepRemaining, setStepRemaining] = useState(0);
  const [stepRunning, setStepRunning] = useState(false);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [recording, setRecording] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recStartRef = useRef<number>(0);

  useEffect(() => {
    if (exercise) setStepRemaining(exercise.steps[0]?.durationSec ?? 0);
  }, [exercise]);

  useEffect(() => {
    if (!stepRunning || !exercise) return;
    stepTimerRef.current = setInterval(() => {
      setStepRemaining((r) => {
        if (r <= 1) {
          if (stepTimerRef.current) clearInterval(stepTimerRef.current);
          setStepRunning(false);
          if (navigator.vibrate) navigator.vibrate(200);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [stepRunning, exercise]);

  if (!exercise) return <div className="p-4 text-muted text-sm">Carregando…</div>;

  function nextStep() {
    if (!exercise) return;
    if (activeIdx < exercise.steps.length - 1) {
      setActiveIdx((i) => i + 1);
      setStepRemaining(exercise.steps[activeIdx + 1].durationSec);
      setStepRunning(false);
    }
  }
  function prevStep() {
    if (activeIdx > 0 && exercise) {
      setActiveIdx((i) => i - 1);
      setStepRemaining(exercise.steps[activeIdx - 1].durationSec);
      setStepRunning(false);
    }
  }

  async function startRecording() {
    setRecError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const duration = Math.round((Date.now() - recStartRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (!exercise) return;
        const avgPitchHz = await analyzeRecordingPitch(blob);
        await db.voiceRecordings.add({
          date: todayISO(),
          blob,
          durationSec: duration,
          exerciseId: exercise.id,
          avgPitchHz: avgPitchHz ?? undefined,
        } as VoiceRecording);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      recStartRef.current = Date.now();
      setRecording(true);
    } catch (e) {
      setRecError(e instanceof Error ? e.message : "Erro ao acessar microfone");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function finish() {
    if (!exercise) return;
    await db.voicePracticeLogs.add({
      date: todayISO(),
      exerciseId: exercise.id,
      completed: true,
      durationMin: exercise.durationMin,
    } as VoicePracticeLog);
    navigate("/beleza/voz", { replace: true });
  }

  const allDone = activeIdx >= exercise.steps.length - 1 && stepRemaining === 0;

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza/voz" className="text-muted text-sm">&larr; Voz</Link>
      </div>
      <h1 className="font-serif text-2xl text-nude mb-1">{exercise.name}</h1>
      <p className="text-muted text-sm mb-4">{exercise.focus}</p>

      <div className="card mb-3 !bg-wine/20 !border-wine-light">
        <p className="text-sm text-nude-warm">{exercise.description}</p>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="text-muted text-xs uppercase tracking-wider">
          Passo {activeIdx + 1} de {exercise.steps.length}
        </span>
        <span className="text-muted text-xs">{Math.round(((activeIdx + 1) / exercise.steps.length) * 100)}%</span>
      </div>
      <div className="h-1.5 bg-bg-deep rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-nude" style={{ width: `${((activeIdx + 1) / exercise.steps.length) * 100}%` }} />
      </div>

      <div className="card mb-3 border-nude">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="text-nude-warm font-medium">Instrução</h3>
          <span className="text-nude text-2xl font-serif tabular-nums">{formatSec(stepRemaining)}</span>
        </div>
        <p className="text-sm mb-3">{exercise.steps[activeIdx]?.instruction}</p>
        {exercise.steps[activeIdx]?.repeat && (
          <p className="text-muted text-xs mb-3">Repetir {exercise.steps[activeIdx].repeat}x</p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStepRunning((v) => !v)}
            className="flex-1 bg-wine-light text-nude-warm rounded-md py-1.5 text-sm"
          >
            {stepRunning ? "Pausar" : stepRemaining === 0 ? "Pronto" : "Iniciar"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (exercise) setStepRemaining(exercise.steps[activeIdx].durationSec);
              setStepRunning(false);
            }}
            className="px-3 bg-bg-deep border border-bg-border text-muted rounded-md text-sm"
          >
            ↻
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={activeIdx === 0}
          className="flex-1 bg-bg-deep border border-bg-border text-muted rounded-md py-2 text-sm disabled:opacity-30"
        >
          ← anterior
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={activeIdx >= exercise.steps.length - 1}
          className="flex-1 bg-bg-deep border border-bg-border text-muted rounded-md py-2 text-sm disabled:opacity-30"
        >
          próximo →
        </button>
      </div>

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Pitch ao vivo</h2>
        <p className="text-muted text-xs mb-3">
          Meta: {targetLow}-{targetHigh} Hz. Ligue o microfone e veja sua frequência em tempo real.
        </p>
        <PitchMeter targetLowHz={targetLow} targetHighHz={targetHigh} />
      </div>

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-2">Gravar pra comparar evolução</h2>
        <p className="text-muted text-xs mb-3">
          30-60s da sua voz neste exercício. Compare gravações ao longo do tempo pra ouvir evolução real.
        </p>
        {recError && <p className="text-red-300 text-sm mb-2">{recError}</p>}
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`w-full rounded-md py-2 text-sm ${
            recording ? "bg-red-900/40 border border-red-900 text-red-200" : "bg-bg-deep border border-bg-border text-muted"
          }`}
        >
          {recording ? "■ Parar gravação" : "● Gravar voz"}
        </button>
      </div>

      {allDone && (
        <button
          type="button"
          onClick={() => void finish()}
          className="w-full bg-wine-light text-nude-warm rounded-md py-3 font-medium"
        >
          Marcar como feito
        </button>
      )}
    </div>
  );
}
