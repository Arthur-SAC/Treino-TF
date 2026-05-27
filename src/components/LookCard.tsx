import type { Look } from "../lib/db";
import { BlobImage } from "./BlobImage";
import { formatDateBR } from "../lib/format";

const RATING_LABEL: Record<Look["rating"], string> = {
  love: "Amei",
  ok: "Ok",
  no: "Não rolou",
};

interface Props {
  look: Look;
  onDelete?: () => void;
}

export function LookCard({ look, onDelete }: Props) {
  return (
    <div className="card !p-2">
      <BlobImage blob={look.blob} alt={look.occasion} className="w-full rounded-md mb-2 aspect-[3/4] object-cover" />
      <div className="flex justify-between items-baseline text-xs">
        <span className="text-nude-warm">{look.occasion}</span>
        <span className="text-muted">{RATING_LABEL[look.rating]}</span>
      </div>
      <p className="text-muted text-xs mt-0.5">{formatDateBR(new Date(look.date))}</p>
      {look.notes && <p className="text-muted text-xs mt-1">{look.notes}</p>}
      {onDelete && (
        <button onClick={onDelete} type="button" className="text-muted text-xs hover:text-red-300 mt-1">
          apagar
        </button>
      )}
    </div>
  );
}
