/** Etiqueta da opção recomendada de cada refeição.
 *
 *  Existe como componente, e não como span copiado em duas telas, porque ela
 *  aparece nos dois lugares em que a escolha acontece: a lista de opções do
 *  cardápio (MealPlanView) e o modal que abre pelo item da rotina do Hoje
 *  (RecipeModal). Rótulo e cor divergindo entre as duas telas fariam a mesma
 *  marca parecer duas coisas diferentes.
 *
 *  O texto é curto de propósito — o porquê da recomendação mora uma vez só, no
 *  cabeçalho do cardápio, e não repetido em cada linha. */
export function RecomendadaBadge() {
  return (
    <span className="ml-2 text-[10px] uppercase tracking-wider text-nude border border-nude/50 rounded px-1.5 py-0.5 align-middle">
      recomendada
    </span>
  );
}
