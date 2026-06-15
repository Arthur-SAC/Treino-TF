import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { BeautyTabs } from "../../components/BeautyTabs";
import { RoutineCard } from "../../components/RoutineCard";
import { GuideAccordion } from "../../components/GuideAccordion";
import type { GuideSection } from "../../components/GuideAccordion";

const FPS_GUIDE: GuideSection[] = [
  {
    id: "regra-de-ouro-fps",
    title: "A regra de ouro da pele",
    intro: "FPS diário é a base de tudo — anti-mancha, anti-envelhecimento, e parte ativa de qualquer tratamento.",
    tips: [
      "Protetor solar todo dia, mesmo sem sol, mesmo em casa — raios UVA atravessam vidro e nuvens e escurecem a pele o tempo todo",
      "Sem FPS qualquer clareamento volta: o ativo clareador desfaz à noite o que o sol refaz de dia",
      "Reaplica a cada ~3h se estiver exposta ao sol (rosto, pescoço, mãos) — a proteção se consome",
      "FPS 30+ no mínimo; FPS 60 é o ideal pra pele que está em tratamento de manchas",
      "Se sair de casa com maquiagem, use protetor em spray ou powder com FPS pra reaplicar sem estragar o make",
    ],
  },
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function SkincareHome() {
  const today = todayISO();
  const routines = useLiveQuery(() => db.skincareRoutines.orderBy("time").toArray(), []);
  const todayLogs = useLiveQuery(() => db.skincareLogs.where("date").equals(today).toArray(), [today]);

  const doneIds = new Set(todayLogs?.filter((l) => l.completed).map((l) => l.routineId) ?? []);

  async function toggle(routineId: number) {
    const existing = todayLogs?.find((l) => l.routineId === routineId);
    if (existing && existing.id !== undefined) {
      await db.skincareLogs.update(existing.id, { completed: !existing.completed });
    } else {
      await db.skincareLogs.add({ date: today, routineId, completed: true });
    }
  }

  const morning = routines?.filter((r) => r.time === "morning") ?? [];
  const evening = routines?.filter((r) => r.time === "evening") ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/beleza" className="text-muted text-sm">&larr; Beleza</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Skincare</h1>
        <Link to="/beleza/pele-cabelo/skincare/nova" className="text-muted text-sm">+ nova</Link>
      </div>
      <BeautyTabs />

      <GuideAccordion sections={FPS_GUIDE} className="mb-4 mt-2" />

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2 mt-2">Manhã</h2>
      <div className="space-y-2 mb-4">
        {morning.map((r) => (
          <RoutineCard
            key={r.id}
            routine={r}
            done={r.id !== undefined && doneIds.has(r.id)}
            onToggle={() => r.id !== undefined && void toggle(r.id)}
          />
        ))}
        {morning.length === 0 && <p className="text-muted text-sm">Nenhuma rotina matinal.</p>}
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Noite</h2>
      <div className="space-y-2">
        {evening.map((r) => (
          <RoutineCard
            key={r.id}
            routine={r}
            done={r.id !== undefined && doneIds.has(r.id)}
            onToggle={() => r.id !== undefined && void toggle(r.id)}
          />
        ))}
        {evening.length === 0 && <p className="text-muted text-sm">Nenhuma rotina noturna.</p>}
      </div>
    </div>
  );
}
