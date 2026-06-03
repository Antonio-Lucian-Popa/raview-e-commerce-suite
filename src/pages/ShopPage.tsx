import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, Filter, Grid3X3, SlidersHorizontal, X } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductGridSkeleton } from '@/components/LoadingSkeletons';
import { EmptyState } from '@/components/EmptyError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { getCategoryIcon } from '@/lib/category-icons';
import { formatLei } from '@/lib/pricing';
import { Category } from '@/types';

const DEFAULT_PRICE_MIN = 0;
const DEFAULT_PRICE_MAX = 10000;
const PRICE_STEP = 1;

function CategoryPill({
  category,
  active,
  onSelect,
}: {
  category?: Category;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = getCategoryIcon(category);
  const label = category?.name ?? 'Toate';
  const count = category?.productCount;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex min-h-24 w-full flex-col items-start justify-between overflow-hidden rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5 hover:border-accent/70 hover:bg-accent/5 hover:shadow-sm ${
        active
          ? 'border-accent bg-accent/10 text-foreground shadow-sm ring-1 ring-accent/20'
          : 'border-border/80 bg-card text-muted-foreground'
      }`}
      aria-pressed={active}
    >
      <span className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md ${
        active ? 'bg-accent text-accent-foreground' : 'bg-secondary text-foreground/75 group-hover:text-accent'
      }`}>
        <Icon className="h-5 w-5 stroke-[1.6]" />
      </span>
      <span className="line-clamp-2 min-h-9 text-xs font-semibold leading-tight text-foreground">{label}</span>
      <span className="mt-2 inline-flex items-center gap-1 text-[11px] leading-none text-muted-foreground">
        {active && <CheckCircle2 className="h-3 w-3 text-accent" />}
        {typeof count === 'number' ? `${count} produse` : active ? 'selectat' : 'catalog'}
      </span>
    </button>
  );
}

