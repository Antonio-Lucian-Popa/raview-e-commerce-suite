import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function ReturnsPage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Politica de Retur' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Politica de Retur</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: Iulie 2026</p>

        <h2 className="text-lg font-semibold text-foreground">1. Dreptul legal de retragere</h2>
        <p>
          Dacă ești consumator, ai dreptul să te retragi din contract în termen de 14 zile de la data la
          care intri în posesia fizică a produselor, fără a preciza motivul. Pentru comenzi livrate în
          mai multe colete, termenul curge de la primirea ultimului produs.
        </p>

        <h2 className="text-lg font-semibold text-foreground">2. Termen comercial extins</h2>
        <p>
          Ravlux poate accepta retururi în termen de 30 de zile pentru produsele eligibile, dacă acestea
          sunt complete, neutilizate, fără urme de montaj și, pe cât posibil, în ambalajul original.
        </p>

        <h2 className="text-lg font-semibold text-foreground">3. Cum soliciți returul</h2>
        <p>
          Trimite o solicitare la contact@raviewlighting.ro cu numărul comenzii, numele clientului,
          produsul returnat și contul bancar pentru rambursare, dacă plata nu a fost făcută online.
          Vom confirma pașii de expediere a returului.
        </p>

        <h2 className="text-lg font-semibold text-foreground">4. Costuri și rambursare</h2>
        <p>
          Costul transportului de retur este suportat de client, cu excepția cazului în care produsul
          livrat este greșit, deteriorat sau neconform. Rambursarea se face fără întârzieri nejustificate,
          după verificarea produselor returnate, prin aceeași metodă de plată sau prin transfer bancar.
        </p>

        <h2 className="text-lg font-semibold text-foreground">5. Excepții</h2>
        <p>
          Pot exista excepții legale pentru produse executate după specificațiile clientului sau
          personalizate clar. Pentru produse montate, deteriorate sau incomplete, rambursarea poate fi
          diminuată proporțional cu scăderea valorii produsului.
        </p>
      </div>
    </div>
  );
}
