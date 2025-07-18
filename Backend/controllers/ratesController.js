/**
 * Tarif‑Controller für MoveSmart
 *
 * Endpunkte
 *
 * • POST    /api/rates           – Neuen Tarif anlegen (Admin‑geschützt)
 * • GET     /api/rates           – Alle Tarife abrufen
 * • GET     /api/rates/:id       – Einzelnen Tarif abrufen
 * • PUT     /api/rates/:id       – Tarif aktualisieren (Admin‑geschützt)
 * • DELETE  /api/rates/:id       – Tarif löschen (Admin‑geschützt)
 *
 * Abhängigkeiten
 * • Sequelize‑Model  – Rates (Datenbankzugriff)
 */
import Rates from '../models/Rates.js';

/**
 * Legt einen neuen Tarif an.
 * Erwartet: { name, pricePerHour, description }
 */
export const createRate = async (req, res) => {
  try {
    const { name, pricePerHour, description } = req.body;

    if (!name || pricePerHour === undefined || pricePerHour === null)
      return res.status(400).json({ message: 'Name und Preis pro Stunde sind erforderlich.' });

    if (isNaN(parseFloat(pricePerHour)))
      return res.status(400).json({ message: 'Preis pro Stunde muss eine gültige Zahl sein.' });

    const newRate = await Rates.create({
      name,
      pricePerHour: parseFloat(pricePerHour),
      description,
    });

    res.status(201).json({ message: 'Tarif erfolgreich erstellt.', rate: newRate });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ message: 'Ein Tarif mit diesem Namen existiert bereits.' });

    console.error('Fehler beim Erstellen des Tarifs:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Gibt alle Tarife zurück.
 */
export const getAllRates = async (_req, res) => {
  try {
    const rates = await Rates.findAll();
    res.json(rates);
  } catch (error) {
    console.error('Fehler beim Abrufen der Tarife:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Gibt einen einzelnen Tarif anhand seiner ID zurück.
 */
export const getRateById = async (req, res) => {
  try {
    const rate = await Rates.findByPk(req.params.id);
    if (!rate) return res.status(404).json({ message: 'Tarif nicht gefunden.' });
    res.json(rate);
  } catch (error) {
    console.error('Fehler beim Abrufen des Tarifs:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Aktualisiert einen bestehenden Tarif.
 * Nur Felder überschreiben, die im Request‑Body vorhanden sind.
 */
export const updateRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pricePerHour, description } = req.body;

    const rate = await Rates.findByPk(id);
    if (!rate) return res.status(404).json({ message: 'Tarif nicht gefunden.' });

    rate.name        = name        ?? rate.name;
    rate.description = description ?? rate.description;

    if (pricePerHour !== undefined && pricePerHour !== null) {
      if (isNaN(parseFloat(pricePerHour)))
        return res.status(400).json({ message: 'Preis pro Stunde muss eine gültige Zahl sein.' });
      rate.pricePerHour = parseFloat(pricePerHour);
    }

    await rate.save();
    res.json({ message: 'Tarif erfolgreich aktualisiert.', rate });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError')
      return res.status(409).json({ message: 'Ein Tarif mit diesem Namen existiert bereits.' });

    console.error('Fehler beim Aktualisieren des Tarifs:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};

/**
 * Löscht einen Tarif aus der Datenbank.
 */
export const deleteRate = async (req, res) => {
  try {
    const { id } = req.params;
    const rate = await Rates.findByPk(id);
    if (!rate) return res.status(404).json({ message: 'Tarif nicht gefunden.' });

    await rate.destroy();
    res.json({ message: 'Tarif erfolgreich gelöscht.' });
  } catch (error) {
    console.error('Fehler beim Löschen des Tarifs:', error);
    res.status(500).json({ message: 'Serverfehler' });
  }
};
