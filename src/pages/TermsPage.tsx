import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function TermsPage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Termeni și Condiții' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Termeni și Condiții</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: Iulie 2026</p>
        <h2 className="text-lg font-semibold text-foreground">1. Informații generale</h2>
        <p>
          Acești termeni reglementează utilizarea site-ului raviewlighting.ro și achiziția de produse
          prin magazinul online operat de Ravlux Lighting SRL. Completează aici datele oficiale ale
          societății: CUI, număr de înregistrare la Registrul Comerțului, sediu social și cont bancar,
          dacă este afișat public.
        </p>

        <h2 className="text-lg font-semibold text-foreground">2. Produse și prețuri</h2>
        <p>
          Prețurile sunt afișate în lei și includ TVA, cu excepția cazului în care este menționat altfel.
          Ne rezervăm dreptul de a corecta erorile evidente de afișare și de a actualiza prețurile.
          Prețul final, costul livrării și totalul de plată sunt afișate înainte de plasarea comenzii.
        </p>

        <h2 className="text-lg font-semibold text-foreground">3. Plasarea comenzii</h2>
        <p>
          Comanda devine fermă după transmiterea formularului de checkout și confirmarea disponibilității.
          Ne poți contacta pentru corectarea datelor introduse greșit înainte de expedierea produselor.
        </p>

        <h2 className="text-lg font-semibold text-foreground">4. Plată</h2>
        <p>
          Plata se poate face online cu cardul sau ramburs, în funcție de opțiunile disponibile în
          checkout. Pentru plata online, clientul este redirecționat către procesatorul de plăți.
        </p>

        <h2 className="text-lg font-semibold text-foreground">5. Livrare</h2>
        <p>
          Comenzile sunt procesate de regulă în 1-2 zile lucrătoare. Livrarea se face prin curier, iar
          costurile și estimarea de livrare sunt afișate în checkout. Detaliile complete sunt disponibile
          în pagina Politica de livrare.
        </p>

        <h2 className="text-lg font-semibold text-foreground">6. Dreptul de retragere și retur</h2>
        <p>
          Consumatorii beneficiază de dreptul legal de retragere în termen de 14 zile de la primirea
          produselor, cu excepțiile prevăzute de lege. Ravlux poate oferi, comercial, un termen extins
          de retur de 30 de zile pentru produsele eligibile, în condițiile descrise în Politica de retur.
        </p>

        <h2 className="text-lg font-semibold text-foreground">7. Garanții</h2>
        <p>
          Produsele beneficiază de garanțiile legale aplicabile și, unde este cazul, de garanțiile
          comerciale oferite de producător. Pentru solicitări de garanție, clientul trebuie să prezinte
          documentul de achiziție și informații despre defectul constatat.
        </p>

        <h2 className="text-lg font-semibold text-foreground">8. Reclamații și soluționarea litigiilor</h2>
        <p>
          Pentru reclamații, ne poți contacta la contact@raviewlighting.ro sau telefonic la 0743 687 059.
          Consumatorii pot utiliza și mecanismele de soluționare alternativă a litigiilor puse la
          dispoziție de ANPC.
        </p>

        <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
        <p>
          Email: contact@raviewlighting.ro. Telefon: 0743 687 059. Adresă showroom: Bacău, Str. Gheorghe
          Donici Nr.2.
        </p>
      </div>
    </div>
  );
}
