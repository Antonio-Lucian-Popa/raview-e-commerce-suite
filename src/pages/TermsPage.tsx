import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function TermsPage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Termeni și Condiții' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Termeni și Condiții</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: Ianuarie 2026</p>
        <h2 className="text-lg font-semibold text-foreground">1. Informații generale</h2>
        <p>Acești termeni și condiții reglementează utilizarea site-ului raviewlighting.ro și achiziția de produse prin intermediul magazinului online operat de RaView Lighting SRL.</p>
        <h2 className="text-lg font-semibold text-foreground">2. Produse și prețuri</h2>
        <p>Toate prețurile afișate includ TVA. Ne rezervăm dreptul de a modifica prețurile fără notificare prealabilă.</p>
        <h2 className="text-lg font-semibold text-foreground">3. Comenzi și livrare</h2>
        <p>Comenzile sunt procesate în 1-2 zile lucrătoare. Livrarea se face în 2-5 zile lucrătoare prin curier. Livrarea este gratuită pentru comenzi peste 500 lei.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Returnare</h2>
        <p>Produsele pot fi returnate în termen de 30 de zile de la primire, în ambalajul original, nefolosite.</p>
        <h2 className="text-lg font-semibold text-foreground">5. Contact</h2>
        <p>Pentru orice întrebări, ne puteți contacta la contact@raviewlighting.ro sau telefonic la 0743 687 059.</p>
      </div>
    </div>
  );
}
