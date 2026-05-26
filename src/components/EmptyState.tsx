interface Props {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: Props) {
  return (
    <div className="card text-center py-12 px-6">
      <h2 className="font-serif text-nude text-xl mb-2">{title}</h2>
      {description && <p className="text-muted text-sm">{description}</p>}
    </div>
  );
}
