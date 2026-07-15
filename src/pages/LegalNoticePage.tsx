import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function LegalNoticePage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Informații Legale' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Informații Legale</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: Iulie 2026</p>

        <h2 className="text-lg font-semibold text-foreground">Date comerciant</h2>
        <p>
          Denumire: Ravlux Lighting SRL. Completează înainte de publicare: sediu social, CUI, număr de
          înregistrare la Registrul Comerțului, capital social, cont bancar dacă este cazul și datele de
          contact oficiale.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Contact</h2>
        <p>
          Showroom: Bacău, Str. Gheorghe Donici Nr.2. Telefon: 0743 687 059. Email:
          contact@raviewlighting.ro.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Soluționarea reclamațiilor</h2>
        <p>
          Pentru reclamații comerciale, te rugăm să ne contactezi mai întâi la contact@raviewlighting.ro.
          Consumatorii pot utiliza procedurile de soluționare alternativă a litigiilor prin ANPC.
        </p>

        <p>
          Link ANPC SAL:{' '}
          <a href="https://reclamatiisal.anpc.ro/" target="_blank" rel="noreferrer">
            https://reclamatiisal.anpc.ro/
          </a>
        </p>
        <p>
          Informații europene despre mecanismele de soluționare a disputelor:{' '}
          <a href="https://consumer-redress.ec.europa.eu/" target="_blank" rel="noreferrer">
            https://consumer-redress.ec.europa.eu/
          </a>
        </p>
      </div>
    </div>
  );
}
