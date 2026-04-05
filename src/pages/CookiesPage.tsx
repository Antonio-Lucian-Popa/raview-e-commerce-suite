import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function CookiesPage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Politica Cookies' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Politica de Cookies</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: Ianuarie 2026</p>
        <h2 className="text-lg font-semibold text-foreground">1. Ce sunt cookie-urile?</h2>
        <p>Cookie-urile sunt fișiere text mici stocate pe dispozitivul tău atunci când vizitezi un site web.</p>
        <h2 className="text-lg font-semibold text-foreground">2. Tipuri de cookies utilizate</h2>
        <p><strong>Funcționale:</strong> Necesare pentru funcționarea site-ului.</p>
        <p><strong>Analitice:</strong> Ne ajută să înțelegem cum este utilizat site-ul.</p>
        <p><strong>Marketing:</strong> Folosite pentru personalizarea publicității.</p>
        <h2 className="text-lg font-semibold text-foreground">3. Gestionarea cookies</h2>
        <p>Poți gestiona preferințele tale privind cookie-urile din setările browserului tău.</p>
      </div>
    </div>
  );
}
