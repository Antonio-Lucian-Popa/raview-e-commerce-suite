import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function PromotionsPage() {
  const { data: promos } = useQuery({ queryKey: ['promotions'], queryFn: () => api.promotions.getAll() });

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ label: 'Oferte' }]} />
      <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">Oferte & Promoții</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {promos?.map(promo => (
          <div key={promo.id} className="relative rounded-xl overflow-hidden group hover-lift">
            <img
              src={promo.product?.images?.[0]?.url || promo.category?.image || '/placeholder.svg'}
              alt={promo.name}
              className="w-full h-64 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent flex items-end">
              <div className="p-6 w-full">
                <Badge className="bg-accent text-accent-foreground mb-2">
                  {promo.type === 'percentage' ? `-${promo.value}%` : `-${promo.value} lei`}
                </Badge>
                <h3 className="text-xl font-display font-bold text-background">{promo.name}</h3>
                <p className="text-sm text-background/70 mt-1">
                  Valabilă până la {new Date(promo.endDate).toLocaleDateString('ro-RO')}
                </p>
                <Button className="mt-4 bg-accent text-accent-foreground hover:bg-gold-dark" size="sm" asChild>
                  <Link to={promo.categoryId ? `/shop?categoryId=${promo.categoryId}` : '/shop'}>
                    Vezi produsele
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
