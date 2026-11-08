# Raview E-Commerce Frontend

Frontend React/Vite pentru magazinul Raview.

## Docker

Build si pornire locala:

```bash
docker compose up --build -d
```

Containerul frontend ruleaza in reteaua Docker externa `ravio-net`, in spatele reverse proxy-ului Nginx.

Configurare pentru server:

```bash
VITE_API_URL=/api/v1 docker compose up --build -d
```

Variabile disponibile:

- `VITE_API_URL` - URL-ul backend-ului prin reverse proxy, implicit `/api/v1`.
- `VITE_EUR_TO_RON` - cursul implicit EUR/RON, implicit `5`.
- `VITE_GTM_ID` - id-ul containerului Google Tag Manager (`GTM-XXXXXXX`). Gol = analytics dezactivat.

Nota: fiind un frontend Vite static, variabilele `VITE_*` sunt incluse in bundle la build. Dupa schimbarea lor, imaginea trebuie reconstruita cu `docker compose up --build -d`.

## Google Tag Manager & Analytics

Site-ul incarca un container **Google Tag Manager** din care se gestioneaza
Google Analytics 4, Google Ads, remarketing etc. fara modificari de cod.

- Seteaza `VITE_GTM_ID` (ex. `GTM-XXXXXXX`) si reconstruieste bundle-ul. Fara
  aceasta variabila nu se incarca niciun script.
- **Consimtamant (GDPR):** folosim Google Consent Mode v2. Implicit consimtamantul
  este `denied`; devine `granted` doar dupa ce vizitatorul apasa "Accepta" in
  bannerul de cookies. Decizia e retinuta in `localStorage`.
- **Page views:** trimise automat la fiecare schimbare de ruta (SPA).
- **Evenimente e-commerce** (GA4 / Google Ads): `view_item`, `add_to_cart`,
  `remove_from_cart`, `begin_checkout`, `purchase`. Preturile sunt in RON, cu TVA inclus.
- In GTM configureaza tag-ul GA4 sa citeasca obiectul `ecommerce` din dataLayer
  (declanșatoare pe aceste evenimente) pentru rapoarte de e-commerce.

Toata logica se afla in `src/lib/gtm.ts`.

## Verificare juridică și condiții înainte de lansare (8 noiembrie 2026)

Modificările frontend nu certifică legalitatea firmei sau a operațiunilor. Nu publica vânzări până la rezolvarea punctelor de mai jos.

- **Identitatea vânzătorului:** utilizatorul a confirmat că RavLux este operat de RAVIEW LIGHTING SRL, CUI 47245694. Datele au fost centralizate în `src/lib/merchant.ts` și afișate în paginile legale și footer. Sediu: Str. Gheorghe Donici nr. 2, camera 2, Bacău, 600226; ONRC J2022002074047. Surse consultate la 08.11.2026: https://listafirme.eu/raview-lighting-srl-47245694/ și https://listafirme.ro/raview-lighting-srl-47245694/ . Capitalul de 200 lei apare în bilanțul 2025 reprodus la https://www.craiova.ro/firme/raview-lighting-s-r-l ; confirmă că nu există modificări ulterioare în actele firmei. Telefonul și emailul sunt cele deja configurate în proiect, nu au fost validate de directoarele publice. Confirmă separat adresa operațională de retur și concordanța comerciantului din Stripe/facturi.
- **ANPC/SAL:** link ANPC și pictogramă SAL în footer, vizibile inclusiv pe pagina principală, cu link https://reclamatiisal.anpc.ro/ . Pictograma folosește imaginea furnizată de utilizator în `public/legal/anpc-sal-reference.png`, într-un cadru de 250 × 50 px; marginile capturii sunt ascunse prin CSS, fără redesenarea siglei. Fișierul original oficial trebuie reconfirmat/înlocuit înainte de lansare: serverele ANPC/Portal Legislativ au refuzat accesul în această sesiune. Nu folosi vechiul SOL. Sursă: https://legislatie.just.ro/Public/FormaPrintabila/00000G1NC4Y1L5FCQGX25CSD9B1SRAAN (Ordin 270/2026, anexa 2).
- **Backend (nu este în acest repository):** validează pe server preț, TVA, curs, promoție, transport, stoc și total; nu accepta sume din browser ca autoritate. Confirmă acceptarea contractului prin email pe suport durabil, cu produsele, totalul, livrarea, termenii aplicabili și informarea/formularul de retragere. Păstrează versiunea termenilor, acceptarea și data. Verifică rambursări, facturare/e-Factura cu contabilul, email de confirmare și verificarea plății exclusiv prin webhook Stripe semnat; parametrul URL de succes nu dovedește plata.
- **Retur:** este păstrată oferta deja existentă de 30 de zile, cu drept legal de 14 zile separat. Confirmă că echipa poate onora oferta, costurile pentru bunuri voluminoase și adresa de retur. Nu solicita IBAN pentru o plată rambursabilă pe card fără motiv.
- **Produse electrice:** completează documentele reale pentru fiecare produs: producător, adresa poștală și electronică, responsabil UE unde este necesar, identificare și avertismente în română. Frontendul afișează câmpurile `specs.manufacturerName`, `manufacturerPostalAddress`, `manufacturerEmail`, `euResponsiblePerson`, `safetyWarningsRo`; ele nu sunt populate automat. Confirmă CE, declarații de conformitate, instrucțiuni, obligații DEEE/preluare și obligațiile de producător/importator, în funcție de rol. Pentru surse de lumină supuse etichetării, mai trebuie implementate eticheta energetică și fișa produsului lângă preț, inclusiv în listări; nu există documentele necesare în proiect. Surse: https://eur-lex.europa.eu/eli/C/2025/6233/oj/eng și https://energy-efficient-products.ec.europa.eu/dealers_en .
- **Reduceri:** calculul și contractul API existente (`oldPrice`, promoții, TVA) au fost păstrate la cererea utilizatorului. Verificarea prețului anterior legal și istoricul de 30 de zile rămân de rezolvat separat, coordonat cu backendul.
- **GDPR:** confirmă furnizorii efectivi, acordurile art. 28, transferurile internaționale și garanțiile, termenele de retenție în backend/backups/loguri și procedura cererilor/incidențelor. Identitatea operatorului este completată; inventarul real de servicii rămâne de confirmat. Nu activa GTM până când scopurile, furnizorii, cookie-urile și duratele exacte ale etichetelor sunt inventariate în pagina Cookies. Nu publica etichete fără această verificare. Refactorizarea tehnică a consimțământului a fost exclusă din acest commit limitat la informațiile site-ului. Implementarea existentă încarcă GTM din index.html înaintea acordului, iar harta Google este încorporată automat; acestea necesită o remediere separată. Nu considera informarea cookies drept remediere a comportamentului tehnic.
- **Recenzii:** nu declara achiziții verificate fără verificare reală; documentează și afișează modul de verificare/moderare dacă publici recenzii.
- **Accesibilitate:** stabilește aplicabilitatea Legii 232/2022 și eventualei excepții pentru microîntreprinderile care furnizează servicii; auditarea tastaturii, etichetelor formularelor, contrastului și fluxului Stripe este încă necesară. Sursă: https://legislatie.just.ro/public/DetaliiDocument/257778 .

Surse generale: OUG 34/2014 (https://legislatie.just.ro/Public/FormaPrintabila/00000G08K6QIQ2SDQAM3HIVHPE4FPORX), OUG 140/2021, GDPR art. 12–13 (https://eur-lex.europa.eu/eli/reg/2016/679/oj). Confirmă textele consolidate și operațiunile concrete cu juristul/contabilul înainte de lansare.
