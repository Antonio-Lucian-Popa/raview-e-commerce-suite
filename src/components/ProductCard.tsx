import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { formatLei, getProductOldPriceWithVat, getProductPriceWithVat, getVatLabel } from '@/lib/pricing';

interface ProductCardProps {
  product: Product;
}

const badgeStyles: Record<string, string> = {
  new: 'bg-accent text-accent-foreground',
  sale: 'bg-destructive text-destructive-foreground',
  bestseller: 'bg-primary text-primary-foreground',
};

const badgeLabels: Record<string, string> = {
  new: 'Nou',
  sale: 'Reducere',
  bestseller: 'Bestseller',
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const badges = [
    ...(product.isNew ? (['new'] as const) : []),
    ...(product.oldPrice && product.oldPrice > product.price ? (['sale'] as const) : []),
    ...(product.bestseller ? (['bestseller'] as const) : []),
  ];
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const imageUrl = product.images[0]?.url ?? '/placeholder.svg';
  const hasImage = Boolean(product.images[0]?.url) && !imageFailed;
  const brandName = product.brand?.name ?? 'Brand';
  const reviewCount = product.reviews?.length ?? 0;
  const averageRating = reviewCount
    ? product.reviews!.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;
  const priceWithVat = getProductPriceWithVat(product);
  const oldPriceWithVat = getProductOldPriceWithVat(product);
  const hasPrice = priceWithVat > 0;
  const stockLabel = product.stock > 0 ? 'În stoc' : 'La comandă';
  const stockClass = product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl hover:shadow-black/5">
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-secondary/60">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_center,hsl(var(--background))_0%,hsl(var(--secondary))_72%)] p-6 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground">
              <ImageOff className="h-5 w-5" />
            </span>
            <span className="line-clamp-2 text-xs font-medium leading-5 text-muted-foreground">{product.name}</span>
          </div>
        )}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {badges.map(badge => (
              <Badge key={badge} className={`${badgeStyles[badge]} text-[10px] font-semibold px-2`}>
                {badgeLabels[badge]}
              </Badge>
            ))}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 right-3 h-10 w-10 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold">
            -{discount}%
          </div>
        )}
        <span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${stockClass}`}>
          {stockLabel}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{brandName}</p>
          {product.sku && <p className="truncate text-[11px] text-muted-foreground">Cod {product.sku}</p>}
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 transition-colors group-hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < Math.round(averageRating) ? 'fill-accent text-accent' : 'text-border'}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold leading-none">{hasPrice ? formatLei(priceWithVat) : 'Preț la cerere'}</span>
              {hasPrice && oldPriceWithVat && (
                <span className="text-sm text-muted-foreground line-through">{formatLei(oldPriceWithVat)}</span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{hasPrice ? getVatLabel() : 'Contactează-ne pentru ofertă'}</p>
          </div>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
            aria-label={`Adaugă ${product.name} în coș`}
            onClick={(e) => { e.preventDefault(); addItem(product); }}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
