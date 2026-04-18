import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Grid3X3, SlidersHorizontal, X } from 'lucide-react';
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
const PRICE_STEP = 50;

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
      className={`group flex min-h-28 w-full flex-col items-center justify-between rounded-lg border px-3 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-accent/70 hover:bg-accent/5 ${
        active
          ? 'border-accent bg-accent/10 text-foreground shadow-sm'
          : 'border-border/80 bg-background text-muted-foreground'
      }`}
      aria-pressed={active}
    >
      <Icon className={`mb-2 h-7 w-7 stroke-[1.4] ${active ? 'text-accent' : 'text-foreground/75 group-hover:text-accent'}`} />
      <span className="line-clamp-2 min-h-9 text-xs font-semibold leading-tight text-foreground">{label}</span>
      <span className="mt-1 text-[11px] leading-none text-muted-foreground">
        {typeof count === 'number' ? `${count} produse` : active ? 'selectat' : 'categorie'}
      </span>
    </button>
  );
}

function parsePriceParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function clampPriceRange(min: number, max: number) {
  const clampedMin = Math.min(Math.max(DEFAULT_PRICE_MIN, min), DEFAULT_PRICE_MAX);
  const clampedMax = Math.min(Math.max(DEFAULT_PRICE_MIN, max), DEFAULT_PRICE_MAX);
  const [nextMin, nextMax] = clampedMin <= clampedMax ? [clampedMin, clampedMax] : [clampedMax, clampedMin];

  if (nextMax - nextMin >= PRICE_STEP) {
    return [nextMin, nextMax];
  }

  if (nextMin <= DEFAULT_PRICE_MIN) {
    return [DEFAULT_PRICE_MIN, PRICE_STEP];
  }

  return [Math.max(DEFAULT_PRICE_MIN, nextMax - PRICE_STEP), nextMax];
}

function clampPriceControl(index: 0 | 1, value: number, range: number[]) {
  if (index === 0) {
    return [Math.min(Math.max(DEFAULT_PRICE_MIN, value), range[1] - PRICE_STEP), range[1]];
  }

  return [range[0], Math.max(Math.min(DEFAULT_PRICE_MAX, value), range[0] + PRICE_STEP)];
}

function getRangePercent(value: number) {
  return ((value - DEFAULT_PRICE_MIN) / (DEFAULT_PRICE_MAX - DEFAULT_PRICE_MIN)) * 100;
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

  const updatePriceSlider = (index: 0 | 1, value: string) => {
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue)) return;

    setPriceRange(clampPriceControl(index, nextValue, priceRange));
  };

  const commitPriceSlider = (index: 0 | 1, value: string) => {
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue)) return;

    const nextRange = clampPriceControl(index, nextValue, priceRange);
    setPriceRange(nextRange);
    updatePriceFilter(nextRange);
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
      <div>
        <h4 className="mb-3 text-sm font-semibold">Categorii</h4>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateCategory('')}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
              !selectedCategoryId ? 'bg-accent/10 font-semibold text-foreground' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <span>Toate categoriile</span>
            <Grid3X3 className="h-4 w-4" />
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateCategory(selectedCategoryId === category.id ? '' : category.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                selectedCategoryId === category.id ? 'bg-accent/10 font-semibold text-foreground' : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <span className="line-clamp-1">{category.name}</span>
              {(() => {
                const Icon = getCategoryIcon(category);
                return <Icon className="h-4 w-4 shrink-0" />;
              })()}
            </button>
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
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="font-semibold text-sm">Preț</h4>
          {priceFilterActive && (
            <button type="button" onClick={resetPriceFilter} className="text-xs font-medium text-accent">
              Resetează
            </button>
          )}
        </div>
        <div className="rounded-lg border border-border/70 bg-secondary/20 p-3">
          <div className="py-3">
            <div className="relative h-7">
              <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-secondary" />
              <div
                className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary"
                style={{
                  left: `${getRangePercent(priceRange[0])}%`,
                  right: `${100 - getRangePercent(priceRange[1])}%`,
                }}
              />
              <input
                type="range"
                min={DEFAULT_PRICE_MIN}
                max={DEFAULT_PRICE_MAX}
                step={PRICE_STEP}
                value={priceRange[0]}
                onChange={(event) => updatePriceSlider(0, event.target.value)}
                onMouseUp={(event) => commitPriceSlider(0, event.currentTarget.value)}
                onTouchEnd={(event) => commitPriceSlider(0, event.currentTarget.value)}
                onBlur={(event) => commitPriceSlider(0, event.currentTarget.value)}
                aria-label="Preț minim"
                className="pointer-events-none absolute left-0 top-0 z-20 h-7 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-sm [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm"
              />
              <input
                type="range"
                min={DEFAULT_PRICE_MIN}
                max={DEFAULT_PRICE_MAX}
                step={PRICE_STEP}
                value={priceRange[1]}
                onChange={(event) => updatePriceSlider(1, event.target.value)}
                onMouseUp={(event) => commitPriceSlider(1, event.currentTarget.value)}
                onTouchEnd={(event) => commitPriceSlider(1, event.currentTarget.value)}
                onBlur={(event) => commitPriceSlider(1, event.currentTarget.value)}
                aria-label="Preț maxim"
                className="pointer-events-none absolute left-0 top-0 z-30 h-7 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-sm [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm"
              />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
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

      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={inStockOnly} onCheckedChange={(checked) => updateStockOnly(Boolean(checked))} />
          Doar în stoc
        </label>
      </div>

      {(selectedBrands.length > 0 || inStockOnly || selectedCategoryId || priceFilterActive) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
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

      <section className="mb-8 border-y border-border/80 py-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
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
