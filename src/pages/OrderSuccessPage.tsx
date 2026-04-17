import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderLabel = orderId ? `#${orderId.slice(-8).toUpperCase()}` : null;

  return (
    <div className="container-page py-20">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-display font-bold">Comanda a fost plasată!</h1>
        <p className="text-muted-foreground">
          Mulțumim pentru comanda ta! Vei primi un email de confirmare în câteva minute cu toate detaliile comenzii.
        </p>
        {orderLabel && <p className="text-sm text-muted-foreground">Nr. Comandă: {orderLabel}</p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button className="bg-accent text-accent-foreground hover:bg-gold-dark" asChild>
            <Link to="/shop">Continuă cumpărăturile <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          {orderId && (
            <Button variant="outline" asChild>
              <Link to={`/track-order?orderId=${orderId}`}>Urmărește comanda</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/">Pagina principală</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
