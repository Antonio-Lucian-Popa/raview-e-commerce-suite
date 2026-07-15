import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function PrivacyPage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Politica de Confidențialitate' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Politica de Confidențialitate</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: Iulie 2026</p>
        <p>
          Această politică explică modul în care Ravlux Lighting SRL prelucrează datele personale ale
          clienților și vizitatorilor site-ului raviewlighting.ro.
        </p>

        <h2 className="text-lg font-semibold text-foreground">1. Operatorul datelor</h2>
        <p>
          Operatorul datelor este Ravlux Lighting SRL. Completează aici datele oficiale ale societății:
          sediu social, CUI, număr de înregistrare la Registrul Comerțului și email dedicat pentru
          solicitări privind datele personale.
        </p>

        <h2 className="text-lg font-semibold text-foreground">2. Date colectate</h2>
        <p>
          Colectăm date necesare pentru procesarea comenzilor, livrare, facturare și comunicare:
          nume, prenume, adresă de livrare, adresă de facturare, email, telefon, produse comandate,
          valoarea comenzii, metoda de plată și mesajele transmise prin formularul de contact.
        </p>

        <h2 className="text-lg font-semibold text-foreground">3. Temeiul și scopul prelucrării</h2>
        <p>
          Prelucrăm datele pentru executarea contractului cu clientul, respectarea obligațiilor legale
          contabile și fiscale, comunicări legate de comandă, soluționarea cererilor și protejarea
          intereselor legitime ale magazinului. Comunicările de marketing se trimit doar dacă există un
          consimțământ valabil sau un alt temei legal aplicabil.
        </p>

        <h2 className="text-lg font-semibold text-foreground">4. Destinatari și servicii terțe</h2>
        <p>
          Datele pot fi transmise către furnizori implicați în operarea magazinului: curieri, procesatori
          de plăți, furnizori de hosting, servicii IT, contabilitate și autorități publice, atunci când
          legea impune acest lucru. Pentru plata online, utilizăm servicii securizate de procesare a
          plăților.
        </p>

        <h2 className="text-lg font-semibold text-foreground">5. Durata stocării</h2>
        <p>
          Păstrăm datele atât timp cât este necesar pentru scopurile de mai sus. Documentele financiar
          contabile se păstrează conform termenelor legale aplicabile, iar solicitările primite prin
          formularul de contact se păstrează cât timp este necesar pentru soluționare și evidență.
        </p>

        <h2 className="text-lg font-semibold text-foreground">6. Drepturile tale</h2>
        <p>
          Ai dreptul de acces, rectificare, ștergere, restricționare, opoziție, portabilitate și dreptul
          de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu
          Caracter Personal. Dacă prelucrarea se bazează pe consimțământ, îl poți retrage oricând.
        </p>

        <h2 className="text-lg font-semibold text-foreground">7. Contact pentru date personale</h2>
        <p>
          Pentru exercitarea drepturilor, ne poți contacta la contact@raviewlighting.ro sau la adresa
          poștală a societății. Completează aici, dacă este cazul, datele persoanei responsabile cu
          protecția datelor.
        </p>
      </div>
    </div>
  );
}
