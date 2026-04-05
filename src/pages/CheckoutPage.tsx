import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/hooks/useCart';
import { CreditCard, Lock } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  firstName: z.string().min(2, 'Prenumele este obligatoriu'),
  lastName: z.string().min(2, 'Numele este obligatoriu'),
  email: z.string().email('Email invalid'),
  phone: z.string().min(10, 'Telefon invalid'),
  address: z.string().min(5, 'Adresa este obligatorie'),
  city: z.string().min(2, 'Orașul este obligatoriu'),
  county: z.string().min(2, 'Județul este obligatoriu'),
  postalCode: z.string().min(4, 'Cod poștal invalid'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + shipping;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    clearCart();
    navigate('/order-success');
  };

  if (items.length === 0) {
    return (
      <div className="container-page pb-16">
        <Breadcrumbs items={[{ label: 'Checkout' }]} />
        <EmptyState title="Coșul tău este gol" actionLabel="Mergi la magazin" actionHref="/shop" />
      </div>
    );
  }

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ label: 'Coș', href: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Date de Livrare</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Prenume *</Label>
                <Input {...register('firstName')} className="mt-1" />
                {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label>Nume *</Label>
                <Input {...register('lastName')} className="mt-1" />
                {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" {...register('email')} className="mt-1" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label>Telefon *</Label>
                <Input {...register('phone')} className="mt-1" />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
              </div>
            </div>
            <div>
              <Label>Adresă *</Label>
              <Input {...register('address')} className="mt-1" />
              {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Oraș *</Label>
                <Input {...register('city')} className="mt-1" />
                {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <Label>Județ *</Label>
                <Input {...register('county')} className="mt-1" />
                {errors.county && <p className="text-xs text-destructive mt-1">{errors.county.message}</p>}
              </div>
              <div>
                <Label>Cod poștal *</Label>
                <Input {...register('postalCode')} className="mt-1" />
                {errors.postalCode && <p className="text-xs text-destructive mt-1">{errors.postalCode.message}</p>}
              </div>
            </div>
            <div>
              <Label>Note comandă</Label>
              <Textarea {...register('notes')} className="mt-1" placeholder="Instrucțiuni speciale pentru livrare..." />
            </div>
          </div>

          {/* Payment placeholder */}
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><CreditCard className="h-5 w-5" /> Metodă de Plată</h3>
            <div className="bg-secondary rounded-lg p-4 flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Plată securizată prin Stripe</p>
                <p className="text-xs text-muted-foreground">Integrarea Stripe va fi configurată de echipa de backend.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-display font-semibold text-lg">Sumar Comandă</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">{item.product.price * item.quantity} lei</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{subtotal} lei</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Livrare</span><span>{shipping === 0 ? 'Gratuită' : `${shipping} lei`}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{total} lei</span></div>
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-gold-dark" size="lg" disabled={processing}>
              {processing ? 'Se procesează...' : `Plasează Comanda · ${total} lei`}
            </Button>
            <p className="text-xs text-center text-muted-foreground">Datele tale sunt protejate și securizate.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
