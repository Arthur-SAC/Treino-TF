import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { useSetting } from "../../hooks/useSetting";
import { calculateWhr } from "../../lib/waist-hip-ratio";
import { useResolvedGoal } from "../../hooks/useResolvedGoal";
import { CINTURA_LIBERA_SUPERAVIT_CM } from "../../lib/meal-plan";
import { estimateBodyFatNavy, classifyBodyFat } from "../../lib/body-composition";
import {
  shoulderHipRatio,
  whrGap,
  leverGuidance,
  waistGuard,
} from "../../lib/silhouette";
import { FASES } from "../../lib/objetivo";
import { GuideAccordion, type GuideSection } from "../../components/GuideAccordion";

const BAND_LABEL: Record<string, string> = {
  essencial: "essencial",
  atleta: "faixa atleta",
  fitness: "faixa fitness",
  media: "faixa média",
  alta: "faixa alta",
};

// O quadril de destino é lido do módulo, não redigitado: esta tela AFIRMA um
// número que outra tela também afirma, e as duas precisam mudar juntas.
const FASE_2 = FASES.find((f) => f.id === "fase-2")!;

// Fronteira conservadora de "faixa feminina" para ombro÷quadril: homem cis
// típico fica entre 1,15 e 1,25 (ver objetivo.ts). 1,10 deixa margem para não
// declarar feminina uma razão que já está subindo em direção à faixa masculina.
const SHR_FAIXA_FEMININA = 1.1;

const GUIDE_SILHUETA: GuideSection[] = [
  {
    id: "ler-whr",
    title: "Como ler o WHR e onde ele chega",
    intro:
      "WHR é a razão cintura ÷ quadril. Quanto menor o número, mais afunilada (ampulheta) é a silhueta — porque a cintura é estreita em relação ao quadril.",
    tips: [
      "Faixas de referência femininas: ~0,80 ou menos lê como bem ampulheta; ~0,80–0,85 é uma silhueta feminina equilibrada; acima de ~0,85 a cintura está marcada demais em relação ao quadril.",
      "Você parte de 0,87. Com treino e dieta o destino é 0,75–0,78 no fim da fase 2 — 0,72–0,74 se a execução for muito boa. Quem entrega isso é a cintura saindo de 99 para 84 e o glúteo crescendo por baixo.",
      "O que treino nenhum faz é mudar PARA ONDE a gordura vai: sem estrogênio ela fica na barriga e não migra pro quadril e pra coxa. Isso é impossível, não difícil. A razão cai do mesmo jeito — mas por cintura seca e glúteo grande, que é outro material, não outro esforço. Veja a tela «Até onde dá pra chegar» no Treino.",
    ],
  },
  {
    id: "ombro-quadril",
    title: "Ombro ÷ quadril: por que ele não é o seu gargalo",
    intro:
      "Essa razão compara a largura dos ombros com a do quadril. Homem cis típico fica entre 1,15 e 1,25; você está em 1,06, que já é faixa feminina. O ombro nunca foi o problema — a cintura é.",
    tips: [
      "A razão anda pelas duas pontas, não só pela de baixo: a medida do ombro inclui gordura e cai junto no emagrecimento. Por isso não existe uma dívida de centímetros de quadril pendurada em você.",
      "Na fase 2 o quadril volta aos 114 cm de hoje feito de músculo, sobre um tronco já seco — é aí que a razão fecha perto de 1,00, sem nenhum treino de ombro pra isso.",
      "Treinar ombro pesado (desenvolvimento, elevações com carga alta) alarga a parte de cima e sobe a razão. Por isso o ombro entra leve, só pra postura — não porque ele seja largo demais.",
    ],
  },
  {
    id: "bf-faixas",
    title: "Gordura corporal: faixas e pra onde ela vai em você",
    intro:
      "A % de gordura é uma estimativa por circunferências (fórmula Navy: pescoço, cintura, quadril e altura) — não é exata, mas é consistente pra acompanhar tendência.",
    tips: [
      "Faixas femininas aproximadas: essencial ~10–13% (muito baixo), atleta ~14–20%, fitness ~21–24%, média ~25–31%, alta acima disso.",
      "A sua gordura se distribui de forma androide: acumula na barriga, não no quadril e na coxa. É assim que um corpo sem estrogênio guarda gordura, e treino nenhum inverte isso. Por isso uma cintura que sobe pesa mais na sua silhueta do que o número de %BF sugere — e por isso a alavanca é tirar barriga, não esperar a gordura ir pra outro lugar.",
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
      "Treino e dieta afinam a cintura, crescem glúteo e quadril e baixam a %BF — isso é seu e acontece agora. O que eles não fazem é redistribuir gordura, e isso não é questão de tempo nem de esforço: a barriga é a frente onde o seu trabalho rende.",
    ],
  },
];

