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
    queryKey: ['products', 'related', product?.categorySlug, product?.id],
    queryFn: () => api.products.getRelated(product!.categorySlug, product!.id),
    enabled: !!product,
  });

  if (isLoading) return <PageSkeleton />;
  if (error || !product) return <ErrorState message="Produsul nu a fost găsit." />;

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[
        { label: 'Magazin', href: '/shop' },
        { label: product.category, href: `/category/${product.categorySlug}` },
        { label: product.name },
      ]} />

      {/* Product JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.images,
        description: product.shortDescription,
        sku: product.sku,
        brand: { "@type": "Brand", name: product.brand },
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "RON",
          availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      })}} />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
            <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-accent' : 'border-transparent hover:border-border'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">{product.brand}</span>
              <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">{product.name}</h1>
            {product.badges.length > 0 && (
              <div className="flex gap-2 mt-3">
                {product.badges.map(b => (
                  <Badge key={b} variant={b === 'sale' ? 'destructive' : 'default'}>
                    {b === 'new' ? 'Nou' : b === 'sale' ? 'Reducere' : 'Bestseller'}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{product.price} lei</span>
            {product.oldPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">{product.oldPrice} lei</span>
                <Badge variant="destructive">-{product.discount}%</Badge>
              </>
            )}
          </div>

          <p className="text-muted-foreground">{product.shortDescription}</p>

          <div className="flex items-center gap-2">
            {product.inStock ? (
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium"><Check className="h-4 w-4" /> În stoc ({product.stockCount} buc.)</span>
            ) : (
              <span className="text-sm text-destructive font-medium">Stoc epuizat</span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border rounded-md">
              <button className="p-3 hover:bg-secondary transition-colors" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button className="p-3 hover:bg-secondary transition-colors" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1 bg-accent text-accent-foreground hover:bg-gold-dark"
              disabled={!product.inStock}
              onClick={() => addItem(product, quantity)}
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> Adaugă în coș
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
          <p>{product.description}</p>
        </TabsContent>
        <TabsContent value="specs" className="mt-6">
          <div className="max-w-lg">
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} className="flex justify-between py-3 border-b last:border-0 text-sm">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium">{val}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="delivery" className="mt-6 text-sm text-muted-foreground space-y-3">
          <p><strong>Livrare:</strong> Livrare în 2-5 zile lucrătoare. Gratuită pentru comenzi peste 500 lei.</p>
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
          <span className="font-bold">{product.price} lei</span>
          {product.oldPrice && <span className="text-xs text-muted-foreground line-through ml-1">{product.oldPrice} lei</span>}
        </div>
        <Button
          className="flex-1 bg-accent text-accent-foreground hover:bg-gold-dark"
          disabled={!product.inStock}
          onClick={() => addItem(product, quantity)}
        >
          <ShoppingBag className="h-4 w-4 mr-2" /> Adaugă în coș
        </Button>
      </div>
    </div>
  );
}
