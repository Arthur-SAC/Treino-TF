import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { PathTabs } from "../../components/PathTabs";
import { MilestoneCard } from "../../components/MilestoneCard";

export function MilestonesView() {
  const milestones = useLiveQuery(() => db.milestones.orderBy("datePlanned").toArray(), []);

  async function complete(id?: number) {
    if (id === undefined) return;
    const today = new Date().toISOString().slice(0, 10);
    await db.milestones.update(id, { dateCompleted: today });
  }

  async function remove(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar este marco?")) return;
    await db.milestones.delete(id);
  }

  const upcoming = milestones?.filter((m) => !m.dateCompleted) ?? [];
  const done = milestones?.filter((m) => m.dateCompleted) ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="font-serif text-2xl text-nude flex-1">Trilha</h1>
        <Link to="/trilha/marcos/novo" className="text-muted text-sm">+ novo</Link>
      </div>
      <PathTabs />

      <Link to="/trilha/evolucao" className="card block mb-4 hover:border-nude/40 transition">
        <h3 className="text-nude-warm font-medium">Evolução</h3>
        <p className="text-muted text-sm mt-1">Voz, movimento, skincare, treino, WHR e marcos num lugar só</p>
      </Link>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Próximos</h2>
      <div className="space-y-2 mb-4">
        {upcoming.map((m) => (
          <MilestoneCard
            key={m.id}
            milestone={m}
            onComplete={() => void complete(m.id)}
            onDelete={() => void remove(m.id)}
          />
        ))}
        {upcoming.length === 0 && (
          <p className="text-muted text-sm">Nenhum marco pendente.</p>
        )}
      </div>

      {done.length > 0 && (
        <>
          <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Concluídos</h2>
          <div className="space-y-2">
            {done.map((m) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                onDelete={() => void remove(m.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
