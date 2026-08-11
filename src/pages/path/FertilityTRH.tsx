import { Link } from "react-router-dom";
import { DisclaimerCard } from "../../components/DisclaimerCard";
import { GuideAccordion, type GuideSection } from "../../components/GuideAccordion";

const GUIDE: GuideSection[] = [
  {
    id: "por-que-adiar",
    title: "Fertilidade e hormônio — as duas escolhas",
    intro: "É uma escolha sua, informada — não uma limitação.",
    tips: [
      "A TRH (estrogênio + bloqueio de testosterona) reduz a produção de espermatozoides, e com o tempo essa fertilidade pode ficar reduzida ou não voltar. Por isso, quem quer filhos biológicos costuma OU ter os filhos antes de começar, OU congelar sêmen antes.",
      "Você escolheu a via de TER OS FILHOS antes, com sua amada — mantendo a fertilidade natural. Perfeitamente válido.",
      "Sua feminização não depende de hormônio para acontecer: ela vem do treino (glúteo e cintura), da pele, do cabelo, da voz, do movimento e do estilo — tudo que o app já cuida, hoje, sem data marcada para nada.",
      "Ideia de segurança (só se quiser): um espermograma agora mostra sua fertilidade de base, e congelar sêmen pode ser um 'seguro' caso mude de ideia sobre o momento. Opcional — não é obrigatório pro seu plano.",
    ],
  },
  {
    id: "perguntas-medico",
    title: "Perguntas pra levar ao médico",
    intro: "Endócrino, urologista ou ambulatório trans. Leva essa lista — as perguntas sobre hormônio são pra você conhecer o terreno, não porque exista algo marcado.",
    tips: [
      "Minha fertilidade está boa hoje? Vale fazer um espermograma pra ter a base?",
      "Tem uma janela de tempo ideal pra tentar engravidar minha parceira, ou posso ir no meu ritmo?",
      "Se um dia eu escolher hormonizar, o que esperar (efeitos e tempo)? Dá pra pausar depois pra fertilidade, se precisar?",
      "Vale a pena congelar sêmen como seguro antes de qualquer coisa?",
      "Que exames de base fazer antes de começar a TRH (hormônios, saúde geral)?",
      "Como funciona iniciar TRH pelo SUS (processo transexualizador) ou pelo plano?",
    ],
  },
  {
    id: "o-que-esperar",
    title: "O que o hormônio faria, se um dia você quiser",
    intro: "Pra você já ir sabendo — e ver que não começa do zero.",
    tips: [
      "Efeitos (graduais, meses a anos): gordura migra pro quadril/coxa, pele mais macia, pelo corporal mais fino, mamas em desenvolvimento, humor mais estável.",
      "Hormonizar tem um custo que ninguém te conta: reduz ereção, firmeza, libido e a velocidade de ganho muscular. Metade do que você quer — durar, ficar dura, penetrar sua noiva, ter força para levantar ela — depende da testosterona que você tem hoje. Não é uma espera: é uma escolha entre dois conjuntos de coisas que você quer.",
      "Não é instantâneo: pense em anos de mudança gradual, como uma segunda puberdade. Constância vence.",
    ],
  },
  {
    id: "gatilho-manutencao",
    title: "Quando (e se) você quiser revisitar",
    intro: "Sem gatilho, sem fase que dispara a conversa — só quando fizer sentido pra você.",
    tips: [
      "Não existe fase do treino que 'libere' a conversa sobre hormônio. Se um dia você quiser revisitar, o momento é o que você escolher — não uma etapa que o app marca por você.",
      "Prático, se ajudar: quando o treino entrar na fase de Manutenção, a base de músculo/glúteo já está construída e sobra mais espaço mental pra decisões grandes como essa. É só um dado a mais, não uma data.",
      "Quando (e se) você quiser conversar com o médico, é depois de você e sua amada terem os filhos de vocês — sem outro pré-requisito.",
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
          Manter a fertilidade natural até você e sua amada terem os filhos de vocês — essa é a
          escolha de hoje, não uma espera. Hormonizar continua sendo uma opção sua, <span className="text-nude">sem data marcada e sem fase do treino que a libere</span>.
        </p>
      </div>

      <GuideAccordion sections={GUIDE} />
    </div>
  );
}
