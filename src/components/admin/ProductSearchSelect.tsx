import { UIEvent, useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type ProductSearchSelectProps = {
  token: string;
  value: string;
  onValueChange: (value: string) => void;
};

const PAGE_SIZE = 30;

export function ProductSearchSelect({ token, value, onValueChange }: ProductSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const productsQuery = useInfiniteQuery({
    queryKey: ['admin', 'products', 'promotion-selector', debouncedSearch],
    queryFn: ({ pageParam }) => api.products.adminGetAll(token, {
      page: pageParam,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
    enabled: Boolean(token) && open,
  });

  const selectedProductQuery = useQuery({
    queryKey: ['product', value],
    queryFn: () => api.products.getById(value),
    enabled: Boolean(value),
  });

  const products = useMemo(() => {
    const unique = new Map<string, NonNullable<typeof selectedProductQuery.data>>();
    for (const page of productsQuery.data?.pages ?? []) {
      for (const product of page.items) unique.set(product.id, product);
    }
    if (selectedProductQuery.data) unique.set(selectedProductQuery.data.id, selectedProductQuery.data);
    return [...unique.values()];
  }, [productsQuery.data, selectedProductQuery.data]);

  const selectedProduct = products.find((product) => product.id === value) ?? selectedProductQuery.data;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
    if (isNearBottom && productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
      void productsQuery.fetchNextPage();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="mt-1.5 w-full justify-between font-normal"
        >
          <span className="truncate">
            {selectedProduct ? `${selectedProduct.name} · ${selectedProduct.sku}` : 'Caută și alege produsul'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Caută după nume sau SKU..."
          />
          <CommandList onScroll={handleScroll} className="max-h-72">
            {!productsQuery.isLoading && products.length === 0 && (
              <CommandEmpty>Nu am găsit niciun produs.</CommandEmpty>
            )}
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => {
                    onValueChange(product.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === product.id ? 'opacity-100' : 'opacity-0')} />
                  <span className="min-w-0 flex-1 truncate">{product.name}</span>
                  <span className="ml-3 shrink-0 text-xs text-muted-foreground">{product.sku}</span>
                </CommandItem>
              ))}
              {(productsQuery.isLoading || productsQuery.isFetchingNextPage) && (
                <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă...
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
