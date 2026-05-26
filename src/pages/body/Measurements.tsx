import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Measurement } from "../../lib/db";
import { MeasurementForm } from "../../components/MeasurementForm";
import { WhrChart } from "../../components/WhrChart";
import { calculateWhr, classifyWhr } from "../../lib/waist-hip-ratio";
import { formatCm, formatDateBR } from "../../lib/format";

const CATEGORY_LABEL: Record<ReturnType<typeof classifyWhr>, string> = {
  "ampulheta-forte": "Ampulheta forte",
  "ampulheta-moderada": "Ampulheta moderada",
  transicao: "Transição",
  "perfil-masculino": "Perfil masculino",
};

export function Measurements() {
  const items = useLiveQuery(() => db.measurements.orderBy("date").reverse().toArray(), []);

  async function handleSave(m: Omit<Measurement, "id">) {
    await db.measurements.add(m as Measurement);
  }

  const chartData = items
    ?.filter((m) => m.waistCm && m.hipCm)
    .map((m) => ({ date: m.date, whr: calculateWhr(m.waistCm!, m.hipCm!) }))
    .reverse() // historicamente cronológico
    ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/corpo" className="text-muted text-sm">&larr; Corpo</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Medidas</h1>
      </div>

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Nova medida</h2>
        <MeasurementForm onSubmit={handleSave} />
      </div>

      {chartData.length > 0 && (
        <div className="card mb-4">
          <h2 className="text-nude-warm font-medium mb-2">Evolução cintura/quadril</h2>
          <WhrChart data={chartData} />
        </div>
      )}

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Histórico</h2>
      {!items?.length && (
        <p className="text-muted text-sm py-4 text-center">Sem medidas ainda. Adicione a primeira acima.</p>
      )}
      <div className="space-y-2">
        {items?.map((m) => {
          const whr = m.waistCm && m.hipCm ? calculateWhr(m.waistCm, m.hipCm) : null;
          return (
            <div key={m.id} className="card">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-nude-warm">{formatDateBR(new Date(m.date))}</span>
                {whr !== null && (
                  <span className="text-muted text-xs">WHR {whr.toFixed(2)} · {CATEGORY_LABEL[classifyWhr(whr)]}</span>
                )}
              </div>
              <div className="text-sm text-muted grid grid-cols-2 gap-x-3">
                {m.waistCm !== undefined && <span>Cintura: {formatCm(m.waistCm)}</span>}
                {m.hipCm !== undefined && <span>Quadril: {formatCm(m.hipCm)}</span>}
                {m.shouldersCm !== undefined && <span>Ombros: {formatCm(m.shouldersCm)}</span>}
                {m.chestCm !== undefined && <span>Busto: {formatCm(m.chestCm)}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
