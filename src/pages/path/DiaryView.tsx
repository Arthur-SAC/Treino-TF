import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type DailyLog } from "../../lib/db";
import { PathTabs } from "../../components/PathTabs";
import { MoodPicker } from "../../components/MoodPicker";
import { formatDateBR } from "../../lib/format";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DiaryView() {
  const today = todayISO();
  const log = useLiveQuery(() => db.dailyLog.get(today), [today]);
  const recent = useLiveQuery(
    () => db.dailyLog.orderBy("date").reverse().limit(30).toArray(),
    [],
  );
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>();

  useEffect(() => {
    if (log) {
      setNotes(log.notes ?? "");
      setMood(log.mood);
    }
  }, [log]);

  async function save() {
    const existing = await db.dailyLog.get(today);
    if (existing) {
      await db.dailyLog.update(today, { mood, notes: notes.trim() || undefined });
    } else {
      await db.dailyLog.put({
        date: today,
        mood,
        notes: notes.trim() || undefined,
        activeBreakCount: 0,
        waterMl: 0,
      } as DailyLog);
    }
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="font-serif text-2xl text-nude mb-3">Trilha</h1>
      <PathTabs />

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Hoje · {formatDateBR(new Date())}</h2>
        <p className="text-muted text-xs uppercase tracking-wider mb-2">Humor</p>
        <MoodPicker value={mood} onChange={setMood} />
        <p className="text-muted text-xs uppercase tracking-wider mb-2 mt-4">Notas</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => void save()}
          rows={4}
          placeholder="Como foi o dia? Algo que aconteceu, sentimentos, dúvidas, conquistas..."
          className="w-full bg-bg-deep border border-bg-border rounded-md px-3 py-2 text-nude-warm text-sm"
        />
        <button
          type="button"
          onClick={() => void save()}
          className="w-full bg-wine-light text-nude-warm rounded-md py-2 text-sm mt-3"
        >
          Salvar
        </button>
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Últimos dias</h2>
      <div className="space-y-2">
        {recent?.filter((r) => r.mood || r.notes).map((r) => (
          <div key={r.date} className="card">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-nude-warm text-sm">{formatDateBR(new Date(r.date))}</span>
              {r.mood && (
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ["#3a1419", "#5c1a2b", "#8b3a4a", "#a87a6a", "#d4a373"][r.mood - 1] }} />
              )}
            </div>
            {r.notes && <p className="text-sm text-muted">{r.notes}</p>}
          </div>
        ))}
        {(!recent || recent.filter((r) => r.mood || r.notes).length === 0) && (
          <p className="text-muted text-sm text-center py-4">Sem registros ainda.</p>
        )}
      </div>
    </div>
  );
}