export function Silhouette() {
  const measurements = useLiveQuery(() => db.measurements.orderBy("date").toArray(), []);
  const heightCm = useSetting("heightCm");
  const targetWhr = useSetting("targetWhr");
  const targetShr = useSetting("targetShoulderHipRatio");
  // Meta que o app concede de fato — não a que o ciclo pediria. Em hipertrofia
  // com a cintura acima do limiar, o plano alimentar fica em manutenção, e esta
  // tela não pode anunciar um superávit que não existe.
  const goal = useResolvedGoal();
  const activeCycle = useSetting("activeCycle");

  if (!measurements) {
    return <div className="p-4 pb-24 text-muted">Carregando…</div>;
  }

  const latest = measurements.at(-1);
  const prev = measurements.at(-2);
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
        {activeCycle === "hipertrofia" && goal !== "superavit" && (
          <p className="text-muted text-sm">
            O treino é de crescimento, mas a comida segue em manutenção: com a cintura acima de {CINTURA_LIBERA_SUPERAVIT_CM} cm o superávit iria pra barriga. Nesta fase o glúteo cresce em manutenção mesmo. Registre uma medição nova pra liberar quando chegar lá.
          </p>
        )}
      </div>

      {/* WHR */}
      {whr !== null && (
        <div className="card space-y-1">
          <h2 className="text-nude-warm font-medium">Cintura / Quadril (WHR)</h2>
          <p className="text-nude text-lg">
            WHR {whr.toFixed(2)} <span className="text-muted text-sm">· alvo {targetWhr.toFixed(2)}</span>
          </p>
          {/* Só a rota da cintura. `whrGap` também devolve quantos centímetros de
              quadril fechariam a conta sozinhos, mas oferecer isso como alternativa
              equivalente seria mentira: são dezenas de centímetros que glúteo nenhum
              entrega, e o quadril do plano volta ao número de hoje — não maior. */}
          {whrG && whrG.waistDeltaCm > 0 ? (
            <p className="text-muted text-sm">
              Pra chegar no alvo: −{whrG.waistDeltaCm} cm de cintura. É a cintura que faz
              esse número, não o quadril: ele cai na fase 1 (gordura saindo) e volta aos{" "}
              {FASE_2.quadrilCm} cm na fase 2, feito de músculo.
            </p>
          ) : (
            <p className="text-nude text-sm">No alvo. ✓</p>
          )}
          <p className="text-muted text-xs">
            Menor = mais ampulheta. O destino do plano é 0,75–0,78 no fim da fase 2 — 0,72–0,74 com execução muito boa.
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
          {shr <= SHR_FAIXA_FEMININA ? (
            <p className="text-nude text-sm">
              Já é faixa feminina — homem cis típico fica entre 1,15 e 1,25. ✓
            </p>
          ) : (
            <p className="text-muted text-sm">
              Subiu para fora da faixa feminina (1,15–1,25 é a masculina típica). Confira se o
              ombro está pegando carga pesada demais.
            </p>
          )}
          <p className="text-muted text-xs">
            Esta razão melhora pelas duas pontas: a medida do ombro tem gordura e cai com o
            emagrecimento, e o quadril volta aos {FASE_2.quadrilCm} cm na fase 2 feito de músculo.
            Você não deve centímetros de quadril a ninguém — o ombro nunca foi o gargalo, a cintura é.
          </p>
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
            Sua cintura subiu {guard.deltaCm} cm desde a última medida durante o superávit. No seu
            corpo isso é gordura na barriga, não glúteo. Considere segurar o superávit ou voltar à
            manutenção.
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
