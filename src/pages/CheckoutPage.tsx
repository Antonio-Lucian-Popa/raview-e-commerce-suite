import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/hooks/useCart';
import { CreditCard, Gift, Lock, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { formatLei, getProductLineTotalWithVat } from '@/lib/pricing';
import { getShippingCost } from '@/lib/shipping';

const schema = z.object({
  firstName: z.string().min(2, 'Prenumele este obligatoriu'),
  lastName: z.string().min(2, 'Numele este obligatoriu'),
  email: z.string().email('Email invalid'),
  phone: z.string().min(10, 'Telefon invalid'),
  address: z.string().min(5, 'Adresa este obligatorie'),
  city: z.string().min(2, 'Orașul este obligatoriu'),
  county: z.string().min(2, 'Județul este obligatoriu'),
  postalCode: z.string().min(4, 'Cod poștal invalid'),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['card', 'cash_on_delivery']),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Trebuie să accepți termenii și politica de retur.' }),
  }),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const shipping = getShippingCost(subtotal);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'card', acceptTerms: false },
  });
  const paymentMethod = watch('paymentMethod');
  const couponCode = watch('couponCode')?.trim() ?? '';
  const isWelcomeCoupon = couponCode.toUpperCase() === 'WELCOME10';
  const isClearanceProduct = (item: (typeof items)[number]) => {
    const searchable = `${item.product.category?.slug ?? ''} ${item.product.category?.name ?? ''} ${item.product.category?.parent?.slug ?? ''} ${item.product.category?.parent?.name ?? ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return searchable.includes('lichidare') && searchable.includes('stoc');
  };
  const welcomeEligibleSubtotal = items
    .filter((item) => !isClearanceProduct(item))
    .reduce((sum, item) => sum + getProductLineTotalWithVat(item.product, item.quantity), 0);
  const estimatedDiscount = isWelcomeCoupon
    ? Math.round(welcomeEligibleSubtotal * 10) / 100
    : 0;
  const total = Math.max(0, subtotal - estimatedDiscount) + shipping;

  useEffect(() => {
    if (searchParams.get('payment') === 'cancelled') {
      toast.error('Plata a fost anulată. Coșul tău a fost păstrat, poți încerca din nou.');
      searchParams.delete('payment');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: FormData) => {
    setProcessing(true);
    try {
      const order = await api.orders.create(
        data as import('@/types').CheckoutFormData,
        items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        shipping,
        data.paymentMethod,
      );

      if (data.paymentMethod === 'card') {
        const checkoutSession = await api.payments.createCheckoutSession({
          orderId: order.id,
          successUrl: `${window.location.origin}/order-success?orderId=${order.id}`,
          cancelUrl: `${window.location.origin}/checkout?payment=cancelled`,
        });

        if (!checkoutSession.checkoutUrl) {
          throw new Error('Stripe nu a returnat URL-ul de checkout.');
        }

        // Cart is cleared on OrderSuccessPage, not here — if the customer
        // cancels/fails the Stripe payment they land back on /checkout and
        // must still have their items to retry.
        window.location.assign(checkoutSession.checkoutUrl);
        return;
      }

      clearCart();
      navigate(`/order-success?orderId=${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'A apărut o eroare la plasarea comenzii. Încearcă din nou.');
    } finally {
      setProcessing(false);
    }
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

          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><CreditCard className="h-5 w-5" /> Metodă de Plată</h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setValue('paymentMethod', value as FormData['paymentMethod'], { shouldValidate: true })}
              className="grid gap-3"
            >
              <Label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:border-accent/60">
                <RadioGroupItem value="card" className="mt-1" />
                <CreditCard className="mt-0.5 h-5 w-5 text-accent" />
                <span>
                  <span className="block text-sm font-medium">Card online</span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Plată securizată prin Stripe.</span>
                </span>
              </Label>
              <Label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:border-accent/60">
                <RadioGroupItem value="cash_on_delivery" className="mt-1" />
                <Truck className="mt-0.5 h-5 w-5 text-accent" />
                <span>
                  <span className="block text-sm font-medium">Ramburs la curier</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Plătești numerar sau cu cardul la livrare, în funcție de curier.</span>
                </span>
              </Label>
            </RadioGroup>
            {errors.paymentMethod && <p className="text-xs text-destructive">Alege metoda de plată.</p>}
          </div>

          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Gift className="h-5 w-5" /> Cod de reducere</h3>
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm">
              <p className="font-medium text-foreground">Cadou de bun venit!</p>
              <p className="mt-1 text-muted-foreground">
                Beneficiați de 10% reducere la prima comandă folosind codul WELCOME10.
                Oferta nu se aplică produselor din categoria Lichidare de stoc.
              </p>
            </div>
            <div>
              <Label>Cod reducere</Label>
              <Input {...register('couponCode')} className="mt-1 uppercase" placeholder="WELCOME10" autoComplete="off" />
            </div>
            {isWelcomeCoupon && estimatedDiscount > 0 && (
              <p className="text-sm font-medium text-accent">Reducere estimată: {formatLei(estimatedDiscount)}</p>
            )}
            {isWelcomeCoupon && estimatedDiscount === 0 && (
              <p className="text-sm text-muted-foreground">Codul nu se aplică produselor din categoria Lichidare de stoc.</p>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="font-display font-semibold text-lg">Sumar Comandă</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img src={item.product.images[0]?.url || '/placeholder.svg'} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">{formatLei(getProductLineTotalWithVat(item.product, item.quantity))}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal cu TVA</span><span>{formatLei(subtotal)}</span></div>
              {estimatedDiscount > 0 && (
                <div className="flex justify-between text-accent"><span>Reducere WELCOME10</span><span>-{formatLei(estimatedDiscount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Livrare</span><span>{shipping === 0 ? 'Gratuită' : formatLei(shipping)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{formatLei(total)}</span></div>
              <p className="text-xs text-muted-foreground">Prețurile includ TVA. Reducerea este validată la plasarea comenzii.</p>
            </div>
            <div className="space-y-2">
              <Label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Checkbox
                  className="mt-0.5"
                  onCheckedChange={(checked) => setValue('acceptTerms', checked === true, { shouldValidate: true })}
                />
                <span>
                  Am citit și accept{' '}
                  <Link to="/terms" className="font-medium text-accent underline-offset-4 hover:underline">
                    Termenii și condițiile
                  </Link>
                  ,{' '}
                  <Link to="/returns" className="font-medium text-accent underline-offset-4 hover:underline">
                    Politica de retur
                  </Link>
                  {' '}și{' '}
                  <Link to="/privacy" className="font-medium text-accent underline-offset-4 hover:underline">
                    Politica de confidențialitate
                  </Link>
                  .
                </span>
              </Label>
              {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-gold-dark" size="lg" disabled={processing}>
              {processing ? 'Se procesează...' : paymentMethod === 'card' ? `Plătește online · ${formatLei(total)}` : `Comandă cu obligație de plată · ${formatLei(total)}`}
            </Button>
            <p className="text-xs text-center text-muted-foreground">Datele tale sunt protejate și securizate.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
