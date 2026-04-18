import { Link } from 'react-router-dom';
import { Minus, Plus, X, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatLei, getProductLineTotalWithVat } from '@/lib/pricing';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [coupon, setCoupon] = useState('');
  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-page pb-16">
        <Breadcrumbs items={[{ label: 'Coș' }]} />
        <EmptyState title="Coșul tău este gol" description="Adaugă produse pentru a continua." actionLabel="Mergi la magazin" actionHref="/shop" />
      </div>
    );
  }

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ label: 'Coș' }]} />
      <h1 className="text-3xl font-display font-bold mb-8">Coșul Tău</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="flex gap-4 p-4 rounded-lg border">
              <Link to={`/product/${item.product.slug}`} className="w-24 h-24 rounded-md overflow-hidden shrink-0">
                <img src={item.product.images[0]?.url || '/placeholder.svg'} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product.slug}`} className="font-medium hover:text-accent transition-colors line-clamp-1">
                  {item.product.name}
                </Link>
                <p className="text-xs text-muted-foreground">{item.product.brand?.name} · {item.product.sku}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border rounded-md">
                    <button className="p-2 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button
                      className="p-2 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= (item.product.stock > 0 ? item.product.stock : 99)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-semibold">{formatLei(getProductLineTotalWithVat(item.product, item.quantity))}</span>
                </div>
              </div>
              <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive self-start">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-display font-semibold text-lg">Sumar Comandă</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal cu TVA</span><span>{formatLei(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Livrare</span><span>{shipping === 0 ? 'Gratuită' : formatLei(shipping)}</span></div>
              {shipping > 0 && <p className="text-xs text-accent">Mai adaugă {formatLei(500 - subtotal)} pentru livrare gratuită!</p>}
              <p className="text-xs text-muted-foreground">Prețurile includ TVA 21%.</p>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Cod cupon" value={coupon} onChange={e => setCoupon(e.target.value)} />
              <Button variant="outline" onClick={() => toast.info('Funcționalitate cupon în dezvoltare.')}>Aplică</Button>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4">
              <span>Total</span><span>{formatLei(total)}</span>
            </div>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-gold-dark" size="lg" asChild>
              <Link to="/checkout">Continuă spre Checkout <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
