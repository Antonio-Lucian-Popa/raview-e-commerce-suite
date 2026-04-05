import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function PrivacyPage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Politica de Confidențialitate' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Politica de Confidențialitate</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: Ianuarie 2026</p>
        <h2 className="text-lg font-semibold text-foreground">1. Date colectate</h2>
        <p>Colectăm date personale necesare pentru procesarea comenzilor: nume, adresă, email, telefon, date de livrare și facturare.</p>
        <h2 className="text-lg font-semibold text-foreground">2. Scopul prelucrării</h2>
        <p>Datele sunt folosite exclusiv pentru procesarea comenzilor, comunicare cu clienții și îmbunătățirea serviciilor noastre.</p>
        <h2 className="text-lg font-semibold text-foreground">3. Drepturile tale</h2>
        <p>Ai dreptul de acces, rectificare, ștergere și portabilitate a datelor tale personale conform GDPR.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Contact DPO</h2>
        <p>Pentru exercitarea drepturilor, contactează-ne la: dpo@raviewlighting.ro</p>
      </div>
    </div>
  );
}
