// src/lib/sentar.ts
// A dica de sentar que acompanha cada micro-pausa. Módulo puro.
//
// Decisão dela (2026-10-02): sentar se treina na cadeira do trabalho, não em
// casa. Conversa de 2026-10-01: joelhos juntos o dia inteiro cansa, aperta a
// parte íntima e desnivela a pelve — o padrão é uma posição de pouco esforço,
// e os joelhos juntos vêm num bloco curto por dia, que é o que vira hábito.

export interface DicaSentar {
  titulo: string;
  como: string;
}

const TROCA = "Troca de posição a cada 20–30 min, seja qual for.";

/** Pausa do dia em que entra o bloco de joelhos juntos: a segunda, quando o
 *  expediente já começou e ainda tem energia — uma vez só por dia. */
const PAUSA_DO_BLOCO = 1;

const inteiro = (v: number) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);

export function sentarDaVez(n: number, diaDoAno: number): DicaSentar {
  const i = inteiro(n);
  const d = inteiro(diaDoAno);
  if (i === PAUSA_DO_BLOCO) {
    return {
      titulo: "Joelhos juntos · bloco do dia",
      como: `Joelhos juntos por 10–15 min, pés juntos ou levemente afastados. Para quando virar esforço, não no limite. Solta na hora se formigar, se a lombar reclamar ou se perceber que prendeu a respiração. ${TROCA}`,
    };
  }
  // O lado alterna entre pausas e entre dias, pra nenhum lado da pelve
  // ficar sempre com a mesma carga.
  const lado = (i + d) % 2 === 0 ? "esquerda" : "direita";
  const opcoes: DicaSentar[] = [
    {
      titulo: "Pernas inclinadas pro lado",
      como: `Joelhos juntos e as duas pernas descendo em diagonal pra ${lado}. Os joelhos se apoiam um no outro, então quase não gasta força. Fundo da cadeira, lombar apoiada. ${TROCA}`,
    },
    {
      titulo: "Tornozelos cruzados",
      como: `Cruza os tornozelos (hoje o ${lado === "esquerda" ? "esquerdo" : "direito"} por cima), joelhos próximos sem colar. Aperta bem menos que cruzar no joelho. ${TROCA}`,
    },
    {
      titulo: "Joelhos próximos",
      como: `Joelhos a um palmo ou menos, pés um pouco afastados, pés no chão. De fora, lê como pernas juntas. ${TROCA}`,
    },
  ];
  return opcoes[(i + d) % opcoes.length];
}
