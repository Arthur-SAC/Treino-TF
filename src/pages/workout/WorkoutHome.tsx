import { EmptyState } from "../../components/EmptyState";

export function WorkoutHome() {
  return (
    <div className="p-4 pb-24">
      <EmptyState title="Treino" description="Plano completo chega na próxima parte." />
    </div>
  );
}
