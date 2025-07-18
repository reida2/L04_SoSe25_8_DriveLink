/**
 * Fahrzeug‑Controller für MoveSmart
 *
 * Endpunkte
 * 
 * • POST    /api/cars           – Neues Fahrzeug anlegen (Admin‑geschützt)
 * • GET     /api/cars           – Alle Fahrzeuge abrufen
 * • GET     /api/cars/:id       – Fahrzeugdetails abrufen
 * • PUT     /api/cars/:id       – Fahrzeug aktualisieren (Admin‑geschützt)
 * • DELETE  /api/cars/:id       – Fahrzeug löschen (Admin‑geschützt)
 *
 * Abhängigkeiten
 * • Sequelize‑Model  – Car (Datenbankzugriff)
 */
import Car from '../models/Car.js';

/**
 * Legt ein neues Fahrzeug an.
 * Nur Admins dürfen diesen Endpunkt aufrufen (Check erfolgt im Middleware‑Stack).
 */
export const createCar = async (req, res) => {
  const { licensePlate, brand, model, year, color, location, dailyRate } = req.body;

  try {
    const newCar = await Car.create({ licensePlate, brand, model, year, color, location, dailyRate });
    res.status(201).json({ message: 'Fahrzeug erfolgreich erstellt', car: newCar });
  } catch (error) {
    console.error('Fehler beim Anlegen des Fahrzeugs:', error.message);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Gibt eine Liste aller Fahrzeuge zurück.
 */
export const getAllCars = async (_req, res) => {
  try {
    const cars = await Car.findAll();
    res.json(cars);
  } catch (error) {
    console.error('Fehler beim Abrufen aller Fahrzeuge:', error.message);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Gibt die Details eines einzelnen Fahrzeugs zurück.
 */
export const getCarById = async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Fahrzeug nicht gefunden' });
    res.json(car);
  } catch (error) {
    console.error('Fehler beim Abrufen des Fahrzeugs:', error.message);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Aktualisiert ein bestehendes Fahrzeug.
 * Nur Admins dürfen diesen Endpunkt aufrufen.
 */
export const updateCar = async (req, res) => {
  const { id } = req.params;
  const { licensePlate, brand, model, year, color, location, dailyRate, isAvailable } = req.body;

  try {
    const car = await Car.findByPk(id);
    if (!car) return res.status(404).json({ message: 'Fahrzeug nicht gefunden' });

    // Nur Felder überschreiben, die im Body vorhanden sind
    car.licensePlate = licensePlate ?? car.licensePlate;
    car.brand        = brand        ?? car.brand;
    car.model        = model        ?? car.model;
    car.year         = year         ?? car.year;
    car.color        = color        ?? car.color;
    car.location     = location     ?? car.location;
    car.dailyRate    = dailyRate    ?? car.dailyRate;
    if (typeof isAvailable === 'boolean') car.isAvailable = isAvailable;

    await car.save();
    res.json({ message: 'Fahrzeug erfolgreich aktualisiert', car });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Fahrzeugs:', error.message);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Löscht ein Fahrzeug aus der Datenbank.
 * Nur Admins dürfen diesen Endpunkt aufrufen.
 */
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Fahrzeug nicht gefunden' });

    await car.destroy();
    res.json({ message: 'Fahrzeug erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Fahrzeugs:', error.message);
    res.status(500).json({ message: 'Serverfehler' });
  }
};
