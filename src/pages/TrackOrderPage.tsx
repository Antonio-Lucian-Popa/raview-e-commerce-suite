import { FormEvent, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Clock3, PackageCheck, Search, Truck } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { Order } from '@/types';

const steps = [
  { key: 'pending', label: 'Comandă primită', icon: Clock3 },
  { key: 'paid', label: 'Plată confirmată', icon: CheckCircle2 },
  { key: 'processing', label: 'În pregătire', icon: PackageCheck },
  { key: 'shipped', label: 'Trimisă', icon: Truck },
  { key: 'delivered', label: 'Livrată', icon: CheckCircle2 },
];

const statusOrder = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

function formatMoney(value?: number | string | null) {
  const amount = Number(value ?? 0);
  return `${amount.toFixed(Number.isInteger(amount) ? 0 : 2)} lei`;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCurrentStep(order?: Order) {
  if (!order) return 0;
  if (order.status === 'cancelled' || order.status === 'refunded') return 0;
  return Math.max(0, statusOrder.indexOf(order.status));
}

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderId') ?? '');
  const [contact, setContact] = useState('');

  const trackingMutation = useMutation({
    mutationFn: () => api.orders.track(orderNumber, contact),
  });

  const order = trackingMutation.data;
  const currentStep = useMemo(() => getCurrentStep(order), [order]);
  const customer = order?.customerSnapshot ?? order?.customer;
  const address = order?.addressSnapshot;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    trackingMutation.mutate();
  };

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ label: 'Urmărește comanda' }]} />

      <section className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Comanda ta</p>
          <h1 className="mt-3 font-display text-3xl font-bold">Verifică rapid statusul comenzii</h1>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Introdu numărul comenzii și emailul sau telefonul folosit la checkout. Nu ai nevoie de cont.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl bg-background p-4 text-foreground">
            <div>
              <Label>Număr comandă</Label>
              <Input
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="Ex: #DDUOBS2Z sau ID complet"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label>Email sau telefon</Label>
              <Input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="Emailul sau telefonul din comandă"
                className="mt-1.5"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-gold-dark" disabled={trackingMutation.isPending}>
              <Search className="mr-2 h-4 w-4" />
              {trackingMutation.isPending ? 'Se caută...' : 'Caută comanda'}
            </Button>
            {trackingMutation.isError && (
              <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {trackingMutation.error instanceof Error ? trackingMutation.error.message : 'Nu am găsit comanda.'}
              </p>
            )}
          </form>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          {!order ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <PackageCheck className="h-16 w-16 text-muted-foreground/30" />
              <h2 className="mt-4 font-display text-2xl font-bold">Detaliile apar aici</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                După verificare vei vedea statusul, produsele comandate, adresa și totalul comenzii.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Comanda</p>
                  <h2 className="font-display text-2xl font-bold">#{order.id.slice(-8).toUpperCase()}</h2>
                  <p className="text-sm text-muted-foreground">Plasată pe {formatDate(order.createdAt)}</p>
                </div>
                <div className="rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                  {formatMoney(order.total)}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-5">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const active = index <= currentStep;
                  return (
                    <div key={step.key} className={`rounded-2xl border p-3 ${active ? 'border-accent bg-accent/10 text-accent' : 'border-border/70 bg-secondary/30 text-muted-foreground'}`}>
                      <Icon className="h-4 w-4" />
                      <p className="mt-2 text-xs font-semibold">{step.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-border/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Client</p>
                  <p className="mt-3 text-sm font-medium">{customer?.firstName} {customer?.lastName}</p>
                  <p className="text-sm text-muted-foreground">{customer?.email}</p>
                  <p className="text-sm text-muted-foreground">{customer?.phone}</p>
                </div>
                <div className="rounded-2xl border border-border/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Adresă livrare</p>
                  <p className="mt-3 text-sm font-medium">{address?.line1}</p>
                  <p className="text-sm text-muted-foreground">{[address?.city, address?.state, address?.postalCode].filter(Boolean).join(', ')}</p>
                  <p className="text-sm text-muted-foreground">{address?.country}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70">
                <div className="border-b border-border/70 px-4 py-3 font-semibold">Produse comandate</div>
                <div className="divide-y divide-border/70">
                  {(order.items ?? []).map((item) => (
                    <div key={item.id} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Cod produs: {item.sku}</p>
                      </div>
                      <p className="text-muted-foreground">Cantitate: {item.quantity}</p>
                      <p className="font-semibold">{formatMoney(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">Ai nevoie de ajutor pentru comandă?</p>
                <Button variant="outline" asChild>
                  <Link to="/contact">Contactează-ne</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
