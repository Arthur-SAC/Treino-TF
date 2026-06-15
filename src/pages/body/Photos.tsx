import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db, type ProgressPhoto } from "../../lib/db";
import { PhotoUpload } from "../../components/PhotoUpload";
import { BlobImage } from "../../components/BlobImage";
import { formatDateBR } from "../../lib/format";
import { GuideAccordion, type GuideSection } from "../../components/GuideAccordion";

const GUIDE_FOTOS: GuideSection[] = [
  {
    id: "fotos-comparaveis",
    title: "Como tirar fotos comparáveis",
    intro:
      "O que torna uma foto de progresso útil não é a qualidade — é a padronização. Quando tudo está igual entre uma foto e outra, a comparação se torna real.",
    tips: [
      "Mesma luz e fundo neutro: prefira luz natural difusa ou iluminação constante, sem sombras duras. Use sempre o mesmo cômodo e fundo.",
      "Mesma roupa: roupa íntima, biquíni ou qualquer peça que mostre a silhueta de forma consistente.",
      "Mesmas poses: frente, lado direito e costas são as três vistas essenciais.",
      "Postura padrão: pés paralelos na largura dos quadris, braços levemente afastados do corpo, olhar ao frente.",
      "Câmera na altura do quadril: isso captura o corpo inteiro proporcionalmente, sem distorção de perspectiva.",
      "Espelho limpo, se for selfie: manchas e dedadas atrapalham a leitura da silhueta.",
      "Mesmo horário do dia: de preferência pela manhã, em jejum — pelo mesmo motivo que as medidas.",
    ],
  },
  {
    id: "fotos-objetivo",
    title: "Fotos-objetivo: como escolher referências realistas",
    intro:
      "Ter referências visuais é poderoso, mas a escolha importa. Aqui está como usar essa ferramenta de forma saudável.",
    tips: [
      "Prefira referências com altura e estrutura óssea parecidas com a sua — quadril, ombro e comprimento de torso são definidos pelo esqueleto e não mudam com treino.",
      "Tenha em mente que muitas referências de corpo feminino foram construídas com TRH (hormônios) e/ou procedimentos cirúrgicos — isso redistribui gordura e altera musculatura de formas que treino sozinho não replica.",
      "Use as referências como norte de direção (silhueta mais afunilada, glúteo mais projetado), não como cópia exata — o seu resultado será único.",
      "Para entender melhor o que é alcançável com treino e sem TRH, veja a tela «Até onde dá pra chegar» no módulo de Treino.",
    ],
  },
];

export function Photos() {
  const photos = useLiveQuery(async () => {
    const list = await db.photos.where("category").equals("self").sortBy("date");
    return list.reverse();
  }, []);

  async function handleUpload(p: Omit<ProgressPhoto, "id">) {
    await db.photos.add(p as ProgressPhoto);
  }

  async function handleDelete(id?: number) {
    if (id === undefined) return;
    if (!confirm("Apagar essa foto?")) return;
    await db.photos.delete(id);
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <Link to="/corpo" className="text-muted text-sm">&larr; Corpo</Link>
        <h1 className="font-serif text-2xl text-nude flex-1">Fotos</h1>
      </div>

      <GuideAccordion sections={GUIDE_FOTOS} className="mb-4" />

      <div className="card mb-4">
        <h2 className="text-nude-warm font-medium mb-3">Nova foto</h2>
        <PhotoUpload onUpload={handleUpload} />
      </div>

      <h2 className="text-muted text-xs uppercase tracking-wider mb-2">Galeria</h2>
      {!photos?.length && (
        <p className="text-muted text-sm py-4 text-center">Sem fotos ainda.</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {photos?.map((p) => (
          <div key={p.id} className="card !p-2">
            <BlobImage blob={p.blob} alt={p.tag} className="w-full rounded-md mb-2 aspect-[3/4] object-cover" />
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-nude-warm">{formatDateBR(new Date(p.date))}</span>
              <span className="text-muted">{p.tag}</span>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-muted text-xs hover:text-red-300 mt-1"
              type="button"
            >
              apagar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
