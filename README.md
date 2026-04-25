# Raview E-Commerce Frontend

Frontend React/Vite pentru magazinul Raview.

## Docker

Build si pornire locala:

```bash
docker compose up --build -d
```

Aplicatia va fi disponibila pe `http://localhost:8080`.

Configurare pentru server:

```bash
VITE_API_URL=https://api.example.ro/api/v1 APP_PORT=80 docker compose up --build -d
```

Variabile disponibile:

- `VITE_API_URL` - URL-ul backend-ului, implicit `http://localhost:3000/api/v1`.
- `VITE_EUR_TO_RON` - cursul implicit EUR/RON, implicit `5`.
- `APP_PORT` - portul expus pe host, implicit `8080`.

Nota: fiind un frontend Vite static, variabilele `VITE_*` sunt incluse in bundle la build. Dupa schimbarea lor, imaginea trebuie reconstruita cu `docker compose up --build -d`.
