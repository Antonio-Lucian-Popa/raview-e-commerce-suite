import { Breadcrumbs } from '@/components/Breadcrumbs';
import { MerchantIdentity } from '@/components/MerchantIdentity';

export default function TermsPage() {
  return <div className="container-page pb-16 max-w-3xl">
    <Breadcrumbs items={[{ label: 'Termeni și condiții' }]} />
    <h1 className="text-3xl font-display font-bold mb-6">Termeni și condiții</h1>
    <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
      <p>Ultima actualizare: 8 noiembrie 2026</p>

<MerchantIdentity />
<h2>1. Domeniu și comandă</h2>
<p>Contractele se încheie în limba română. Drepturile de consumator descrise aici se aplică persoanelor fizice care cumpără în afara activității profesionale. Alegi produsele și cantitățile, verifici coșul, completezi livrarea, verifici totalul și accepți termenii. Poți corecta datele până la trimiterea comenzii; ulterior ne poți contacta pentru corecturi înainte de expediere.</p>
<p>Trimiterea comenzii implică obligația de plată. Plata se realizează online prin Stripe. Mesajul automat de înregistrare confirmă primirea cererii; contractul se încheie când vânzătorul confirmă expres acceptarea comenzii pe email. Pentru indisponibilitate sau eroare evidentă de preț te informăm, solicităm acordul pentru orice modificare și restituim integral sumele dacă nu se acceptă comanda. Prețul unui contract acceptat nu se modifică unilateral.</p>
<h2>2. Preț și livrare</h2>
<p>Prețurile sunt în lei, cu TVA inclus. Costul transportului și totalul sunt afișate înainte de trimitere. Livrăm în România; detaliile sunt în <a href="/delivery">politica de livrare</a>. Pentru produsele în stoc: procesare 1–2 zile lucrătoare, transport estimat 2–5 zile lucrătoare. Dacă nu convenim alt termen, livrăm în cel mult 30 de zile de la încheierea contractului. În caz de întârziere ai drepturile prevăzute de art. 18 OUG 34/2014, inclusiv încetarea contractului în condițiile legii.</p>
<h2>3. Retragere</h2>
<p>Ai drept legal de retragere în 14 zile de la primire, fără motiv, cu excepțiile legale. Condițiile, costurile, rambursarea și formularul opțional sunt în <a href="/returns">politica de retur</a>. Returul comercial extins la 30 de zile nu limitează acest drept.</p>
<h2>4. Garanția legală de conformitate</h2>
<p>Vânzătorul răspunde pentru neconformitățile existente la livrare și constatate în termen de doi ani de la livrarea bunurilor, potrivit OUG 140/2021. O neconformitate constatată în primul an se prezumă existentă la livrare, cu excepțiile legii. Garanția comercială eventual oferită este suplimentară.</p>
<p>Poți solicita repararea sau înlocuirea fără costuri, sub rezerva condițiilor legale de imposibilitate ori disproporționalitate. Reparația sau înlocuirea se realizează într-un termen rezonabil, de cel mult 15 zile calendaristice de la informarea vânzătorului, stabilit de comun acord în scris, fără inconveniente semnificative. În condițiile legii poți cere reducerea proporțională a prețului sau încetarea contractului. Pentru neconformități constatate la scurt timp după livrare, fără a depăși 30 de zile, beneficiezi de înlocuire în condițiile legii.</p>
<p>Trimite descrierea problemei și o dovadă a achiziției la contact@raviewlighting.ro. Ambalajul original nu este o condiție pentru garanția legală. Instalarea incorectă nu înlătură răspunderea vânzătorului când este realizată de acesta sau când rezultă din instrucțiuni deficitare.</p>
<h2>5. Reclamații</h2>
<p>Contact: contact@raviewlighting.ro, 0743 687 059. Poți sesiza <a href="https://anpc.ro/">ANPC</a> sau apela la <a href="https://reclamatiisal.anpc.ro/">SAL</a>, conform competenței și regulilor procedurii, fără a pierde accesul la instanțele competente. Contactul cu magazinul nu condiționează dreptul de a sesiza autoritățile. Nu declarăm o participare obligatorie la o procedură SAL fără un temei aplicabil.</p>
<h2>6. Date personale și versiuni</h2>
<p>Prelucrarea necesară comenzii este explicată în <a href="/privacy">politica de confidențialitate</a>; acordul de marketing nu este o condiție pentru cumpărare. Modificările termenilor se aplică doar comenzilor viitoare. Drepturile imperative prevăzute de lege rămân aplicabile.</p>

    </div>
  </div>;
}
