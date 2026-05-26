import { BeautyTabs } from "../../components/BeautyTabs";
import { EmptyState } from "../../components/EmptyState";

export function StylePlaceholder() {
  return (
    <div className="p-4 pb-24">
      <h1 className="font-serif text-2xl text-nude mb-3">Beleza</h1>
      <BeautyTabs />
      <EmptyState title="Estilo" description="Paleta pessoal, peças estratégicas e looks chegam na próxima parte." />
    </div>
  );
}
