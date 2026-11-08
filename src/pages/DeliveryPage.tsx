import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from '@/lib/shipping';

export default function DeliveryPage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Politica de Livrare' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Politica de Livrare</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: 8 noiembrie 2026</p>

        <h2 className="text-lg font-semibold text-foreground">1. Procesarea comenzilor</h2>
        <p>
          Comenzile sunt procesate de regulă în 1-2 zile lucrătoare, în funcție de disponibilitatea
          produselor și confirmarea datelor de livrare.
        </p>

        <h2 className="text-lg font-semibold text-foreground">2. Termen de livrare</h2>
        <p>
          Livrarea prin curier durează, de regulă, 2-5 zile lucrătoare de la predarea coletului către
          curier. Pentru produse speciale, voluminoase sau aduse la comandă, termenul se agreează înainte de acceptarea comenzii. Dacă nu convenim altfel, termenul maxim legal este de 30 de zile de la încheierea contractului.
        </p>

        <h2 className="text-lg font-semibold text-foreground">3. Costuri de livrare</h2>
        <p>
          Livrarea este gratuită pentru comenzi peste {FREE_SHIPPING_THRESHOLD} lei. Pentru comenzile
          sub acest prag, costul standard de livrare este {STANDARD_SHIPPING_COST} lei.
        </p>

        <h2 className="text-lg font-semibold text-foreground">4. Verificarea coletului</h2>
        <p>
          Te rugăm să verifici integritatea coletului la primire. Dacă observi deteriorări vizibile,
          poți solicita curierului întocmirea unui proces-verbal și ne poți contacta. Lipsa procesului-verbal sau a verificării la livrare nu înlătură drepturile legale. Riscul se transferă când tu sau un terț desemnat, altul decât transportatorul, primiți bunurile, cu excepțiile legale.
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
