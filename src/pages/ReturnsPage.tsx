import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function ReturnsPage() {
  return <div className="container-page pb-16 max-w-3xl">
    <Breadcrumbs items={[{ label: 'Retur și drept de retragere' }]} />
    <h1 className="text-3xl font-display font-bold mb-6">Retur și drept de retragere</h1>
    <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
      <p>Ultima actualizare: 8 noiembrie 2026</p>

<h2>1. Dreptul legal de retragere</h2>
<p>Consumatorul persoană fizică poate notifica retragerea fără motiv în 14 zile de la primirea produsului; pentru bunuri din aceeași comandă livrate separat, de la primirea ultimului bun. Este suficient să trimiți notificarea înainte de expirarea termenului, prin email la contact@raviewlighting.ro sau printr-o declarație neechivocă la adresa poștală oficială a vânzătorului. Nu ai nevoie de aprobarea prealabilă a returului.</p>
<p>Expediază sau predă bunurile în cel mult 14 zile de la comunicarea retragerii. Contactează-ne pentru adresa de retur confirmată. Costul direct al returului este suportat de consumator. Pentru bunuri care nu pot fi returnate normal prin poștă, costul sau estimarea acestuia trebuie comunicat înaintea contractului.</p>
<h2>2. Rambursarea</h2>
<p>Rambursăm sumele achitate, inclusiv costul livrării standard inițiale, în cel mult 14 zile de la informarea privind retragerea. Diferența pentru o livrare mai scumpă aleasă expres nu se rambursează. Putem amâna rambursarea până la primirea bunurilor sau a dovezii expedierii, luându-se în considerare data cea mai apropiată, cu excepția cazului în care ne oferim să recuperăm bunurile.</p>
<p>Folosim aceeași modalitate de plată, fără comisioane pentru consumator; o altă metodă se folosește numai cu acordul expres al acestuia.</p>
<h2>3. Starea bunurilor și excepții</h2>
<p>Poți verifica natura, caracteristicile și funcționarea produsului ca într-un magazin. Lipsa ambalajului original nu anulează dreptul legal. Răspunzi doar pentru diminuarea valorii provocată de manipulări care depășesc această verificare; orice diminuare trebuie justificată. Montajul nu exclude automat retragerea.</p>
<p>Dreptul nu se aplică bunurilor confecționate după specificațiile tale sau personalizate clar, în condițiile art. 16 OUG 34/2014. Simpla aducere la comandă a unui produs standard nu îl transformă în produs personalizat. Drepturile privind neconformitatea rămân aplicabile.</p>
<h2>4. Retur comercial până la 30 de zile</h2>
<p>Pentru zilele 15–30 de la primire, acceptăm returul produselor standard complete, neutilizate, fără urme de montaj, în ambalajul original. Produsele personalizate sunt excluse. Transportul este suportat de client, iar rambursarea prețului produsului se face în 14 zile de la primirea și verificarea acestuia. Condițiile comerciale nu limitează drepturile legale din primele 14 zile sau garanția legală.</p>
<h2>5. Model de notificare a retragerii</h2>
<p>Poți copia formularul de mai jos într-un email sau îl poți tipări. Folosirea lui este opțională. Păstrează dovada transmiterii.</p>
<pre className="whitespace-pre-wrap rounded border p-4 text-sm">{`Către: RAVIEW LIGHTING SRL (magazin RavLux)\nSediu: Str. Gheorghe Donici nr. 2, camera 2, Bacău, 600226, România
Email: contact@raviewlighting.ro
Vă notific retragerea mea din contractul de vânzare pentru:
Produse: ____________________
Număr comandă (dacă este disponibil): ____________________
Comandate la / primite la: ____________________
Numele consumatorului: ____________________
Adresa consumatorului: ____________________
Data: ____________________
Semnătura (numai dacă este transmis pe hârtie): ____________________`}</pre>
<h2>6. Produse neconforme</h2>
<p>Un produs greșit, defect sau neconform se soluționează în cadrul garanției legale, fără costuri pentru consumator; nu condiționăm acest drept de termenul pentru retragere sau de ambalaj.</p>

    </div>
  </div>;
}
