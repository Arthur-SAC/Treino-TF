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
import { GuideAccordion, type GuideSection } from "../../components/GuideAccordion";

const BAND_LABEL: Record<string, string> = {
  essencial: "essencial",
  atleta: "faixa atleta",
  fitness: "faixa fitness",
  media: "faixa média",
  alta: "faixa alta",
};

const GUIDE_SILHUETA: GuideSection[] = [
  {
    id: "ler-whr",
    title: "Como ler o WHR e qual meta é realista",
    intro:
      "WHR é a razão cintura ÷ quadril. Quanto menor o número, mais afunilada (ampulheta) é a silhueta — porque a cintura é estreita em relação ao quadril.",
    tips: [
      "Faixas de referência femininas: ~0,80 ou menos lê como bem ampulheta; ~0,80–0,85 é uma silhueta feminina equilibrada; acima de ~0,85 a cintura está marcada demais em relação ao quadril.",
      "Sem TRH, o teto realista com treino fica em torno de 0,83–0,85: dá pra afinar a cintura e crescer o quadril, mas a redistribuição de gordura que deixa o WHR mais baixo depende de hormônio.",
      "Não é uma promessa nem um teto definitivo — é o que treino, dieta e transverso conseguem entregar agora. Com TRH ou cirurgia o horizonte muda. Veja a tela «Até onde dá pra chegar» no Treino.",
    ],
  },
  {
    id: "ombro-quadril",
    title: "Ombro ÷ quadril: por que importa",
    intro:
      "Essa razão compara a largura dos ombros com a do quadril. Abaixo de 1,0 significa que o quadril é igual ou mais largo que os ombros — e é isso que o olho lê como silhueta feminina.",
    tips: [
      "Treinar ombro pesado (desenvolvimento, elevações com carga alta) alarga a parte de cima e sobe a razão — o oposto do que você quer. Por isso o ombro entra leve, só pra postura.",
      "Crescer glúteo e quadril baixa a razão e é a alavanca a priorizar. A estrutura óssea do ombro não muda; o que dá pra mexer é o volume de quadril.",
    ],
  },
  {
    id: "bf-faixas",
    title: "Gordura corporal: faixas e o contexto sem TRH",
    intro:
      "A % de gordura é uma estimativa por circunferências (fórmula Navy: pescoço, cintura, quadril e altura) — não é exata, mas é consistente pra acompanhar tendência.",
    tips: [
      "Faixas femininas aproximadas: essencial ~10–13% (muito baixo), atleta ~14–20%, fitness ~21–24%, média ~25–31%, alta acima disso.",
      "Sem TRH, mesmo com uma % «ok», a gordura tende a se distribuir de forma androide — acumula mais na barriga e menos no quadril/coxa. Por isso uma cintura que sobe pesa mais na sua silhueta do que o número de %BF sugere.",
      "Use a tendência ao longo das semanas, não o valor de uma medida. A direção (descendo, estável, subindo) diz mais que o número absoluto.",
    ],
  },
  {
    id: "tempo",
    title: "Quanto tempo leva pra ver mudança",
    intro:
      "Composição corporal muda devagar. Ter expectativa realista evita desânimo num platô que é só ruído.",
    tips: [
      "Mudança visível de silhueta costuma levar de algumas semanas a alguns meses — não dias. Medidas a cada 2–4 semanas capturam isso melhor que se pesar/medir todo dia.",
      "Oscilações diárias de 1–2 cm na cintura ou de alguns centésimos no WHR são água, sono, sal e intestino — não ganho ou perda real.",
      "Só com treino e dieta, sem TRH, dá pra afinar cintura, crescer glúteo/quadril e baixar %BF. O que não dá pra forçar é a redistribuição hormonal de gordura — isso é o que TRH acrescenta por cima do seu trabalho.",
    ],
  },
];

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

      <GuideAccordion sections={GUIDE_SILHUETA} />

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
          <p className="text-muted text-xs">
            Menor = mais ampulheta. Sem TRH, o teto realista com treino fica perto de 0,83–0,85.
          </p>
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
          <p className="text-red-200/80 text-xs">
            Meta prática: tolere até ~1–1,5 cm de cintura no superávit <strong>se</strong> o quadril
            cresceu mais que isso no mesmo período — aí a silhueta ainda melhora. Se a cintura sobe
            sozinha (quadril parado), segure já.
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
