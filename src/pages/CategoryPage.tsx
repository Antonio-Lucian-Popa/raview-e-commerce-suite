import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductGridSkeleton } from '@/components/LoadingSkeletons';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import { api } from '@/lib/api';
import { withAssetVersion } from '@/lib/assets';
import { getCategoryIcon } from '@/lib/category-icons';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'category-page'],
    queryFn: () => api.categories.getAll(),
  });
  const category = useMemo(
    () => categories.find((item) => item.slug === slug),
    [categories, slug],
  );
  const subcategories = useMemo(
    () => (category ? categories.filter((item) => item.parentId === category.id && item.active) : []),
    [categories, category],
  );
  const hasSubcategories = subcategories.length > 0;

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', 'category', category?.id],
    queryFn: () => api.products.getAll({ categoryId: category!.id }),
    enabled: !!category?.id && !hasSubcategories,
  });

  if (error) return <ErrorState />;

  const breadcrumbs = [
    { label: 'Magazin', href: '/shop' },
    ...(category?.parent ? [{ label: category.parent.name, href: `/category/${category.parent.slug}` }] : []),
    { label: category?.name || '...' },
  ];

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={breadcrumbs} />

      {category && (
        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-8">
          <img src={withAssetVersion(category.image, category.updatedAt ?? category.createdAt)} alt={category.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/20 flex items-center">
            <div className="container-page">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-background">{category.name}</h1>
              <p className="text-background/70 mt-2 max-w-md">{category.description}</p>
            </div>
          </div>
        </div>
      )}

      {hasSubcategories ? (
        <section>
          <div className="mb-5">
            <h2 className="font-display text-2xl font-bold">Alege subcategoria</h2>
            <p className="mt-1 text-sm text-muted-foreground">Intră într-o ramură mai exactă pentru a vedea produsele potrivite.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subcategories.map((subcategory) => {
              const Icon = getCategoryIcon(subcategory);

              return (
                <Link
                  key={subcategory.id}
                  to={`/category/${subcategory.slug}`}
                  className="group flex min-h-28 items-center gap-4 rounded-lg border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent/5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground/75 transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <Icon className="h-6 w-6 stroke-[1.6]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{subcategory.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{subcategory.productCount ?? 0} produse</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </Link>
              );
            })}
          </div>
        </section>
      ) : isLoading ? (
        <ProductGridSkeleton />
      ) : products && products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState title="Niciun produs în această categorie" actionLabel="Înapoi la magazin" actionHref="/shop" />
      )}
    </div>
  );
}
