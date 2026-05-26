import type { Product } from "../lib/db";
import { formatDateBR } from "../lib/format";

const CATEGORY_LABEL: Record<Product["category"], string> = {
  skincare: "Skincare",
  haircare: "Cabelo",
  supplements: "Suplemento",
};

interface Props {
  product: Product;
  onDelete?: () => void;
}

export function ProductCard({ product, onDelete }: Props) {
  const expiring = product.endDate && new Date(product.endDate) < new Date();
  return (
    <div className="card">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-muted text-xs uppercase tracking-wider">{CATEGORY_LABEL[product.category]}</span>
        {expiring && <span className="text-red-300 text-xs">vencido</span>}
      </div>
      <h3 className="text-nude-warm font-medium">{product.name}</h3>
      {product.notes && <p className="text-muted text-sm mt-1">{product.notes}</p>}
      {product.boughtAt && (
        <p className="text-muted text-xs mt-2">comprado em {formatDateBR(new Date(product.boughtAt))}</p>
      )}
      {product.endDate && (
        <p className="text-muted text-xs">vence em {formatDateBR(new Date(product.endDate))}</p>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className="text-muted text-xs mt-2 hover:text-red-300">
          apagar
        </button>
      )}
    </div>
  );
}
