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
