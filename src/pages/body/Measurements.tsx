import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type Measurement } from "../../lib/db";
import { MeasurementForm } from "../../components/MeasurementForm";
import { WhrChart } from "../../components/WhrChart";
import { MeasurementChart } from "../../components/MeasurementChart";
import { calculateWhr, classifyWhr } from "../../lib/waist-hip-ratio";
import { formatCm, formatDateBR } from "../../lib/format";
import { GuideAccordion, type GuideSection } from "../../components/GuideAccordion";

const GUIDE_MEDICAO: GuideSection[] = [
  {
    id: "como-medir",
    title: "Como medir certo",
    intro:
      "Medir sempre do mesmo jeito é o que torna os dados comparáveis ao longo do tempo. Use uma fita métrica flexível e não elástica.",
    tips: [
      "Cintura: localize a linha natural — a parte mais estreita do tronco, geralmente acima do osso do quadril e abaixo das costelas. Fique em pé, expire normalmente e passe a fita justa, sem apertar nem folgar.",
      "Quadril: meça na parte mais larga do bumbum, com os pés unidos. A fita deve ficar paralela ao chão.",
      "Ombros: da ponta de um ombro à ponta do outro, passando pela parte mais larga das costas. Fique ereta, braços relaxados ao lado do corpo.",
      "Pescoço: logo abaixo do pomo de adão, no ponto mais estreito. Fita paralela ao chão, sem comprimir.",
      "Coxa: na parte mais grossa da coxa, geralmente no terço superior, logo abaixo da dobra glútea. Perna levemente afastada para a fita não comprimir.",
      "Braço: no bíceps relaxado, no ponto mais largo entre o ombro e o cotovelo.",
      "Frequência ideal: meça a cada 2 a 4 semanas, sempre no mesmo horário — de preferência pela manhã, em jejum, antes de treinar ou tomar muito líquido. Isso elimina variações naturais de retenção hídrica ao longo do dia.",
    ],
  },
];

const CATEGORY_LABEL: Record<ReturnType<typeof classifyWhr>, string> = {
  "ampulheta-forte": "Ampulheta forte",
  "ampulheta-moderada": "Ampulheta moderada",
  transicao: "Transição",
  "perfil-masculino": "Perfil masculino",
};

export function Measurements() {
  const items = useLiveQuery(() => db.measurements.orderBy("date").reverse().toArray(), []);
  const [selectedMetric, setSelectedMetric] = useState<keyof Measurement>("waistCm");

  async function handleSave(m: Omit<Measurement, "id">) {
    await db.measurements.add(m as Measurement);
  }

  const chartData = items
    ?.filter((m) => m.waistCm && m.hipCm)
    .map((m) => ({ date: m.date, whr: calculateWhr(m.waistCm!, m.hipCm!) }))
    .reverse() // historicamente cronológico
    ?? [];

  const metricOptions: Array<{ key: keyof Measurement; label: string }> = [
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
        <Link to="/corpo" className="text-muted text-sm">&larr; Corpo</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Medidas</h1>
      </div>

      <GuideAccordion sections={GUIDE_MEDICAO} className="mb-4" />

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Nova medida</h2>
        <MeasurementForm onSubmit={handleSave} />
      </div>

      {chartData.length > 0 && (
        <div className="card mb-4">
          <h2 className="text-nude-warm font-medium mb-2">Evolução cintura/quadril</h2>
          <WhrChart data={chartData} />
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
          <div className="overflow-x-auto -mx-4 px-4 mb-3">
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
          <MeasurementChart data={metricData} />
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
