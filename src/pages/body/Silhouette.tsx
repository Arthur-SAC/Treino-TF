import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { useSetting } from "../../hooks/useSetting";
import { calculateWhr } from "../../lib/waist-hip-ratio";
import { CYCLE_TO_GOAL } from "../../data/cycles-seed";
import { estimateBodyFatNavy, classifyBodyFat } from "../../lib/body-composition";
import {
  shoulderHipRatio,
  whrGap,
  shoulderHipGap,
  leverGuidance,
  waistGuard,
} from "../../lib/silhouette";

const BAND_LABEL: Record<string, string> = {
  essencial: "essencial",
  atleta: "faixa atleta",
  fitness: "faixa fitness",
  media: "faixa média",
  alta: "faixa alta",
};

export function Silhouette() {
  const measurements = useLiveQuery(() => db.measurements.orderBy("date").toArray(), []);
  const heightCm = useSetting("heightCm");
  const targetWhr = useSetting("targetWhr");
  const targetShr = useSetting("targetShoulderHipRatio");
  const activeCycle = useSetting("activeCycle");

  if (!measurements) {
    return <div className="p-4 pb-24 text-muted">Carregando…</div>;
  }

  const latest = measurements.at(-1);
  const prev = measurements.at(-2);
  const goal = CYCLE_TO_GOAL[activeCycle];
  const lever = leverGuidance(goal);

  const whr =
    latest?.waistCm && latest?.hipCm ? calculateWhr(latest.waistCm, latest.hipCm) : null;
  const whrG =
    whr !== null && latest?.waistCm && latest?.hipCm
      ? whrGap(whr, targetWhr, latest.waistCm, latest.hipCm)
      : null;

  const shr =
    latest?.shouldersCm && latest?.hipCm
      ? shoulderHipRatio(latest.shouldersCm, latest.hipCm)
      : null;
  const shrG =
    shr !== null && latest?.shouldersCm && latest?.hipCm
      ? shoulderHipGap(shr, targetShr, latest.shouldersCm, latest.hipCm)
      : null;

  const bf = latest
    ? estimateBodyFatNavy({
        heightCm,
        neckCm: latest.neckCm,
        waistCm: latest.waistCm,
        hipCm: latest.hipCm,
      })
    : null;

  const guard =
    goal === "superavit" && latest?.waistCm && prev?.waistCm
      ? waistGuard({ cycleGoal: goal, waistStartCm: prev.waistCm, waistNowCm: latest.waistCm })
      : { triggered: false, deltaCm: 0 };

  return (
    <div className="p-4 pb-24 space-y-3">
      <div className="flex items-center gap-3">
        <Link to="/corpo" className="text-muted text-sm">&larr; Corpo</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Silhueta</h1>
      </div>

      {!latest && (
        <div className="card">
          <p className="text-nude-warm text-sm">
            Registre uma medida (cintura, quadril, ombro, pescoço) pra ver sua estratégia de
            ampulheta.
          </p>
          <Link to="/corpo/medidas" className="text-nude text-sm underline">Ir pra Medidas</Link>
        </div>
      )}

      {/* Alavanca do ciclo */}
      <div className="card space-y-1">
        <h2 className="text-nude-warm font-medium">Alavanca do momento</h2>
        <p className="text-nude text-sm font-medium capitalize">Foco: {lever.focus}</p>
        <p className="text-muted text-sm">{lever.why}</p>
      </div>

      {/* WHR */}
      {whr !== null && (
        <div className="card space-y-1">
          <h2 className="text-nude-warm font-medium">Cintura / Quadril (WHR)</h2>
          <p className="text-nude text-lg">
            WHR {whr.toFixed(2)} <span className="text-muted text-sm">· alvo {targetWhr.toFixed(2)}</span>
          </p>
          {whrG && (whrG.waistDeltaCm > 0 || whrG.hipDeltaCm > 0) ? (
            <p className="text-muted text-sm">
              Pra chegar no alvo: −{whrG.waistDeltaCm} cm de cintura <strong>ou</strong> +
              {whrG.hipDeltaCm} cm de quadril.
            </p>
          ) : (
            <p className="text-nude text-sm">No alvo. ✓</p>
          )}
        </div>
      )}

      {/* Ombro / Quadril */}
      {shr !== null && (
        <div className="card space-y-1">
          <h2 className="text-nude-warm font-medium">Ombro / Quadril</h2>
          <p className="text-nude text-lg">
            {shr.toFixed(2)} <span className="text-muted text-sm">· alvo {targetShr.toFixed(2)}</span>
          </p>
          {shrG && shrG.hipDeltaCm > 0 ? (
            <p className="text-muted text-sm">
              Pra silhueta mais feminina: +{shrG.hipDeltaCm} cm de quadril (não treine ombro pesado).
            </p>
          ) : (
            <p className="text-nude text-sm">Ombro não passa do quadril. ✓</p>
          )}
        </div>
      )}

      {/* %BF */}
      {bf !== null ? (
        <div className="card space-y-1">
          <h2 className="text-nude-warm font-medium">Gordura corporal estimada</h2>
          <p className="text-nude text-lg">~{bf}% <span className="text-muted text-sm">· {BAND_LABEL[classifyBodyFat(bf)]}</span></p>
          <p className="text-muted text-xs">Estimativa por fita (Navy): pescoço + cintura + quadril + altura. Use a tendência, não o número absoluto.</p>
        </div>
      ) : (
        heightCm === 0 && (
          <div className="card">
            <p className="text-muted text-sm">
              Informe sua altura nas <Link to="/configuracoes" className="text-nude underline">Configurações</Link> pra estimar a gordura corporal.
            </p>
          </div>
        )
      )}

      {/* Trava de cintura */}
      {guard.triggered && (
        <div className="card border-red-900 bg-red-900/20 space-y-1">
          <h2 className="text-red-200 font-medium">Trava de cintura</h2>
          <p className="text-red-200 text-sm">
            Sua cintura subiu {guard.deltaCm} cm desde a última medida durante o superávit. Sem
            TRH, isso é gordura na barriga. Considere segurar o superávit ou voltar à manutenção.
          </p>
        </div>
      )}

      {/* Educativo */}
      <div className="card space-y-1">
        <h2 className="text-nude-warm font-medium">Por que treinar transverso, não oblíquo</h2>
        <p className="text-muted text-sm">
          Oblíquo com carga engrossa a cintura. O transverso (vacuum) age como um cinto interno
          que afina por dentro. Por isso o treino tem vacuum e pranchas, mas zero rotação ou
          flexão lateral com peso.
        </p>
      </div>
    </div>
  );
}
