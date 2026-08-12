import { MEDIDAS_PARTIDA, FASES, MARCOS_CINTURA } from "../lib/objetivo";

// Módulo puro. Os números de medida NÃO são digitados aqui — são interpolados
// de objetivo.ts, que é a fonte única. Digitar "114" neste arquivo criaria a
// segunda cópia que diverge em silêncio quando o alvo mudar, que é o modo de
// falha mais caro deste projeto.

export interface GuiaTamanho {
  id: string;
  titulo: string;
  corpo: string;
}

const FASE_1 = FASES.find((f) => f.id === "fase-1")!;
const FASE_2 = FASES.find((f) => f.id === "fase-2")!;
const MARCO_88 = MARCOS_CINTURA.find((m) => m.cinturaCm === 88)!;

export const GUIA_TAMANHOS: readonly GuiaTamanho[] = [
  {
    id: "pelo-quadril",
    titulo: "Compra pelo quadril e pela coxa — nunca pela cintura",
    corpo:
      `Cueca é vendida por cintura, calcinha por quadril, e você tem ` +
      `${MEDIDAS_PARTIDA.quadrilCm - MEDIDAS_PARTIDA.cinturaCm} cm de diferença entre as duas ` +
      `(cintura ${MEDIDAS_PARTIDA.cinturaCm}, quadril ${MEDIDAS_PARTIDA.quadrilCm}) e coxa de ` +
      `${MEDIDAS_PARTIDA.coxaCm}. Se comprar pelo número da cintura, a peça aperta a coxa — e peça ` +
      `que aperta a coxa achata a bunda, que é exatamente o oposto do que você está construindo. ` +
      `Procura sempre a faixa da tabela que contém ${MEDIDAS_PARTIDA.quadrilCm} de quadril, e ignora ` +
      `o nome do tamanho.`,
  },
  {
    id: "tabela-por-marca",
    titulo: "A tabela muda por marca — confere sempre",
    corpo:
      `Hoje você é GG em cueca e 52 em calcinha plus, mas isso é o nome, não a medida. Na tabela ` +
      `Lupo o GG cobre cintura 96–101 e quadril 111–116, e as suas duas medidas caem no meio. Na ` +
      `Zorba o GG começa em cintura 100 e você fica de fora. Mesma letra, peça diferente. Confere a ` +
      `faixa que contém ${MEDIDAS_PARTIDA.quadrilCm} antes de comprar, marca por marca.`,
  },
  {
    id: "validade-do-tamanho",
    titulo: "O tamanho tem data de validade — compra pouco agora",
    corpo:
      `Em 6 a 8 meses a cintura vai de ${MEDIDAS_PARTIDA.cinturaCm} para ${FASE_1.cinturaCm} e o ` +
      `quadril de ${MEDIDAS_PARTIDA.quadrilCm} para cerca de ${FASE_1.quadrilCm}. Depois, na fase 2, ` +
      `o quadril volta a ${FASE_2.quadrilCm} — mesmo número, feito de músculo. Ou seja: o teu tamanho ` +
      `desce e depois sobe de novo. Enxoval completo hoje é dinheiro com data marcada. Compra 2 ou 3 ` +
      `peças até a cintura chegar a ${MARCO_88.cinturaCm} (mês ${MARCO_88.mesMin}–${MARCO_88.mesMax}), ` +
      `e o resto depois.`,
  },
  {
    id: "de-usar-primeiro",
    titulo: "Se for comprar pouco, compra o de usar",
    corpo:
      `A peça de ver continua servindo mesmo se ficar folgada — renda e cetim perdoam. A de usar não ` +
      `perdoa: compressão folgada não comprime, e peça que sobra enrola e vira um cordão que aperta. ` +
      `Então, na dúvida, as 2 ou 3 peças de agora são de usar.`,
  },
];
