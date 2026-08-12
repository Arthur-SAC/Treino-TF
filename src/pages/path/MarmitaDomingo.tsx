import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { PathTabs } from "../../components/PathTabs";
import { ROTEIRO_DOMINGO, MARMITA_TETO_MIN } from "../../data/marmita-domingo-seed";
import { getActiveMealPlan } from "../../lib/meal-plan";
import { porcoesDoLote } from "../../lib/marmita-porcoes";

const REFEICAO_LABEL = { almoco: "Almoço", jantar: "Jantar" } as const;

export function MarmitaDomingo() {
  const plan = useLiveQuery(() => getActiveMealPlan(), []);
  const maoNaMassa = ROTEIRO_DOMINGO.reduce((s, e) => s + e.maoNaMassaMin, 0);
  const porcoes = plan ? porcoesDoLote(plan) : [];

  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="font-serif text-2xl text-nude flex-1">Trilha</h1>
        <Link to="/trilha/alimentacao" className="text-muted text-sm">&larr; Alimentação</Link>
      </div>
      <PathTabs />

      <div className="card mb-3">
        <h2 className="text-nude-warm font-medium mb-1">Domingo · o lote da semana</h2>
        <p className="text-nude text-sm leading-relaxed">
          <span className="text-nude-warm">{maoNaMassa} min</span> de pé na cozinha, dentro do teto
          de {MARMITA_TETO_MIN}. O resto é panela trabalhando sozinha — por isso a ordem importa: o
          que demora mais vai ao fogo primeiro.
        </p>
        <p className="text-muted text-xs mt-2 leading-relaxed">
          Depois deste domingo, dia de semana é montar e esquentar. É o domingo que carrega a
          semana, não a força de vontade das 19h30.
        </p>
      </div>

      <ol className="space-y-3">
        {ROTEIRO_DOMINGO.map((etapa) => (
          <li key={etapa.id} className="card">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-nude text-xs">{etapa.ordem === 0 ? "véspera" : etapa.ordem}</span>
              <h3 className="text-nude-warm font-medium flex-1">{etapa.titulo}</h3>
            </div>
            <p className="text-muted text-xs mb-1.5">
              {etapa.maoNaMassaMin} min de mão na massa
              {etapa.sozinhoMin > 0 && ` · ${etapa.sozinhoMin} min cozinhando sozinho`}
            </p>
            <p className="text-nude text-sm leading-relaxed">{etapa.comoFazer}</p>
            <p className="text-nude-warm text-xs mt-1.5">Rende: {etapa.rende}</p>
          </li>
        ))}
      </ol>

      {porcoes.length > 0 && (
        <>
          <h2 className="text-muted text-xs uppercase tracking-wider mt-6 mb-2">
            Quanto vai em cada pote
          </h2>
          <p className="text-muted text-xs mb-3 leading-relaxed">
            As etapas acima falam do lote inteiro — é o que você põe no fogo. Aqui é a porção de{" "}
            <span className="text-nude-warm">uma</span> marmita, na balança. Os gramas saem do
            próprio cardápio: se a porção mudar lá, muda aqui junto.
          </p>
          <div className="space-y-3">
            {porcoes.map((p) => (
              <div key={p.opcaoId} className="card">
                <h3 className="text-nude-warm font-medium text-sm mb-2">
                  {REFEICAO_LABEL[p.mealType]} · {p.label}
                </h3>
                <ul className="space-y-1 text-sm">
                  {p.itens.map((i, j) => (
                    <li key={j} className="flex justify-between gap-2">
                      <span className="text-nude">{i.name}</span>
                      <span className="text-nude-warm text-xs whitespace-nowrap">{i.qtyG} g</span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted text-xs mt-2 pt-2 border-t border-bg-border flex justify-between">
                  <span>Pote cheio</span>
                  <span className="text-nude-warm">{p.totalG} g</span>
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
