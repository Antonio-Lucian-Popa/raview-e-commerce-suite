import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, ShoppingBag, Truck, Shield, RotateCcw, Check } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductGrid } from '@/components/ProductGrid';
import { PageSkeleton } from '@/components/LoadingSkeletons';
import { ErrorState } from '@/components/EmptyError';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import { api } from '@/lib/api';
import {
  formatLei,
  getProductLineTotalWithVat,
  getProductOldPriceWithVat,
  getProductPriceWithVat,
  getProductPriceWithoutVat,
  getVatLabel,
} from '@/lib/pricing';
import { Product } from '@/types';

const hiddenSpecKeys = new Set([
  'source',
  'sourceRow',
  'resourceLinks',
  'attributes',
  'importedFrom',
  'importRow',
]);

const specLabels: Record<string, string> = {
  productCode: 'Cod produs',
  code: 'Cod produs',
  material: 'Material',
  color: 'Culoare',
  colour: 'Culoare',
  finish: 'Finisaj',
  power: 'Putere',
  voltage: 'Tensiune',
  dimensions: 'Dimensiuni',
  diameter: 'Diametru',
  height: 'Înălțime',
  width: 'Lățime',
  length: 'Lungime',
  protection: 'Protecție',
  warranty: 'Garanție',
};

