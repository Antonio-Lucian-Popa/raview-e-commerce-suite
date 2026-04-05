import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';

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
  const badges = [
    ...(product.isNew ? (['new'] as const) : []),
    ...(product.oldPrice && product.oldPrice > product.price ? (['sale'] as const) : []),
    ...(product.bestseller ? (['bestseller'] as const) : []),
  ];
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const imageUrl = product.images[0]?.url ?? '/placeholder.svg';
  const brandName = product.brand?.name ?? 'Brand';
  const reviewCount = product.reviews?.length ?? 0;
  const averageRating = reviewCount
    ? product.reviews!.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  return (
    <div className="group hover-lift bg-card rounded-lg border overflow-hidden">
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-secondary">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
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
      </Link>

      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{brandName}</p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < Math.round(averageRating) ? 'fill-accent text-accent' : 'text-border'}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{product.price} lei</span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">{product.oldPrice} lei</span>
            )}
          </div>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            disabled={product.stock <= 0}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
        {product.stock <= 0 && <p className="text-xs text-destructive font-medium">Stoc epuizat</p>}
      </div>
    </div>
  );
}
