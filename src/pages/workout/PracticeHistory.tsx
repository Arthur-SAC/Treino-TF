import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../lib/db";
import { formatDateBR } from "../../lib/format";

export function PracticeHistory() {
  const logs = useLiveQuery(() => db.practiceLogs.orderBy("date").reverse().toArray(), []);
  const sequences = useLiveQuery(() => db.danceSequences.toArray(), []);

  const seqMap = new Map(sequences?.map((s) => [s.id, s]) ?? []);

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/treino/movimento" className="text-muted text-sm">&larr; Movimento</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Histórico</h1>
      </div>

      <div className="space-y-2">
        {logs?.map((log) => {
          const seq = seqMap.get(log.sequenceId);
          return (
            <div key={log.id} className="card">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-nude-warm">{seq?.name ?? log.sequenceId}</span>
                <span className="text-muted text-xs">{formatDateBR(new Date(log.date))}</span>
              </div>
              <p className="text-muted text-xs">{log.durationMin} min</p>
              {log.notes && <p className="text-muted text-sm mt-1">{log.notes}</p>}
            </div>
          );
        })}
        {logs?.length === 0 && (
          <p className="text-muted text-sm text-center py-4">Sem práticas registradas.</p>
        )}
      </div>
    </div>
  );
}
