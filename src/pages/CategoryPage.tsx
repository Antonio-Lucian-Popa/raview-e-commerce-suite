import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductGridSkeleton } from '@/components/LoadingSkeletons';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { withAssetVersion } from '@/lib/assets';
import { getCategoryIcon } from '@/lib/category-icons';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = 24;

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

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', 'category', category?.id, currentPage],
    queryFn: () => api.products.getCatalogPage({ categoryId: category!.id, page: currentPage, limit: pageSize }),
    enabled: !!category?.id && !hasSubcategories,
  });
  const products = productsData?.items ?? [];
  const totalProducts = productsData?.meta.total ?? 0;
  const totalPages = Math.max(1, productsData?.meta.totalPages ?? 1);

  const updatePage = useCallback((page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (productsData && currentPage > totalPages) {
      updatePage(totalPages);
    }
  }, [currentPage, productsData, totalPages, updatePage]);

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
      ) : products.length > 0 ? (
        <>
          <div className="mb-4 flex flex-col gap-2 rounded-lg border border-border/70 bg-background px-4 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              Afișăm <span className="font-semibold text-foreground">{products.length}</span> din{' '}
              <span className="font-semibold text-foreground">{totalProducts}</span> produse
            </p>
            <p className="text-xs text-muted-foreground">Pagina {currentPage} din {totalPages}</p>
          </div>
          <ProductGrid products={products} />
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col gap-4 rounded-lg border border-border/70 bg-background p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="px-1 text-sm text-muted-foreground">
                Pagina {currentPage} din {totalPages}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => updatePage(currentPage - 1)} disabled={currentPage <= 1}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Anterioară
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .filter((page) => Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages)
                    .filter((page, index, pages) => page !== pages[index - 1])
                    .map((page, index, pages) => (
                      <div key={page} className="flex items-center gap-2">
                        {index > 0 && page - pages[index - 1] > 1 && <span className="px-1 text-muted-foreground">...</span>}
                        <Button
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updatePage(page)}
                          className="min-w-10"
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => updatePage(currentPage + 1)} disabled={currentPage >= totalPages}>
                  Următoare <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState title="Niciun produs în această categorie" actionLabel="Înapoi la magazin" actionHref="/shop" />
      )}
    </div>
  );
}
