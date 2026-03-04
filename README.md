# DriveLink (MoveSmart) — Carsharing Web-App

Full-Stack Carsharing-Prototyp mit rollenbasiertem Zugriff (Benutzer / Mitarbeiter / Admin), Reservierungen, Tarifen und Führerschein-Upload.

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, bereitgestellt über **Nginx** (Docker)
- **Backend:** Node.js (Express), **Sequelize**, **SQLite**, JWT-Authentifizierung, Multer Uploads
- **Dev/Test:** Nodemon, Jest (Backend-Tests)
- **Containerisierung:** Docker + docker-compose

## Hauptfunktionen

- Authentifizierung (JWT)
- Benutzerverwaltung (Admin-/Benutzer-Flows)
- Fahrzeugverwaltung (Mitarbeiter-/Admin-Flows)
- Reservierungen CRUD
- Tarifverwaltung
- Führerschein-Upload + statische Bereitstellung über `/uploads`

## Repository-Struktur

```
.
├─ Backend/                              # Express API + SQLite (Sequelize)
├─ Frontend/                             # React UI (Vite)
├─ docker-compose.yaml                   # Full Stack Startup
└─ L02_Technische_Dokumentation_T8.pdf
```

## Schnellstart (Docker)

Vom Repository-Root-Verzeichnis:

```bash
docker compose up --build
```

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:8080` (oder `FRONTEND_PORT`)

### Umgebung (Docker)

`docker-compose.yaml` verwendet:

- `Backend/.env` über `env_file`
- `VITE_API_URL=http://localhost:3001` für den Frontend-Container

## Lokale Entwicklung (ohne Docker)

### Backend

```bash
cd Backend
npm install
npm run dev
```

Backend läuft standardmäßig auf `http://localhost:3001`.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Der Vite-Dev-Server zeigt die lokale URL an (typischerweise `http://localhost:5173`).

Um das Frontend auf dein Backend zu verweisen, setze `VITE_API_URL` (über Shell oder `.env` in `Frontend/`), z.B.:

```bash
VITE_API_URL=http://localhost:3001 npm run dev
```

## Konfiguration

### Backend `.env`

Datei: `Backend/.env`

```ini
PORT=3001
JWT_SECRET=change-me
DB_STORAGE=./data/carsharing_db.sqlite
```

- `PORT`: Backend HTTP-Port
- `JWT_SECRET`: JWT-Signierungsschlüssel (für echte Deployments ändern)
- `DB_STORAGE`: Pfad zur SQLite-Datei (relativ zu `Backend/`)

### Wichtig: SQLite-Persistenz in Docker

`docker-compose.yaml` mountet:

- `./Backend/uploads -> /app/uploads`
- `./Backend/database -> /app/database`

Aber der Standard-`DB_STORAGE` zeigt auf `./data/...`, was zu `/app/data/...` im Container aufgelöst wird. Das bedeutet, dass die DB-Datei nicht über das gemountete `Backend/database`-Verzeichnis persistiert wird.

Um die DB über das Compose-Volume zu persistieren, setze:

```ini
DB_STORAGE=./database/app.sqlite
```

Dann landet die Datei in `Backend/database/` auf dem Host.

## API-Übersicht

Basis-URL: `http://localhost:3001`

Gemountete Routen:

- `POST/GET ... /api/auth`
- `... /api/users`
- `... /api/cars`
- `... /api/reservations`
- `... /api/rates`
- `... /api/staff`
- `... /api/admin`

Statische Uploads:

- `GET /uploads/...` stellt Dateien aus `Backend/uploads/` bereit

## Admin-Bootstrap

Script: `Backend/createAdmin.js`

Lokal ausführen:

```bash
cd Backend
node createAdmin.js
```

Hinweise:

- Das Script erstellt einen Admin-Benutzer, falls nicht vorhanden.
- Zugangsdaten/Standardwerte sind im Script definiert.

## Datenbank-Seeding

Seeder-Einstiegspunkt:

- `Backend/seeders/seedDatabase.js`

Lokal ausführen (Beispiel):

```bash
cd Backend
node seeders/seedDatabase.js
```

(Anpassen, falls das Projekt spezifische Umgebungsvariablen oder Reihenfolge erwartet.)

## Tests (Backend)

```bash
cd Backend
npm test
```

Watch-Modus:

```bash
cd Backend
npm run test:watch
```

## Fehlerbehebung

- **Frontend kann Backend nicht erreichen (Docker):**
  - Stelle sicher, dass `VITE_API_URL=http://localhost:3001` in compose gesetzt ist.
  - Bestätige, dass das Backend auf `3001:3001` exponiert ist.

- **Datenbankänderungen werden zwischen Container-Neustarts nicht persistiert:**
  - Aktualisiere `Backend/.env` auf `DB_STORAGE=./database/app.sqlite`, um mit dem gemounteten Volume übereinzustimmen.

- **Uploads fehlen nach Neustart:**
  - Uploads werden über das `Backend/uploads`-Volume-Mount persistiert. Stelle sicher, dass das Verzeichnis existiert und beschreibbar ist.

## Contributors

- **Rida Alil**
- **Teoman Nazim Sabah**
- **Amir Mangkok**

## Lizenz