function formatSpecLabel(key: string) {
  return specLabels[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

function formatSpecValue(value: unknown) {
  if (value == null || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map(formatSpecValue)
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

function getDisplaySpecs(product: Product) {
  const baseSpecs = [
    { label: 'Cod produs', value: product.specs?.productCode ?? product.sku },
    { label: 'Brand', value: product.brand?.name },
    { label: 'Categorie', value: product.category?.name },
    { label: 'Disponibilitate', value: product.stock > 0 ? `În stoc (${product.stock} buc.)` : 'Stoc epuizat' },
  ];

  const extraSpecs = Object.entries(product.specs ?? {})
    .filter(([key]) => !hiddenSpecKeys.has(key) && key !== 'productCode')
    .map(([key, value]) => ({
      label: formatSpecLabel(key),
      value: formatSpecValue(value),
    }))
    .filter((item) => item.value);

  return [...baseSpecs, ...extraSpecs].filter((item) => item.value);
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.products.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ['products', 'related', product?.categoryId, product?.id],
    queryFn: () => api.products.getRelated(product!.categoryId, product!.id),
    enabled: !!product,
  });

  if (isLoading) return <PageSkeleton />;
  if (error || !product) return <ErrorState message="Produsul nu a fost găsit." />;

  const displaySpecs = getDisplaySpecs(product);
  const canIncreaseQuantity = product.stock > 0 && quantity < product.stock;
  const canDecreaseQuantity = quantity > 1;
  const priceWithoutVat = getProductPriceWithoutVat(product);
  const priceWithVat = getProductPriceWithVat(product);
  const oldPriceWithVat = getProductOldPriceWithVat(product);
  const lineTotalWithVat = getProductLineTotalWithVat(product, quantity);

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[
        { label: 'Magazin', href: '/shop' },
        { label: product.category?.name ?? 'Categorie', href: `/category/${product.category?.slug}` },
        { label: product.name },
      ]} />

      {/* Product JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.images.map((image) => image.url),
        description: product.description,
        sku: product.sku,
        brand: { "@type": "Brand", name: product.brand?.name },
        offers: {
          "@type": "Offer",
          price: Number(priceWithVat.toFixed(2)),
          priceCurrency: "RON",
          availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      })}} />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
            <img src={product.images[selectedImage]?.url ?? '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-accent' : 'border-transparent hover:border-border'}`}
                >
                  <img src={img.url} alt={img.alt ?? ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">{product.brand?.name}</span>
              <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">{product.name}</h1>
            {(product.isNew || product.bestseller || (product.oldPrice && product.oldPrice > product.price)) && (
              <div className="flex gap-2 mt-3">
                {product.isNew && <Badge>Nou</Badge>}
                {product.oldPrice && product.oldPrice > product.price && <Badge variant="destructive">Reducere</Badge>}
                {product.bestseller && <Badge variant="secondary">Bestseller</Badge>}
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatLei(priceWithVat)}</span>
            {oldPriceWithVat && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatLei(oldPriceWithVat)}</span>
                <Badge variant="destructive">-{Math.round((1 - priceWithVat / oldPriceWithVat) * 100)}%</Badge>
              </>
            )}
          </div>
          <div className="rounded-lg border border-border/70 bg-secondary/30 px-4 py-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Preț fără TVA</span>
              <span className="font-medium">{formatLei(priceWithoutVat)}</span>
            </div>
            <div className="mt-1 flex justify-between gap-4 font-semibold">
              <span>Total cu TVA 21%</span>
              <span>{formatLei(priceWithVat)}</span>
            </div>
          </div>

          <p className="text-muted-foreground">{product.seoDescription || product.description}</p>

          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium"><Check className="h-4 w-4" /> În stoc ({product.stock} buc.)</span>
            ) : (
              <span className="text-sm text-destructive font-medium">Stoc epuizat</span>
            )}
          </div>

          <div className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-medium text-foreground">
            Termen de livrare: 2-3 săptămâni
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border rounded-md">
              <button
                className="p-3 transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!canDecreaseQuantity}
                aria-label="Scade cantitatea"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                className="p-3 transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={!canIncreaseQuantity}
                aria-label="Crește cantitatea"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1 bg-accent text-accent-foreground hover:bg-gold-dark"
              disabled={product.stock <= 0}
              onClick={() => addItem(product, quantity)}
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> Adaugă în coș · {formatLei(lineTotalWithVat)}
            </Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t">
            {[
              { icon: Truck, label: 'Livrare rapidă' },
              { icon: Shield, label: 'Garanție 2 ani' },
              { icon: RotateCcw, label: 'Retur 30 zile' },
            ].map(b => (
              <div key={b.label} className="flex flex-col items-center gap-1 text-center">
                <b.icon className="h-5 w-5 text-accent" />
                <span className="text-xs text-muted-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mb-16">
        <TabsList>
          <TabsTrigger value="description">Descriere</TabsTrigger>
          <TabsTrigger value="specs">Specificații</TabsTrigger>
          <TabsTrigger value="delivery">Livrare & Plată</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="prose prose-sm max-w-none mt-6">
          <p>{product.description || 'Descriere indisponibilă momentan.'}</p>
        </TabsContent>
        <TabsContent value="specs" className="mt-6">
          <div className="max-w-lg">
            {displaySpecs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-6 py-3 border-b last:border-0 text-sm">
                <span className="text-muted-foreground">{spec.label}</span>
                <span className="text-right font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="delivery" className="mt-6 text-sm text-muted-foreground space-y-3">
          <p><strong>Livrare:</strong> Livrare în 2-3 săptămâni. Gratuită pentru comenzi peste 500 lei.</p>
          <p><strong>Plată:</strong> Card bancar, transfer bancar, ramburs la livrare.</p>
          <p><strong>Retur:</strong> 30 de zile de la primirea produsului, în ambalajul original.</p>
        </TabsContent>
      </Tabs>

      {/* Related */}
      {related && related.length > 0 && (
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Produse Similare</h2>
          <ProductGrid products={related} />
        </section>
      )}

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-3 flex items-center gap-3 lg:hidden z-40">
        <div>
          <span className="font-bold">{formatLei(priceWithVat)}</span>
          {oldPriceWithVat && <span className="text-xs text-muted-foreground line-through ml-1">{formatLei(oldPriceWithVat)}</span>}
          <p className="text-[11px] text-muted-foreground">{getVatLabel()}</p>
        </div>
        <Button
          className="flex-1 bg-accent text-accent-foreground hover:bg-gold-dark"
          disabled={product.stock <= 0}
          onClick={() => addItem(product, quantity)}
        >
          <ShoppingBag className="h-4 w-4 mr-2" /> Adaugă în coș
        </Button>
      </div>
    </div>
  );
}
