/**
 * Datenbank‑Hilfsmodul für MoveSmart (SQLite)
 *
 * - Lädt Umgebungsvariablen mit `dotenv` und liest den Pfad der SQLite‑Datei
 *   aus `process.env.DB_STORAGE`.
 * - Stellt eine vorkonfigurierte `Sequelize`‑Instanz sowie die Methode
 *   `connectDB()` bereit, um beim Start der Anwendung die Verbindung zu
 *   prüfen.
 * - Standardmäßig ist das SQL‑Logging deaktiviert; zum Debuggen `logging`
 *   einfach auf `true` setzen.
 */
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// .env‑Datei einlesen
dotenv.config();

// Ersatz für `__dirname` in ES‑Modulen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Singleton‑Instanz der Datenbank
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', process.env.DB_STORAGE),
  logging: false, // bei Bedarf auf `true` stellen, um SQL‑Abfragen auszugeben
});

/**
 * Verbindungs‑Health‑Check.
 *
 * Schlägt die Authentifizierung fehl, wird der Fehler erneut geworfen, damit
 * der Aufrufer entscheiden kann, wie er reagieren möchte (z. B. Retry,
 * Prozess beenden oder Alerting).
 */
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite‑Verbindung erfolgreich hergestellt');
  } catch (error) {
    console.error('Verbindung zur Datenbank fehlgeschlagen:', error);
    throw error;
  }
};

// Export der Instanz für Repositories, Migrations usw.
export { sequelize };
