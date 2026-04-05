import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductGridSkeleton } from '@/components/LoadingSkeletons';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import { api } from '@/lib/api';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => api.categories.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', 'category', category?.id],
    queryFn: () => api.products.getAll({ categoryId: category!.id }),
    enabled: !!category?.id,
  });

  if (error) return <ErrorState />;

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ label: 'Magazin', href: '/shop' }, { label: category?.name || '...' }]} />

      {category && (
        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-8">
          <img src={category.image || '/placeholder.svg'} alt={category.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/20 flex items-center">
            <div className="container-page">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-background">{category.name}</h1>
              <p className="text-background/70 mt-2 max-w-md">{category.description}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <ProductGridSkeleton />
      ) : products && products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState title="Niciun produs în această categorie" actionLabel="Înapoi la magazin" actionHref="/shop" />
      )}
    </div>
  );
}
