import type { GuideSection } from "../components/GuideAccordion";

// Guia do cabelo cacheado (~3A/3B): cortes andróginos/femininos que feminizam
// SEM depender de comprimento, e rotina de cacho com a linha Juba (Widi Care).
// Conteúdo estático — boas práticas gerais, não substitui cabeleireiro.
export const HAIR_GUIDE: GuideSection[] = [
  {
    id: "corte",
    title: "Corte do cacho (andrógino → feminino)",
    intro: "Pro seu cacho médio, dá pra feminizar sem depender de comprimento — e você regula o quanto o corte 'entrega'. Cortar SEMPRE a seco (respeita a encolhida) e evitar desbaste pesado (gera frizz).",
    tips: [
      "Recomendado agora — Curly Wolf Cut: camadas que emolduram o rosto a partir das maçãs + volume no topo. Feminiza e tira o peso do comprimento, mas ainda passa como corte estiloso. Peça: 'wolf cut cacheado, camadas emoldurando o rosto, a seco, sem desbaste'.",
      "Mais discreto (ambiente pesado) — French crop texturizado: topo mais longo e cacheado, franja caindo na testa, laterais em taper/drop fade BAIXO (não skin fade). Lê como corte masculino moderno.",
      "Mais feminino sem alongar — Curly shag com franja cortina (curtain bangs): a peça que mais suaviza o rosto.",
      "Se topar um pouco de comprimento (mas curto) — Curly bob/lob no queixo/clavícula com franja cortina: silhueta feminina clássica, sem virar 'cabelo grande'.",
      "Discrição regulável: quanto mais franja e emolduramento no rosto, mais feminino; menos, mais discreto. Comece suave, dá pra intensificar depois.",
    ],
  },
  {
    id: "suavizar-rosto",
    title: "Como suavizar o rosto",
    intro: "O 'motor' da feminização está em 3 coisas — valem pra qualquer um dos cortes acima.",
    tips: [
      "Franja cortina (aberta no meio): quebra a testa e equilibra o maxilar forte — a peça nº1.",
      "Camadas que emolduram a partir da maçã do rosto pra baixo: quebram os ângulos retos do rosto quadrado.",
      "Volume no topo/coroa: alonga o rosto e afina a aparência quadrada — o cacho já ajuda, não deixe achatar.",
      "Evite: laterais raspadas/skin fade, linhas retas/blunt e cabelo colado — tudo isso reforça ângulos masculinos. Prefira taper/drop fade e pontas texturizadas.",
    ],
  },
  {
    id: "lavagem-juba",
    title: "Lavagem do cacho (linha Juba)",
    intro: "A Juba (Widi Care) serve muito bem pro seu cacho. Ordem certa no dia da lavagem (2–3x por semana, não todo dia):",
    tips: [
      "1. Shampoo só no COURO cabeludo, massageia e enxágua (o comprimento se limpa na espuma que escorre).",
      "2. Condicionador OU máscara, alternando: condicionador do meio às pontas, desembaraça no chuveiro com os dedos, 2–3 min. Máscara 1–2x/semana, deixa 5–15 min (touca/toalha morna potencializa).",
      "3. Finalização com o cabelo ENCHARCADO: tira o excesso com camiseta de algodão e aplica do mais leve ao mais pesado — leave-in → geleia/finalizador Juba → gel — amassando (scrunch) de baixo pra cima.",
      "4. Seca ao natural ou com DIFUSOR em temperatura morna/baixa, sem ficar mexendo (mexer = frizz).",
      "5. Segredo do cacho definido MAS macio (SOTC): com o cabelo 100% seco, amassa com 1 gota de óleo (blend Juba) pra quebrar a casquinha do gel.",
      "O único tempo que importa é a máscara (5–15 min) e deixar secar 100% antes de quebrar o gel. O resto é sequência, não espera.",
    ],
  },
  {
    id: "cronograma-cuidado",
    title: "Cronograma & cuidado barato",
    intro: "Manter o cacho saudável é simples e barato — a Juba é forte em nutrição, fraca em reconstrução.",
    tips: [
      "Cronograma: hidratação/nutrição pela máscara Juba 1–2x/semana; reconstrução LEVE (queratina barata) ~1x a cada 15–30 dias. Não exagera na reconstrução — em excesso endurece e quebra o fio.",
      "Dorme com o cabelo preso no alto (pineapple) e fronha de cetim/seda — não amassa nem resseca (algodão quebra o fio).",
      "Entre lavagens: refresca com borrifada de água + um pouco de leave-in/gel e amassa, em vez de lavar de novo.",
      "Seca com camiseta de algodão ou toalha de microfibra amassando — nunca esfregando (o atrito gera frizz).",
      "Budget Brasil: creme Salon Line #TodeCacho (~R$12–18), geleia de linhaça Lola (~R$25–35), difusor universal avulso (~R$30–60).",
      "Sol forte de Aracaju: em exposição longa, boné ou um leave-in com FPS antes de sair — protege o fio e a cor do cacho.",
    ],
  },
];
