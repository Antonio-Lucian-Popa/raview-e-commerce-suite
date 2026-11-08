import { MerchantIdentity } from '@/components/MerchantIdentity';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function PrivacyPage() {
  return (
    <div className="container-page pb-16 max-w-3xl">
      <Breadcrumbs items={[{ label: 'Politica de Confidențialitate' }]} />
      <h1 className="text-3xl font-display font-bold mb-6">Politica de Confidențialitate</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Ultima actualizare: 8 noiembrie 2026</p>
        <p>
          Această politică explică modul în care RAVIEW LIGHTING SRL, operatorul magazinului RavLux, prelucrează datele personale ale
          clienților și vizitatorilor site-ului raviewlighting.ro.
        </p>

        <h2 className="text-lg font-semibold text-foreground">1. Operatorul datelor</h2>
        <MerchantIdentity />

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
          poștală a societății. Nu este necesar să transmiți o copie a actului de identitate din proprie inițiativă. Solicităm doar informații proporționale dacă există îndoieli rezonabile privind identitatea.
        </p>

        <h2>8. Detalii privind temeiurile și opțiunile tale</h2>
        <p>Comenzile și solicitările precontractuale se prelucrează potrivit art. 6 alin. (1) lit. b GDPR; facturarea și evidențele obligatorii, potrivit lit. c. Securitatea, prevenirea fraudei și apărarea drepturilor constituie interese legitime potrivit lit. f, în urma evaluării proporționalității. Analiza traficului și publicitatea prin Google Tag Manager se activează numai prin consimțământ, potrivit lit. a. Refuzul sau retragerea acestuia nu afectează cumpărarea.</p>
        <p>Datele marcate obligatorii în checkout sunt necesare pentru comandă și livrare; fără ele nu putem executa comanda. Notele comenzii sunt opționale. Nu folosim în acest frontend decizii exclusiv automatizate cu efect juridic. Verificarea eligibilității unui cupon poate folosi emailul sau telefonul; ne poți contacta pentru clarificarea unui rezultat.</p>
        <h2>9. Transferuri și păstrare</h2>
        <p>Stripe procesează plata pe pagina sa; nu solicităm datele cardului în formularul magazinului. Serviciile Google sunt opționale și pot presupune prelucrări în afara SEE. Transferurile către țări terțe necesită o decizie de adecvare aplicabilă sau garanții conform art. 46 GDPR, precum clauzele contractuale standard. Poți solicita informații despre garanțiile concrete la adresa de contact.</p>
        <p>Datele de comandă se păstrează pentru executarea contractului și a garanțiilor; evidențele fiscale conform termenului legal aplicabil fiecărui document. În caz de litigiu, datele relevante se păstrează până la soluționare și expirarea termenelor de apărare a drepturilor. Cererile de contact se păstrează până la soluționare și atât cât este necesar pentru dovedirea răspunsului. Criteriile nu justifică păstrarea nelimitată.</p>
        <h2>10. Exercitarea drepturilor</h2>
        <p>Răspundem cererilor privind datele personale în cel mult o lună; în cazuri complexe termenul poate fi prelungit cu două luni, cu informare și motivare în prima lună. Drepturile se aplică în condițiile GDPR, iar ștergerea nu înlătură obligațiile legale de păstrare. Retragerea consimțământului nu afectează legalitatea prelucrărilor anterioare. Poți depune plângere la <a href="https://www.dataprotection.ro/" target="_blank" rel="noopener noreferrer">ANSPDCP</a> și te poți adresa instanței.</p>
      </div>
    </div>
  );
}
