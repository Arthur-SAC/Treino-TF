interface Props {
  text: string;
}

export function DisclaimerCard({ text }: Props) {
  return (
    <div className="card !bg-wine/20 !border-wine-light text-sm">
      <span className="text-nude font-medium">Lembrete:</span> <span className="text-nude-warm">{text}</span>
    </div>
  );
}
