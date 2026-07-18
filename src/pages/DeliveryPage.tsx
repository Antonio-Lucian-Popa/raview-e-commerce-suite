import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from '@/lib/shipping';

export default function DeliveryPage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Politica de Livrare' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Politica de Livrare</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: Iulie 2026</p>

        <h2 className="text-lg font-semibold text-foreground">1. Procesarea comenzilor</h2>
        <p>
          Comenzile sunt procesate de regulă în 1-2 zile lucrătoare, în funcție de disponibilitatea
          produselor și confirmarea datelor de livrare.
        </p>

        <h2 className="text-lg font-semibold text-foreground">2. Termen de livrare</h2>
        <p>
          Livrarea prin curier durează, de regulă, 2-5 zile lucrătoare de la predarea coletului către
          curier. Pentru produse speciale, voluminoase sau aduse la comandă, termenul poate fi comunicat
          separat.
        </p>

        <h2 className="text-lg font-semibold text-foreground">3. Costuri de livrare</h2>
        <p>
          Livrarea este gratuită pentru comenzi peste {FREE_SHIPPING_THRESHOLD} lei. Pentru comenzile
          sub acest prag, costul standard de livrare este {STANDARD_SHIPPING_COST} lei.
        </p>

        <h2 className="text-lg font-semibold text-foreground">4. Verificarea coletului</h2>
        <p>
          Te rugăm să verifici integritatea coletului la primire. Dacă observi deteriorări vizibile,
          solicită curierului întocmirea unui proces-verbal și contactează-ne cât mai curând.
        </p>

        <h2 className="text-lg font-semibold text-foreground">5. Ridicare din showroom</h2>
        <p>
          Pentru anumite comenzi poate fi disponibilă ridicarea din showroom-ul Ravlux din Bacău, Str.
          Gheorghe Donici Nr.2, în programul afișat pe pagina de contact.
        </p>
      </div>
    </div>
  );
}