function parsePriceParam(value: string | null, fallback: number) {
  if (value == null || value.trim() === '') return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function clampPriceRange(min: number, max: number) {
  const clampedMin = Math.min(Math.max(DEFAULT_PRICE_MIN, min), DEFAULT_PRICE_MAX);
  const clampedMax = Math.min(Math.max(DEFAULT_PRICE_MIN, max), DEFAULT_PRICE_MAX);
  return clampedMin <= clampedMax ? [clampedMin, clampedMax] : [clampedMax, clampedMin];
}

function clampPriceControl(index: 0 | 1, value: number, range: number[]) {
  const nextValue = Math.min(Math.max(DEFAULT_PRICE_MIN, value), DEFAULT_PRICE_MAX);

  if (index === 0) {
    return [nextValue, range[1]];
  }

  return [range[0], nextValue];
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const selectedCategoryId = searchParams.get('categoryId') || '';
  const brandIdsParam = searchParams.get('brandIds') || '';
  const brandIdsFromUrl = useMemo(
    () => brandIdsParam.split(',').map((value) => value.trim()).filter(Boolean),
    [brandIdsParam],
  );
  const [selectedMinPrice, selectedMaxPrice] = clampPriceRange(
    parsePriceParam(searchParams.get('minPrice'), DEFAULT_PRICE_MIN),
    parsePriceParam(searchParams.get('maxPrice'), DEFAULT_PRICE_MAX),
  );
  const priceFilterActive = selectedMinPrice > DEFAULT_PRICE_MIN || selectedMaxPrice < DEFAULT_PRICE_MAX;
  const currentPage = Math.max(1, Number(searchParams.get('page') || '1'));
  const inStockParam = searchParams.get('inStock') === 'true';
  const pageSize = 12;
  const [sortBy, setSortBy] = useState('newest');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(brandIdsFromUrl);
  const [inStockOnly, setInStockOnly] = useState(inStockParam);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState(() => clampPriceRange(selectedMinPrice, selectedMaxPrice));

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'shop'],
    queryFn: () => api.categories.getAll(),
  });
  const { data: brands = [] } = useQuery({
    queryKey: ['brands', 'shop'],
    queryFn: () => api.brands.getAll(),
  });
  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      'products',
      'shop',
      currentPage,
      sortBy,
      selectedBrands,
      inStockOnly,
      searchQuery,
      selectedCategoryId,
      priceFilterActive ? selectedMinPrice : DEFAULT_PRICE_MIN,
      priceFilterActive ? selectedMaxPrice : DEFAULT_PRICE_MAX,
    ],
    queryFn: () =>
      api.products.getCatalogPage({
        page: currentPage,
        limit: pageSize,
        categoryId: selectedCategoryId || undefined,
        sortBy,
        brandIds: selectedBrands,
        inStock: inStockOnly,
        minPrice: selectedMinPrice > DEFAULT_PRICE_MIN ? selectedMinPrice : undefined,
        maxPrice: selectedMaxPrice < DEFAULT_PRICE_MAX ? selectedMaxPrice : undefined,
        search: searchQuery,
      }),
  });

  const products = productsData?.items ?? [];
  const totalProducts = productsData?.meta.total ?? 0;
  const totalPages = Math.max(1, productsData?.meta.totalPages ?? 1);
  const activeFilterCount = selectedBrands.length + (inStockOnly ? 1 : 0) + (selectedCategoryId ? 1 : 0) + (priceFilterActive ? 1 : 0);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const updatePage = useCallback((page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setPriceRange(clampPriceRange(selectedMinPrice, selectedMaxPrice));
  }, [selectedMinPrice, selectedMaxPrice]);

  useEffect(() => {
    setInStockOnly(inStockParam);
  }, [inStockParam]);

  useEffect(() => {
    setSelectedBrands(brandIdsFromUrl);
  }, [brandIdsFromUrl]);

  useEffect(() => {
    if (productsData && currentPage > totalPages) {
      updatePage(totalPages);
    }
  }, [currentPage, productsData, totalPages, updatePage]);

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

  const updateSort = (value: string) => {
    setSortBy(value);
    updatePage(1);
  };

  const toggleBrand = (brandId: string) => {
    const nextBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];
    const next = new URLSearchParams(searchParams);
    next.set('page', '1');

    if (nextBrands.length) {
      next.set('brandIds', nextBrands.join(','));
    } else {
      next.delete('brandIds');
    }

    setSelectedBrands(nextBrands);
    setSearchParams(next);
  };

  const updateStockOnly = (checked: boolean) => {
    setInStockOnly(checked);
    const next = new URLSearchParams(searchParams);
    next.set('page', '1');
    if (checked) {
      next.set('inStock', 'true');
    } else {
      next.delete('inStock');
    }
    setSearchParams(next);
  };

  const updatePriceFilter = (range: number[]) => {
    const [min, max] = clampPriceRange(range[0] ?? DEFAULT_PRICE_MIN, range[1] ?? DEFAULT_PRICE_MAX);
    const next = new URLSearchParams(searchParams);
    next.set('page', '1');

    if (min > DEFAULT_PRICE_MIN) {
      next.set('minPrice', String(min));
    } else {
      next.delete('minPrice');
    }

    if (max < DEFAULT_PRICE_MAX) {
      next.set('maxPrice', String(max));
    } else {
      next.delete('maxPrice');
    }

    setSearchParams(next);
  };

  const updatePriceInput = (index: 0 | 1, value: string) => {
    const nextValue = value === '' ? (index === 0 ? DEFAULT_PRICE_MIN : DEFAULT_PRICE_MAX) : Number(value);
    if (!Number.isFinite(nextValue)) return;

    setPriceRange(clampPriceControl(index, nextValue, priceRange));
  };

  const resetPriceFilter = () => {
    setPriceRange([DEFAULT_PRICE_MIN, DEFAULT_PRICE_MAX]);
    updatePriceFilter([DEFAULT_PRICE_MIN, DEFAULT_PRICE_MAX]);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setInStockOnly(false);
    const next = new URLSearchParams(searchParams);
    next.delete('categoryId');
    next.delete('brandIds');
    next.delete('inStock');
    next.delete('minPrice');
    next.delete('maxPrice');
    next.set('page', '1');
    setSearchParams(next);
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold">Branduri</h4>
            <p className="mt-0.5 text-xs text-muted-foreground">Alege producătorii preferați.</p>
          </div>
          {selectedBrands.length > 0 && (
            <span className="rounded-full bg-accent/10 px-2 py-1 text-[11px] font-semibold text-accent">
              {selectedBrands.length}
            </span>
          )}
        </div>
        <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
          {brands.map((brand) => (
            <label key={brand.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary/70">
              <Checkbox checked={selectedBrands.includes(brand.id)} onCheckedChange={() => toggleBrand(brand.id)} />
              <span className="leading-none">{brand.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="font-semibold text-sm">Preț</h4>
          {priceFilterActive && (
            <button type="button" onClick={resetPriceFilter} className="text-xs font-medium text-accent">
              Resetează
            </button>
          )}
        </div>
        <div className="rounded-lg border border-border/70 bg-secondary/20 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="mb-1 block text-[11px] text-muted-foreground">De la</span>
              <Input
                type="number"
                min={DEFAULT_PRICE_MIN}
                max={DEFAULT_PRICE_MAX}
                step={PRICE_STEP}
                value={priceRange[0]}
                onChange={(event) => updatePriceInput(0, event.target.value)}
                onBlur={() => updatePriceFilter(priceRange)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') updatePriceFilter(priceRange);
                }}
                className="h-9"
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] text-muted-foreground">Până la</span>
              <Input
                type="number"
                min={DEFAULT_PRICE_MIN}
                max={DEFAULT_PRICE_MAX}
                step={PRICE_STEP}
                value={priceRange[1]}
                onChange={(event) => updatePriceInput(1, event.target.value)}
                onBlur={() => updatePriceFilter(priceRange)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') updatePriceFilter(priceRange);
                }}
                className="h-9"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {formatLei(priceRange[0])} - {formatLei(priceRange[1])}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={inStockOnly} onCheckedChange={(checked) => updateStockOnly(Boolean(checked))} />
          <span className="font-medium">Doar în stoc</span>
        </label>
        <p className="mt-2 text-xs text-muted-foreground">Arată doar produsele disponibile rapid.</p>
      </div>

      {(selectedBrands.length > 0 || inStockOnly || selectedCategoryId || priceFilterActive) && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full justify-center"
        >
          <X className="h-3 w-3 mr-1" /> Resetează filtre
        </Button>
      )}
    </div>
  );

  return (
    <div className="bg-surface pb-16">
      <div className="container-page">
        <Breadcrumbs items={[{ label: 'Magazin' }]} />
        <div className="mb-8 rounded-lg border border-border/70 bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                <Grid3X3 className="h-3.5 w-3.5" />
                Magazin Ravlux
              </div>
              <h1 className="text-3xl font-display font-bold sm:text-4xl">
                {searchQuery ? `Rezultate pentru "${searchQuery}"` : selectedCategory?.name ?? 'Toate Produsele'}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {totalProducts} produse pentru proiecte de iluminat, cu filtre rapide pentru brand, buget și disponibilitate.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="outline" size="sm" className="justify-center lg:hidden" onClick={() => setFiltersOpen(!filtersOpen)}>
                <SlidersHorizontal className="h-4 w-4 mr-1" /> Filtre
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{activeFilterCount}</span>
                )}
              </Button>
              <Select value={sortBy} onValueChange={updateSort}>
                <SelectTrigger className="h-10 w-full bg-background sm:w-48">
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
        </div>

        <section className="mb-8 rounded-lg border border-border/70 bg-background p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold">Alege categoria</h2>
              <p className="text-sm text-muted-foreground">Intră direct în familia de produse potrivită proiectului tău.</p>
            </div>
            {selectedCategory && (
              <Button variant="ghost" size="sm" onClick={() => updateCategory('')} className="w-fit">
                <X className="mr-1 h-3.5 w-3.5" /> Toate produsele
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            <CategoryPill active={!selectedCategoryId} onSelect={() => updateCategory('')} />
            {categories.map((category) => (
              <CategoryPill
                key={category.id}
                category={category}
                active={selectedCategoryId === category.id}
                onSelect={() => updateCategory(selectedCategoryId === category.id ? '' : category.id)}
              />
            ))}
          </div>
        </section>

        <div className="flex gap-8">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold">Filtre</h3>
                </div>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <FiltersContent />
            </div>
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

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-col gap-2 rounded-lg border border-border/70 bg-background px-4 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground">
                Afișăm <span className="font-semibold text-foreground">{products.length}</span> din{' '}
                <span className="font-semibold text-foreground">{totalProducts}</span> produse
              </p>
              <p className="text-xs text-muted-foreground">Pagina {currentPage} din {totalPages}</p>
            </div>

            {isLoading ? (
              <ProductGridSkeleton />
            ) : products.length > 0 ? (
              <>
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
              <div className="rounded-lg border border-border/70 bg-background p-6 shadow-sm">
                <EmptyState title="Niciun produs găsit" description="Încearcă să modifici filtrele sau termenul de căutare." />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
