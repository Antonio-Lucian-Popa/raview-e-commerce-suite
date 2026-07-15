import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function CookiesPage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Politica Cookies' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Politica de Cookies</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: Iulie 2026</p>
        <h2 className="text-lg font-semibold text-foreground">1. Ce sunt cookie-urile?</h2>
        <p>Cookie-urile sunt fișiere text mici stocate pe dispozitivul tău atunci când vizitezi un site web.</p>

        <h2 className="text-lg font-semibold text-foreground">2. Tipuri de cookies utilizate</h2>
        <p>
          <strong>Strict necesare:</strong> sunt folosite pentru funcționarea site-ului, coșul de
          cumpărături, securitate și salvarea preferințelor. Acestea nu pot fi dezactivate din banner.
        </p>
        <p>
          <strong>Analitice:</strong> ne pot ajuta să înțelegem cum este utilizat site-ul. Acestea se
          activează doar după consimțământ, dacă sunt configurate servicii de analiză.
        </p>
        <p>
          <strong>Marketing:</strong> pot fi folosite pentru publicitate personalizată sau măsurarea
          campaniilor. Acestea se activează doar după consimțământ.
        </p>

        <h2 className="text-lg font-semibold text-foreground">3. Gestionarea cookies</h2>
        <p>
          Poți accepta sau respinge cookie-urile neesențiale din bannerul de cookies. Poți șterge
          oricând cookie-urile din setările browserului. Dacă vom adăuga servicii de analiză sau
          marketing, lista concretă a furnizorilor și durata cookie-urilor trebuie actualizate aici.
        </p>
      </div>
    </div>
  );
}
