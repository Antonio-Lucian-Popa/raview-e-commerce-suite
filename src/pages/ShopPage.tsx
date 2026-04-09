import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductGridSkeleton } from '@/components/LoadingSkeletons';
import { EmptyState } from '@/components/EmptyError';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const selectedCategoryId = searchParams.get('categoryId') || '';
  const currentPage = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = 12;
  const [sortBy, setSortBy] = useState('newest');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'shop'],
    queryFn: () => api.categories.getAll(),
  });
  const { data: brands = [] } = useQuery({
    queryKey: ['brands', 'shop'],
    queryFn: () => api.brands.getAll(),
  });
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', 'shop', currentPage, sortBy, selectedBrands, inStockOnly, searchQuery, selectedCategoryId],
    queryFn: () =>
      api.products.getCatalogPage({
        page: currentPage,
        limit: pageSize,
        categoryId: selectedCategoryId || undefined,
        sortBy,
        brandIds: selectedBrands,
        inStock: inStockOnly,
        search: searchQuery,
      }),
  });

  const products = productsData?.items ?? [];
  const totalProducts = productsData?.meta.total ?? 0;
  const totalPages = Math.max(1, productsData?.meta.totalPages ?? 1);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  useEffect(() => {
    if (productsData && currentPage > totalPages) {
      updatePage(totalPages);
    }
  }, [currentPage, productsData, totalPages]);

  const updateCategory = (categoryId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', '1');
    if (categoryId) {
      next.set('categoryId', categoryId);
    } else {
      next.delete('categoryId');
    }
    setSearchParams(next);
  };

  const updatePage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    setSearchParams(next);
  };

  const updateSort = (value: string) => {
    setSortBy(value);
    updatePage(1);
  };

  const toggleBrand = (brandId: string) => {
    setSelectedBrands((prev) => {
      const next = prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId];
      updatePage(1);
      return next;
    });
  };

  const updateStockOnly = (checked: boolean) => {
    setInStockOnly(checked);
    updatePage(1);
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-sm mb-3">Categorii</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={!selectedCategoryId} onCheckedChange={() => updateCategory('')} />
            Toate categoriile
          </label>
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selectedCategoryId === category.id}
                onCheckedChange={() => updateCategory(selectedCategoryId === category.id ? '' : category.id)}
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-3">Branduri</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={selectedBrands.includes(brand.id)} onCheckedChange={() => toggleBrand(brand.id)} />
              {brand.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={inStockOnly} onCheckedChange={(checked) => updateStockOnly(Boolean(checked))} />
          Doar în stoc
        </label>
      </div>

      {(selectedBrands.length > 0 || inStockOnly || selectedCategoryId) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedBrands([]);
            setInStockOnly(false);
            updateCategory('');
            updatePage(1);
          }}
        >
          <X className="h-3 w-3 mr-1" /> Resetează filtre
        </Button>
      )}
    </div>
  );

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ label: 'Magazin' }]} />
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            {searchQuery ? `Rezultate pentru "${searchQuery}"` : selectedCategory?.name ?? 'Toate Produsele'}
          </h1>
          <p className="text-muted-foreground mt-1">{totalProducts} produse</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(!filtersOpen)}>
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filtre
          </Button>
          <Select value={sortBy} onValueChange={updateSort}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Cele mai noi</SelectItem>
              <SelectItem value="price-asc">Preț crescător</SelectItem>
              <SelectItem value="price-desc">Preț descrescător</SelectItem>
              <SelectItem value="name">Alfabetic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <FiltersContent />
        </aside>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-foreground/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-background shadow-2xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Filtre</h3>
                <Button variant="ghost" size="icon" onClick={() => setFiltersOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FiltersContent />
            </div>
          </div>
        )}

        <div className="flex-1">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Pagina {currentPage} din {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => updatePage(currentPage - 1)} disabled={currentPage <= 1}>
                      Anterioară
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
                      Următoare
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Niciun produs găsit" description="Încearcă să modifici filtrele sau termenul de căutare." />
          )}
        </div>
      </div>
    </div>
  );
}
