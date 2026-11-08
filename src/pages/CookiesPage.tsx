import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function CookiesPage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Politica Cookies' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Politica de Cookies</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: 8 noiembrie 2026</p>
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

        <p>Bannerul permite acceptarea tuturor utilizărilor opționale, refuzarea lor sau alegerea separată a analizei și marketingului. Google Tag Manager este încărcat doar după acord pentru cel puțin unul dintre scopuri, dacă este configurat. Vizitele și evenimentele de cumpărare ale magazinului se transmit numai cu acord pentru analiză. Refuzul nu împiedică achiziția.</p>
        <p>Preferința este păstrată în localStorage, în cheia <code>ravlux-cookie-consent</code>, împreună cu versiunea informării și data deciziei, pentru 180 de zile. Alegerile din versiuni anterioare sunt solicitate din nou. Poți modifica sau retrage acordul oricând din subsol sau de aici:</p>
        <button type="button" className="underline font-medium" onClick={() => window.dispatchEvent(new Event('ravlux:cookie-settings'))}>Setări cookies</button>
        <p>La retragerea unui acord activ, pagina se reîncarcă pentru oprirea scripturilor deja încărcate și se încearcă ștergerea cookie-urilor Google first-party uzuale. Cookie-urile de pe domenii terțe sau inaccesibile JavaScript pot fi șterse din setările browserului.</p>
        <h2>4. Stocare locală și furnizori</h2>
        <p>Coșul este păstrat în memoria paginii. Pentru administratorii autentificați, <code>raview_admin_session</code> păstrează sesiunea în localStorage până la deconectare sau invalidare. După acordul pentru analiză, dacă GTM este configurat, <code>ravlux:pending_purchase</code> păstrează temporar în sessionStorage date despre produse și tranzacție pentru măsurarea conversiei; se elimină după consumarea evenimentului sau la închiderea sesiunii.</p>
        <p>Google Tag Manager este furnizat de Google. Cookie-urile efective și duratele lor depind de etichetele activate în container. Nicio etichetă nouă nu trebuie publicată fără actualizarea inventarului și a informării privind scopul, furnizorul și durata. Plățile sunt realizate pe pagina Stripe, unde se aplică informările procesatorului. Linkul către Google Maps deschide un serviciu extern numai dacă îl accesezi.</p>
        <p>Poți șterge datele stocate din setările browserului; această operație poate elimina și preferințele salvate. Informații despre prelucrarea datelor: <a href="/privacy">politica de confidențialitate</a>.</p>

      </div>
    </div>
  );
}
