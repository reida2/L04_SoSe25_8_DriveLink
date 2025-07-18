/**
 * Datenbank‑Seeding für MoveSmart
 *
 * Füllt die Tabelle `cars` mit Testdaten. Weitere Seed‑Funktionen können
 * analog ergänzt werden (z. B. Nutzer, Reservierungen).
 *
 * Ausführung:
 *   node Backend/seeders/seedDatabase.js seed
 */
import { sequelize } from '../config/database.js';
import Car from '../models/Car.js';

// Beispiel‑Fahrzeuge
const carsData = [
  {
    licensePlate: 'M‑BW 123',
    brand       : 'BMW',
    model       : 'X5',
    year        : 2022,
    color       : 'Schwarz',
    location    : 'München Zentrum',
    dailyRate   : 75.5,
    isAvailable : true,
  },
  {
    licensePlate: 'B‑AU 456',
    brand       : 'Audi',
    model       : 'A4',
    year        : 2021,
    color       : 'Weiß',
    location    : 'Berlin Mitte',
    dailyRate   : 60,
    isAvailable : true,
  },
  {
    licensePlate: 'HH‑VW 789',
    brand       : 'Volkswagen',
    model       : 'Golf 8',
    year        : 2023,
    color       : 'Blau',
    location    : 'Hamburg HafenCity',
    dailyRate   : 50.25,
    isAvailable : true,
  },
  {
    licensePlate: 'K‑MB 001',
    brand       : 'Mercedes‑Benz',
    model       : 'C‑Klasse',
    year        : 2022,
    color       : 'Silber',
    location    : 'Köln Domplatte',
    dailyRate   : 70,
    isAvailable : false,
  },
];

// Legt Fahrzeuge an, wenn sie noch nicht existieren
export const seedCars = async () => {
  for (const data of carsData) {
    const [car, created] = await Car.findOrCreate({
      where: { licensePlate: data.licensePlate },
      defaults: data,
    });
    const msg = created ? 'angelegt' : 'existiert bereits';
    console.log(`${car.brand} ${car.model} (${car.licensePlate}) – ${msg}`);
  }
};

// Gesamtes Seeding ausführen
export const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB‑Verbindung OK.');

    console.log('Starte Seeding …');
    await seedCars();
    // Hier weitere Seed‑Funktionen aufrufen, z. B. seedUsers();

    console.log('Seeding abgeschlossen.');
  } catch (err) {
    console.error('Fehler beim Seeding:', err);
  }
};

// Direkter CLI‑Aufruf: `node … seed`
if (process.argv.includes('seed')) {
  seedDatabase().catch(() => process.exit(1));
}
