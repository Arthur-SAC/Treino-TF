import { Voltar } from "../../components/Voltar";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Measurement } from "../../lib/db";
import { MeasurementForm } from "../../components/MeasurementForm";
import { WhrChart } from "../../components/WhrChart";
import { MeasurementChart } from "../../components/MeasurementChart";
import { calculateWhr, classifyWhr } from "../../lib/waist-hip-ratio";
import { formatCm, formatDateBR } from "../../lib/format";
import { useSetting } from "../../hooks/useSetting";

const CATEGORY_LABEL: Record<ReturnType<typeof classifyWhr>, string> = {
  "ampulheta-forte": "Ampulheta forte",
  "ampulheta-moderada": "Ampulheta moderada",
  transicao: "Transição",
  "perfil-masculino": "Perfil reto",
};

export function Measurements() {
  const items = useLiveQuery(() => db.measurements.orderBy("date").reverse().toArray(), []);
  const [selectedMetric, setSelectedMetric] = useState<keyof Measurement>("waistCm");
  // O alvo é o mesmo da Silhueta (fim da fase 2), não o 0,68 antigo do gráfico.
  const targetWhr = useSetting("targetWhr");

  async function handleSave(m: Omit<Measurement, "id">) {
    await db.measurements.add(m as Measurement);
  }

  const chartData = items
    ?.filter((m) => m.waistCm && m.hipCm)
    .map((m) => ({ date: m.date, whr: calculateWhr(m.waistCm!, m.hipCm!) }))
    .reverse() // historicamente cronológico
    ?? [];

  const metricOptions: Array<{ key: keyof Measurement; label: string }> = [
    { key: "weightKg", label: "Peso" },
    { key: "waistCm", label: "Cintura" },
    { key: "hipCm", label: "Quadril" },
    { key: "chestCm", label: "Busto" },
    { key: "thighLeftCm", label: "Coxa E" },
    { key: "thighRightCm", label: "Coxa D" },
    { key: "shouldersCm", label: "Ombros" },
  ];

  const metricData = items
    ?.filter((m) => typeof m[selectedMetric] === "number")
    .map((m) => ({ date: m.date, value: m[selectedMetric] as number }))
    .reverse() ?? [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Voltar para="/corpo" rotulo="Corpo" />
        <h1 className="font-serif text-2xl text-nude flex-1">Medidas</h1>
      </div>

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Nova medida</h2>
        <MeasurementForm onSubmit={handleSave} />
      </div>

      {chartData.length > 0 && (
        <div className="card mb-4">
          <h2 className="text-nude-warm font-medium mb-2">Evolução cintura/quadril</h2>
          <WhrChart data={chartData} target={targetWhr} />
          <p className="text-muted text-xs mt-2">
            Linha caindo rumo ao alvo = silhueta mais ampulheta (cintura afinando e/ou quadril
            crescendo). Variação de poucos centésimos entre medidas é normal — água, intestino,
            sono, hora do dia. Olhe a tendência de várias semanas, não o ponto isolado.
          </p>
        </div>
      )}

      {metricData.length > 0 && (
        <div className="card mb-4">
          <h2 className="text-nude-warm font-medium mb-3">Evolução de uma medida</h2>
          <div className="overflow-x-auto sem-barra -mx-4 px-4 mb-3">
            <div className="flex gap-2 w-max">
              {metricOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedMetric(opt.key)}
                  className={`px-3 py-1.5 rounded-pill text-xs whitespace-nowrap ${
                    selectedMetric === opt.key ? "bg-wine-light text-nude-warm" : "bg-bg-deep text-muted border border-bg-border"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <MeasurementChart data={metricData} unit={selectedMetric === "weightKg" ? "kg" : "cm"} />
          <p className="text-muted text-xs mt-2">
            Leia pela direção, não pelo valor de um dia: quadril/coxa/glúteo subindo é ganho;
            cintura/pescoço/barriga descendo é afinamento. Pequenos sobe-e-desce entre medidas são
            retenção hídrica, não mudança real de corpo.
          </p>
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
                {m.weightKg !== undefined && <span>Peso: {m.weightKg.toLocaleString("pt-BR")} kg</span>}
                {m.neckCm !== undefined && <span>Pescoço: {formatCm(m.neckCm)}</span>}
                {m.waistCm !== undefined && <span>Cintura: {formatCm(m.waistCm)}</span>}
                {m.hipCm !== undefined && <span>Quadril: {formatCm(m.hipCm)}</span>}
                {m.shouldersCm !== undefined && <span>Ombros: {formatCm(m.shouldersCm)}</span>}
                {m.chestCm !== undefined && <span>Busto: {formatCm(m.chestCm)}</span>}
              </div>
              {/* A primeira medição desde o recomeço vira a partida: um erro de
                  digitação precisa ter como sair (revisão da entrega 2). */}
              <button
                type="button"
                aria-label={`Apagar medida de ${formatDateBR(new Date(m.date))}`}
                onClick={() => {
                  if (m.id !== undefined && window.confirm("Apagar esta medida? Não dá pra desfazer.")) {
                    void db.measurements.delete(m.id);
                  }
                }}
                className="text-muted text-xs underline mt-2"
              >
                Apagar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
