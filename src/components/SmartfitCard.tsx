/** Aparece quando os quatro exercícios que constroem glúteo e coxa batem o
 *  teto do prédio. O roteiro vem de docs/OBJETIVO.md §8. */
export function SmartfitCard() {
  return (
    <div className="card border-nude/40">
      <p className="text-muted text-xs uppercase tracking-wider">Hora da Smartfit</p>
      <p className="text-nude-warm text-sm mt-1">Você bateu o teto do prédio no hip thrust, no leg press, na abdutora e no búlgaro.</p>
      <p className="text-xs mt-1">As táticas seguram algumas semanas, mas daqui pra frente o glúteo cresce com carga — e o prédio não tem mais.</p>
      <p className="text-xs mt-1">Próximo passo: mande fotos ou a lista de aparelhos da sua unidade pra montar o treino novo, e comece com 1–2 semanas só nas máquinas sentadas.</p>
    </div>
  );
}
