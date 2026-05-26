import type { ProgressPhoto } from "../lib/db";
import { BlobImage } from "./BlobImage";
import { formatDateBR } from "../lib/format";

interface Props {
  left?: ProgressPhoto;
  leftLabel: string;
  right?: ProgressPhoto;
  rightLabel: string;
}

export function PhotoComparator({ left, leftLabel, right, rightLabel }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p className="text-muted text-xs uppercase tracking-wider mb-1">{leftLabel}</p>
        {left ? (
          <>
            <BlobImage blob={left.blob} alt={leftLabel} className="w-full rounded-md aspect-[3/4] object-cover" />
            <p className="text-muted text-xs mt-1">{formatDateBR(new Date(left.date))}</p>
          </>
        ) : (
          <div className="bg-bg-deep border border-bg-border rounded-md aspect-[3/4] flex items-center justify-center text-muted text-xs text-center px-2">
            sem foto
          </div>
        )}
      </div>
      <div>
        <p className="text-muted text-xs uppercase tracking-wider mb-1">{rightLabel}</p>
        {right ? (
          <>
            <BlobImage blob={right.blob} alt={rightLabel} className="w-full rounded-md aspect-[3/4] object-cover" />
            <p className="text-muted text-xs mt-1">{formatDateBR(new Date(right.date))}</p>
          </>
        ) : (
          <div className="bg-bg-deep border border-bg-border rounded-md aspect-[3/4] flex items-center justify-center text-muted text-xs text-center px-2">
            sem foto
          </div>
        )}
      </div>
    </div>
  );
}
