import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { formatLei, getProductLineTotalWithVat } from '@/lib/pricing';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-foreground/40" onClick={() => setIsOpen(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Coșul tău ({totalItems})
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="font-medium">Coșul tău este gol</p>
            <p className="text-sm text-muted-foreground mt-1">Adaugă produse pentru a continua.</p>
            <Button className="mt-6" onClick={() => setIsOpen(false)} asChild>
              <Link to="/shop">Vezi produsele</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3 p-3 rounded-lg border">
                  <img src={item.product.images[0]?.url || '/placeholder.svg'} alt={item.product.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="text-sm font-medium line-clamp-2 hover:text-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.product.brand?.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 border rounded">
                        <button className="p-1 transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          className="p-1 transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product.stock > 0 ? item.product.stock : 99)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-semibold text-sm">{formatLei(getProductLineTotalWithVat(item.product, item.quantity))}</span>
                    </div>
                  </div>
                  <button className="self-start text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeItem(item.product.id)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t space-y-3">
              <div className="flex items-center justify-between font-semibold">
                <span>Subtotal</span>
                <span>{formatLei(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Prețurile includ TVA 21%.</p>
              <p className="text-xs text-muted-foreground">Livrarea se calculează la checkout.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                  <Link to="/cart">Vezi coșul</Link>
                </Button>
                <Button className="bg-accent text-accent-foreground hover:bg-gold-dark" asChild onClick={() => setIsOpen(false)}>
                  <Link to="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
