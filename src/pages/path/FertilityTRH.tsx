import { Link } from "react-router-dom";
import { DisclaimerCard } from "../../components/DisclaimerCard";
import { GuideAccordion, type GuideSection } from "../../components/GuideAccordion";

const GUIDE: GuideSection[] = [
  {
    id: "por-que-adiar",
    title: "Por que adiar a TRH pela fertilidade",
    intro: "É uma escolha sua, informada — não uma limitação.",
    tips: [
      "A TRH (estrogênio + bloqueio de testosterona) reduz a produção de espermatozoides, e com o tempo essa fertilidade pode ficar reduzida ou não voltar. Por isso, quem quer filhos biológicos costuma OU ter os filhos antes de começar, OU congelar sêmen antes.",
      "Você escolheu a via de TER OS FILHOS antes, com sua amada — mantendo a fertilidade natural. Perfeitamente válido.",
      "Enquanto a TRH não começa, sua feminização não para: ela vem do treino (glúteo/cintura), pele, cabelo, voz, movimento e estilo — tudo que o app já cuida.",
      "Ideia de segurança (só se quiser): um espermograma agora mostra sua fertilidade de base, e congelar sêmen pode ser um 'seguro' caso mude de ideia sobre o momento. Opcional — não é obrigatório pro seu plano.",
    ],
  },
  {
    id: "perguntas-medico",
    title: "Perguntas pra levar ao médico",
    intro: "Endócrino, urologista ou ambulatório trans. Leva essa lista.",
    tips: [
      "Minha fertilidade está boa hoje? Vale fazer um espermograma pra ter a base?",
      "Tem uma janela de tempo ideal pra tentar engravidar minha parceira, ou posso ir no meu ritmo?",
      "Quando eu começar a TRH, o que esperar (efeitos e tempo)? Dá pra pausar depois pra fertilidade, se precisar?",
      "Vale a pena congelar sêmen como seguro antes de qualquer coisa?",
      "Que exames de base fazer antes de começar a TRH (hormônios, saúde geral)?",
      "Como funciona iniciar TRH pelo SUS (processo transexualizador) ou pelo plano?",
    ],
  },
  {
    id: "o-que-esperar",
    title: "O que esperar da TRH quando começar",
    intro: "Pra você já ir sabendo — e ver que não começa do zero.",
    tips: [
      "Efeitos (graduais, meses a anos): gordura migra pro quadril/coxa, pele mais macia, pelo corporal mais fino, mamas em desenvolvimento, humor mais estável.",
      "A TRH é a maior alavanca da forma — mas ela PEGA O QUE VOCÊ JÁ CONSTRUIU. O glúteo e o músculo que você treinou hoje viram a base que o estrogênio arredonda e amacia. Você começa na frente.",
      "Não é instantâneo: pense em anos de mudança gradual, como uma segunda puberdade. Constância vence.",
    ],
  },
  {
    id: "gatilho-manutencao",
    title: "O gatilho: fase de Manutenção",
    intro: "O sinal que VOCÊ escolheu pra revisitar a TRH.",
    tips: [
      "Você decidiu revisitar a TRH quando o treino chegar na fase de MANUTENÇÃO — quando a base de músculo/glúteo está pronta e você passa a só manter.",
      "Faz todo sentido: é exatamente a fase ideal pra alinhar com o início da TRH (o estrogênio arredonda por cima da base construída).",
      "O app te mostra o ciclo atual do treino em Treino › Ciclos. Quando chegar em Manutenção, é o seu lembrete pra conversar com o médico — depois de você e sua amada terem os filhos de vocês.",
    ],
  },
];

export function FertilityTRH() {
  return (
    <div className="p-4 pb-24">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/" className="text-muted text-sm">&larr; Hoje</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Fertilidade &amp; TRH</h1>
      </div>

      <DisclaimerCard text="Isto organiza sua decisão e as perguntas — não substitui médico. Fertilidade e hormônio se decidem com endócrino/urologista/ambulatório trans." />

      <div className="card my-3 !bg-wine/20 !border-wine-light">
        <h2 className="text-nude font-medium mb-1">Meu plano</h2>
        <p className="text-sm text-nude-warm">
          Manter a fertilidade natural (sem TRH por enquanto) até você e sua amada terem os
          filhos de vocês. Só então iniciar a TRH. O gatilho pra revisitar: <span className="text-nude">chegar na fase de Manutenção do treino</span> —
          a base de músculo pronta pro estrogênio arredondar por cima.
        </p>
      </div>

      <GuideAccordion sections={GUIDE} />
    </div>
  );
}
