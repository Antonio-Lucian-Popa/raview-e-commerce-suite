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

Nota: fiind un frontend Vite static, variabilele `VITE_*` sunt incluse in bundle la build. Dupa schimbarea lor, imaginea trebuie reconstruita cu `docker compose up --build -d`.
