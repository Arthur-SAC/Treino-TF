/** Como guardar cada item da lista de compras, pensado pro calor de Aracaju
 *  (fora da geladeira tudo dura menos que o rótulo promete). A chave é o
 *  `item` exato dos ingredientes do cardápio — o teste cobra que todo
 *  ingrediente de todos os planos tenha a sua linha.
 *
 *  Não é seed do banco: é texto fixo lido direto pela tela, então mudar aqui
 *  não pede subir versão. */
export const ARMAZENAMENTO: Record<string, string> = {
  "Ovos":
    "Geladeira, na prateleira de dentro (a porta esquenta toda vez que abre): 3 a 4 semanas. Não lava antes de guardar, só na hora de usar.",
  "Leite":
    "Caixa fechada fica no armário. Aberta, geladeira e acaba em 3 dias.",
  "Whey protein":
    "Pote bem fechado, no armário, longe do fogão e do vapor. Colher sempre seca — umidade empedra.",
  "Café":
    "Pote fechado no armário. Aberto, mantém o aroma por cerca de 1 mês.",
  "Flocão de milho (cuscuz)":
    "Depois de aberto, passa pra um pote com tampa: saco aberto no calor dá caruncho. Uns 3 meses.",
  "Aveia em flocos":
    "Pote com tampa no armário. Uns 3 meses depois de aberta.",
  "Arroz":
    "Cru: pote fechado no armário. Cozido: esfria em até 1 hora fora da geladeira e guarda — 4 dias na geladeira ou 1 mês no congelador. Arroz esquecido na panela no calor é o que mais dá intoxicação.",
  "Feijão de corda (macassar)":
    "Cru: pote fechado no armário. Cozido: 3 a 4 dias na geladeira; o resto congela em porções e dura 3 meses.",
  "Pão de forma":
    "Saco fechado no armário: uns 5 dias no calor. Pra durar a semana, congela as fatias e torra direto do congelador.",
  "Azeite":
    "Armário escuro, longe do fogão, sempre tampado. Luz e calor deixam rançoso.",
  "Castanha-do-pará":
    "Pote fechado. Se for durar mais de 1 mês, guarda na geladeira — gordura de castanha rança no calor.",
  "Castanha de caju":
    "Pote fechado. Se for durar mais de 1 mês, guarda na geladeira — gordura de castanha rança no calor.",
  "Peito de frango":
    "Cru: 1 a 2 dias na geladeira, então no dia da compra já porciona e congela o que não vai pro lote de domingo (6 meses). Cozido: 3 a 4 dias na geladeira, 3 meses no congelador. Descongela na geladeira de véspera, nunca na pia.",
  "Carne moída patinho":
    "Moída estraga mais rápido que a peça: cru, só 1 dia na geladeira. Pede pra moer na hora e, se não cozinhar no mesmo dia, congela achatada no saco (descongela rápido). Cozida: 3 a 4 dias na geladeira.",
  "Sardinha em óleo (lata)":
    "Lata fechada fica no armário por muito tempo. Aberta, nunca guarda na lata: passa pra pote de vidro, geladeira, e come em até 2 dias.",
  "Atum em água (lata)":
    "Lata fechada fica no armário. Aberta, passa pra pote de vidro na geladeira e usa em até 2 dias — o patê pronto também dura 2 dias.",
  "Iogurte natural desnatado":
    "Geladeira. Fechado vale a validade; aberto, 3 a 4 dias. Pote de 170 g evita sobra aberta.",
  "Banana":
    "Fora da geladeira, separada das outras frutas. Compra metade madura e metade verde, que a segunda metade amadurece até quinta. Madura demais: geladeira segura mais 3 dias (a casca escurece, a polpa não).",
  "Melancia":
    "Inteira, sem cortar: 1 semana em lugar fresco e na sombra, ou 2 semanas na geladeira. Cortada estraga rápido: corta só metade no domingo, em cubos, em pote fechado na geladeira (4 dias), e a outra metade na quarta. A metade que não cortou fica com plástico filme na face cortada. Congelar não vale — descongela virando água.",
  "Acerola (ou polpa congelada)":
    "Fresca dura 2 a 3 dias, até na geladeira. Por isso: lava, seca e congela inteira no saco (3 meses), ou compra a polpa congelada. Bate do congelado, sem descongelar antes.",
  "Limão":
    "Saco fechado na geladeira: 3 a 4 semanas. Fora, no calor, seca em 1 semana.",
  "Alface":
    "Lava, seca muito bem (pano limpo ou centrífuga) e guarda em pote com papel-toalha no fundo: 5 a 7 dias. Molhada apodrece em 2.",
  "Tomate":
    "Verde ou firme, fora da geladeira até amadurecer. Maduro, geladeira: mais 4 a 5 dias.",
  "Cebola":
    "Fora da geladeira, em lugar seco e arejado, longe da macaxeira e da batata. Cortada: pote fechado na geladeira, 5 dias.",
  "Alho":
    "Cabeça fora da geladeira, em lugar seco. Descascado ou picado: pote fechado na geladeira até 1 semana, ou congela.",
  "Coentro":
    "Não lava antes. Enrola seco em papel-toalha, pote fechado na geladeira: 1 semana. Ou pica e congela em porções.",
  "Cebolinha":
    "Não lava antes. Enrola seca em papel-toalha, pote fechado na geladeira: 1 semana. Ou pica e congela em porções.",
  "Quiabo":
    "Não lava antes de guardar (molhado fica babento e mofa). Saco de papel na geladeira, 3 a 4 dias. Lava e corta só na hora.",
  "Beterraba":
    "Crua, sem as folhas, em saco na geladeira: 2 a 3 semanas. Cozida: pote fechado na geladeira, 5 dias.",
  "Macaxeira (aipim)":
    "Com casca escurece em 2 a 3 dias. Descasca no dia da compra: em pedaços, congela crua no saco (meses) e cozinha direto do congelado, ou deixa coberta de água na geladeira por 3 dias. Cozida: 3 a 4 dias na geladeira.",
  "Batata doce":
    "Fora da geladeira, em lugar seco e escuro: 1 a 2 semanas. Cozida: 4 dias na geladeira.",
  "Molho de tomate":
    "Aberto, passa pra pote de vidro na geladeira (5 dias) ou congela em forminha de gelo.",
};

export function comoGuardar(item: string): string | undefined {
  return ARMAZENAMENTO[item];
}
